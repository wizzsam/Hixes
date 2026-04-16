<?php

namespace App\Console\Commands;

use App\Models\Campana;
use App\Models\CampanaCliente;
use App\Models\MensajeWhatsapp;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Twilio\Http\CurlClient;
use Twilio\Rest\Client as TwilioClient;

class EnviarRecordatoriosCampana extends Command
{
    protected $signature   = 'campana:recordatorios';
    protected $description = 'Envía recordatorios de campañas activas a clientes asociados vía WhatsApp';

    public function handle(): int
    {
        $ahora = Carbon::now();
        $today = Carbon::today()->toDateString();

        // Solo campañas vigentes con mensaje y frecuencia configurados
        $campanas = Campana::with(['etapas', 'empresa'])
            ->where('activo', true)
            ->where('fecha_inicio', '<=', $today)
            ->where('fecha_fin', '>=', $today)
            ->whereNotNull('mensaje_recordatorio')
            ->whereNotNull('frecuencia_recordatorio')
            ->get();

        $totalEnviados = 0;

        foreach ($campanas as $campana) {
            $totalEnviados += $this->procesarCampana($campana, $ahora);
        }

        $this->info("Recordatorios de campañas enviados: {$totalEnviados}");
        return Command::SUCCESS;
    }

    private function procesarCampana(Campana $campana, Carbon $ahora): int
    {
        $frecuencia = $campana->frecuencia_recordatorio;

        $pivots = CampanaCliente::where('campana_id', $campana->id)
            ->with('cliente')
            ->get();

        $enviados = 0;

        foreach ($pivots as $pivot) {
            $cliente = $pivot->cliente;
            if (!$cliente || !$cliente->telefono) {
                continue;
            }

            // ── Verificar si ya fue enviado según la frecuencia ─────────────
            if ($pivot->recordatorio_enviado_at !== null) {
                $ultimoEnvio = Carbon::parse($pivot->recordatorio_enviado_at);

                if ($frecuencia === 'una_vez') {
                    continue; // Ya fue enviado, no enviar más
                }
                if ($frecuencia === 'semanal' && $ultimoEnvio->diffInDays($ahora) < 7) {
                    continue;
                }
                if ($frecuencia === 'quincenal' && $ultimoEnvio->diffInDays($ahora) < 15) {
                    continue;
                }
            }

            // ── Enviar mensaje ───────────────────────────────────────────────
            $mensaje = $this->resolverPlantilla($campana->mensaje_recordatorio, $cliente->nombre_completo, $campana->nombre);

            if ($this->enviarWhatsApp($mensaje, $cliente->telefono, $campana)) {
                $pivot->recordatorio_enviado_at = $ahora;
                $pivot->save();
                $enviados++;
            }
        }

        return $enviados;
    }

    private function resolverPlantilla(string $plantilla, string $nombreCliente, string $nombreCampana): string
    {
        return str_replace(
            ['{nombre}', '{campana}'],
            [$nombreCliente, $nombreCampana],
            $plantilla
        );
    }

    private function enviarWhatsApp(string $mensaje, string $telefono, Campana $campana): bool
    {
        try {
            $sid   = env('TWILIO_SID');
            $token = env('TWILIO_AUTH_TOKEN');
            $from  = 'whatsapp:' . env('TWILIO_WHATSAPP_NUMBER');

            $rawPhone = preg_replace('/^\+?51/', '', $telefono);
            $toPhone  = 'whatsapp:+51' . $rawPhone;

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

            Log::info('campana:recordatorios — enviado', [
                'campana_id' => $campana->id,
                'telefono'   => $toPhone,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('campana:recordatorios — error Twilio', [
                'campana_id' => $campana->id,
                'telefono'   => $telefono,
                'error'      => $e->getMessage(),
            ]);
            return false;
        }
    }
}
