<?php

namespace App\Console\Commands;

use App\Models\Cliente;
use App\Models\MensajeWhatsapp;
use App\Models\RecordatorioCashback;
use App\Models\Transaccion;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Twilio\Http\CurlClient;
use Twilio\Rest\Client as TwilioClient;

class EnviarRecordatoriosCashback extends Command
{
    protected $signature   = 'cashback:recordatorios';
    protected $description = 'Envía recordatorios de cashback y wallet por vencer a los clientes vía WhatsApp';

    public function handle(): int
    {
        $ahora = Carbon::now();

        $recordatoriosPorEmpresa = RecordatorioCashback::where('activo', true)
            ->get()
            ->groupBy('empresa_id');

        $totalEnviados = 0;

        foreach ($recordatoriosPorEmpresa as $empresaId => $recordatorios) {
            foreach ($recordatorios as $recordatorio) {
                $diasAntes  = (int) $recordatorio->dias_antes;
                $tipoSaldo  = $recordatorio->tipo_saldo ?? 'cashback';

                if (in_array($tipoSaldo, ['cashback', 'ambos'])) {
                    $totalEnviados += $this->procesarCashback($recordatorio, $empresaId, $diasAntes, $ahora);
                }

                if (in_array($tipoSaldo, ['wallet', 'ambos'])) {
                    $totalEnviados += $this->procesarWallet($recordatorio, $empresaId, $diasAntes, $ahora);
                }
            }
        }

        $this->info("Recordatorios enviados: {$totalEnviados}");
        return self::SUCCESS;
    }

    // ─── Cashback (por transacción) ────────────────────────────────────────────

    private function procesarCashback(RecordatorioCashback $recordatorio, int $empresaId, int $diasAntes, Carbon $ahora): int
    {
        // Buscar transacciones de cashback NO expiradas, en ventana de vencimiento,
        // y que aún NO hayan recibido recordatorio en esta ventana (de-dup por transacción).
        $transacciones = Transaccion::where('tipo', 'cashback')
            ->where('expirado', false)
            ->whereNotNull('vence_at')
            ->whereRaw('DATE(vence_at) >= CURDATE()')
            ->whereRaw('DATE(DATE_SUB(vence_at, INTERVAL ? DAY)) <= CURDATE()', [$diasAntes])
            ->where(function ($q) use ($diasAntes) {
                $q->whereNull('recordatorio_at')
                  ->orWhereRaw('DATE(recordatorio_at) < DATE(DATE_SUB(vence_at, INTERVAL ? DAY))', [$diasAntes]);
            })
            ->whereHas('cliente', function ($q) use ($empresaId) {
                $q->where('empresa_id', $empresaId)->where('cashback', '>', 0);
            })
            ->with('cliente')
            ->get();

        $enviados = 0;

        foreach ($transacciones as $txn) {
            $cliente = $txn->cliente;

            if (!$cliente) {
                continue;
            }

            if ($this->enviarMensaje($recordatorio, $cliente, $txn->vence_at, $txn->monto)) {
                // Actualizar con lockForUpdate simulado: re-verificar antes de guardar
                $fresh = Transaccion::find($txn->id);
                if ($fresh && $fresh->recordatorio_at === null) {
                    $fresh->recordatorio_at = $ahora;
                    $fresh->save();
                    $enviados++;
                }
            }
        }

        return $enviados;
    }

    // ─── Wallet (por cliente usando wallet_vence) ──────────────────────────────

    private function procesarWallet(RecordatorioCashback $recordatorio, int $empresaId, int $diasAntes, Carbon $ahora): int
    {
        $clientes = Cliente::where('empresa_id', $empresaId)
            ->where('wallet', '>', 0)
            ->whereNotNull('wallet_vence')
            ->whereRaw('DATE(wallet_vence) >= CURDATE()')
            ->whereRaw('DATE(DATE_SUB(wallet_vence, INTERVAL ? DAY)) <= CURDATE()', [$diasAntes])
            ->where(function ($q) use ($diasAntes) {
                $q->whereNull('wallet_recordatorio_at')
                  ->orWhereRaw('DATE(wallet_recordatorio_at) < DATE(DATE_SUB(wallet_vence, INTERVAL ? DAY))', [$diasAntes]);
            })
            ->get();

        $enviados = 0;

        foreach ($clientes as $cliente) {
            if ($this->enviarMensaje($recordatorio, $cliente, $cliente->wallet_vence, $cliente->wallet)) {
                $cliente->wallet_recordatorio_at = $ahora;
                $cliente->save();
                $enviados++;
            }
        }

        return $enviados;
    }

    // ─── Envío Twilio ──────────────────────────────────────────────────────────

    private function enviarMensaje(RecordatorioCashback $recordatorio, Cliente $cliente, mixed $venceAt, mixed $monto): bool
    {
        if (!$cliente->telefono) {
            Log::warning('cashback:recordatorios — cliente sin teléfono', ['cliente_id' => $cliente->id]);
            return false;
        }

        $mensaje = $this->resolverPlantilla($recordatorio->mensaje_plantilla, $cliente, $venceAt, $monto);

        $rawPhone = preg_replace('/^\+?51/', '', $cliente->telefono);
        $toPhone  = 'whatsapp:+51' . $rawPhone;

        try {
            $sid    = env('TWILIO_SID');
            $token  = env('TWILIO_AUTH_TOKEN');
            $from   = 'whatsapp:' . env('TWILIO_WHATSAPP_NUMBER');

            $httpClient = new CurlClient([
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
            ]);
            $twilio = new TwilioClient($sid, $token, null, null, $httpClient);

            $twilioMsg = $twilio->messages->create($toPhone, [
                'from' => $from,
                'body' => $mensaje,
            ]);

            MensajeWhatsapp::create([
                'from_phone'   => $from,
                'to_phone'     => $toPhone,
                'message_body' => $mensaje,
                'message_sid'  => $twilioMsg->sid,
                'direction'    => 'outbound',
                'is_read'      => true,
            ]);

            Log::info('cashback:recordatorios — enviado', [
                'cliente_id'  => $cliente->id,
                'tipo_saldo'  => $recordatorio->tipo_saldo,
                'telefono'    => $toPhone,
                'vence_at'    => $venceAt,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('cashback:recordatorios — error Twilio', [
                'cliente_id' => $cliente->id,
                'error'      => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Variables disponibles:
     *   {nombre}  → nombre_completo del cliente
     *   {monto}   → saldo (cashback o wallet) en S/X.XX
     *   {vence}   → fecha de vencimiento (DD/MM/YYYY)
     *   {dias}    → días restantes para vencer
     */
    private function resolverPlantilla(string $plantilla, Cliente $cliente, mixed $venceAt, mixed $monto): string
    {
        $diasRestantes = max(0, (int) Carbon::today()->diffInDays(Carbon::parse($venceAt)->startOfDay(), false));

        return str_replace(
            ['{nombre}', '{monto}', '{vence}', '{dias}'],
            [
                $cliente->nombre_completo,
                'S/' . number_format((float) $monto, 2),
                Carbon::parse($venceAt)->format('d/m/Y'),
                $diasRestantes,
            ],
            $plantilla
        );
    }
}
