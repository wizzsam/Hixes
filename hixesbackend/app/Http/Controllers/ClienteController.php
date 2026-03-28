<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cliente;
use App\Models\Transaccion;
use App\Models\Nivel;
use App\Models\BonoWallet;
use Carbon\Carbon;

class ClienteController extends Controller
{
    private function getNivelObj($empresaId, $consumo)
    {
        return Nivel::whereHas('empresas', function ($q) use ($empresaId) {
                $q->where('empresas.id', $empresaId);
            })
            ->where('consumo_minimo', '<=', $consumo)
            ->orderByDesc('consumo_minimo')
            ->first();
    }

    private function getBonoObj($empresaId, $monto)
    {
        return BonoWallet::whereHas('empresas', function ($q) use ($empresaId) {
                $q->where('empresas.id', $empresaId);
            })
            ->where('monto_minimo', '<=', $monto)
            ->where(function ($query) use ($monto) {
                $query->whereNull('monto_maximo')
                      ->orWhere('monto_maximo', '>=', $monto);
            })
            ->first();
    }

    private function limpiarVencidos(Cliente $cliente)
    {
        $ahora = Carbon::now();
        $cambiado = false;

        // ── Wallet expirado ────────────────────────────────────────
        if ($cliente->wallet > 0 && $cliente->wallet_vence && $cliente->wallet_vence->lt($ahora)) {
            Transaccion::create([
                'cliente_id'  => $cliente->id,
                'sede_id'     => $cliente->sede_id,
                'tipo'        => 'wallet_expirado',
                'descripcion' => "Wallet expirado automáticamente: se perdieron S/{$cliente->wallet}",
                'monto'       => $cliente->wallet,
            ]);
            $cliente->wallet       = 0;
            $cliente->wallet_vence = null;
            $cambiado = true;
        }

        // ── Cashbacks individuales expirados ───────────────────────
        $cashbacksTx = Transaccion::where('cliente_id', $cliente->id)
            ->where('tipo', 'cashback')
            ->where('expirado', false)
            ->whereNotNull('vence_at')
            ->where('vence_at', '<', $ahora)
            ->get();

        foreach ($cashbacksTx as $txCb) {
            $txCb->expirado = true;
            $txCb->save();

            $montoExpirado = min((float)$txCb->monto, max(0.0, (float)$cliente->cashback));
            if ($montoExpirado > 0) {
                Transaccion::create([
                    'cliente_id'  => $cliente->id,
                    'sede_id'     => $cliente->sede_id,
                    'tipo'        => 'cashback_expirado',
                    'descripcion' => "Cashback expirado automáticamente: S/{$txCb->monto}",
                    'monto'       => $montoExpirado,
                ]);
            }
            $cliente->cashback = max(0, (float)$cliente->cashback - (float)$txCb->monto);
            $cambiado = true;
        }

        if ((float)$cliente->cashback <= 0) {
            $cliente->cashback       = 0;
            $cliente->cashback_vence = null;
        }

        if ($cambiado) {
            $cliente->save();
        }

        return $cliente;
    }

    public function index(Request $request)
    {
        $user = auth('api')->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $clientes = Cliente::with('sede')
            ->where('empresa_id', $user->empresa_id)
            ->get();

        foreach ($clientes as $c) {
            $this->limpiarVencidos($c);
        }

        return response()->json($clientes);
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();

        $sedeId = $request->header('X-Sede-Id') ?? $user->sede_id;

        $request->validate([
            'nombre_completo' => 'required|string|max:255',
            'dni'             => 'required|digits:8|unique:clientes,dni,NULL,id,empresa_id,' . $user->empresa_id,
            'telefono'        => 'required|digits:9',
            'correo'          => 'nullable|email|max:255',
        ], [
            'dni.unique' => 'Ya existe un cliente registrado con ese DNI en esta empresa.',
        ]);

        $validated = $request->only(['nombre_completo', 'dni', 'telefono', 'correo']);
        $validated['empresa_id'] = $user->empresa_id;
        $validated['sede_id']    = $sedeId;

        $cliente = Cliente::with('sede')->find(Cliente::create($validated)->id);

        return response()->json($cliente, 201);
    }

    public function registroPublico(Request $request)
    {
        $request->validate([
            'nombre_completo' => 'required|string|max:255',
            'dni'             => 'required|digits:8',
            'telefono'        => 'required|digits:9',
            'correo'          => 'nullable|email|max:255',
            'sede_id'         => 'required|exists:sedes,id',
        ], [
            'dni.unique'    => 'Ya existe un cliente registrado con ese DNI.',
            'sede_id.exists' => 'La sede seleccionada no existe.',
        ]);

        $sede = \App\Models\Sede::findOrFail($request->sede_id);

        // Verificar unicidad por empresa
        $existe = Cliente::where('empresa_id', $sede->empresa_id)
            ->where('dni', $request->dni)
            ->exists();

        if ($existe) {
            return response()->json([
                'message' => 'Ya existe un cliente registrado con ese DNI.',
                'errors'  => ['dni' => ['Ya existe un cliente registrado con ese DNI.']],
            ], 422);
        }

        $validated = $request->only(['nombre_completo', 'dni', 'telefono', 'correo']);
        $validated['empresa_id'] = $sede->empresa_id;
        $validated['sede_id']    = $sede->id;

        $cliente = Cliente::with('sede')->find(Cliente::create($validated)->id);

        return response()->json($cliente, 201);
    }

    public function show(Request $request, $id)
    {
        $user = auth('api')->user();

        $cliente = Cliente::with('sede')
            ->where('empresa_id', $user->empresa_id)
            ->findOrFail($id);
        $this->limpiarVencidos($cliente);

        $transacciones = $cliente->transacciones()->with('sede')->orderByDesc('created_at')->get();

        return response()->json([
            'cliente' => $cliente,
            'transacciones' => $transacciones
        ]);
    }

    public function recargarWallet(Request $request, $id)
    {
        $user = auth('api')->user();
        $sedeIdContexto = $request->header('X-Sede-Id') ?? $user->sede_id;
        $cliente = Cliente::where('empresa_id', $user->empresa_id)->findOrFail($id);
        $this->limpiarVencidos($cliente);

        $request->validate(['monto' => 'required|numeric|min:0.01']);
        $montoBase = (float)$request->monto;

        $bonoObj = $this->getBonoObj($user->empresa_id, $montoBase);
        $porcentajeBono = $bonoObj ? (float)$bonoObj->bono_porcentaje : 0.00;
        
        $montoBono = round(($montoBase * $porcentajeBono) / 100, 2);
        $montoTotal = $montoBase + $montoBono;

        $cliente->wallet += $montoTotal;
        $cliente->wallet_vence = Carbon::now()->addMonths(12);
        $cliente->save();

        Transaccion::create([
            'cliente_id' => $cliente->id,
            'sede_id' => $sedeIdContexto,
            'tipo' => 'recarga_wallet',
            'descripcion' => "Recarga de Wallet. Base: S/{$montoBase} + Bono: S/{$montoBono} ({$porcentajeBono}%)",
            'monto' => $montoBase,
        ]);

        return response()->json($cliente);
    }

    public function registrarConsumo(Request $request, $id)
    {
        $user = auth('api')->user();
        $sedeIdContexto = $request->header('X-Sede-Id') ?? $user->sede_id;
        $cliente = Cliente::where('empresa_id', $user->empresa_id)->findOrFail($id);
        $this->limpiarVencidos($cliente);

        $request->validate([
            'monto' => 'required|numeric|min:0.01',
            'servicio' => 'required|string'
        ]);

        $monto = (float)$request->monto;

        $nivelObj = $this->getNivelObj($user->empresa_id, $cliente->consumo_acumulado);
        $cashbackGanado = round(($monto * $nivelObj->cashback_porcentaje) / 100, 2);

        $cliente->consumo_acumulado += $monto;
        $cliente->cashback           += $cashbackGanado;  // acumula, no reemplaza
        $cliente->cashback_vence      = Carbon::now()->addDays($nivelObj->vigencia_dias);
        $cliente->save();

        Transaccion::create([
            'cliente_id'  => $cliente->id,
            'sede_id'     => $sedeIdContexto,
            'tipo'        => 'consumo',
            'descripcion' => "Pago de servicio en efectivo: {$request->servicio}",
            'monto'       => $monto,
        ]);

        if ($cashbackGanado > 0) {
            Transaccion::create([
                'cliente_id'  => $cliente->id,
                'sede_id'     => $sedeIdContexto,
                'tipo'        => 'cashback',
                'descripcion' => "Cashback generado ({$nivelObj->cashback_porcentaje}%): {$request->servicio}",
                'monto'       => $cashbackGanado,
                'vence_at'    => Carbon::now()->addDays($nivelObj->vigencia_dias),
            ]);
        }

        return response()->json($cliente);
    }

    public function update(Request $request, $id)
    {
        $user = auth('api')->user();
        $cliente = Cliente::where('empresa_id', $user->empresa_id)->findOrFail($id);

        $request->validate([
            'nombre_completo' => 'required|string|max:255',
            'dni'             => 'required|digits:8',
            'telefono'        => 'required|digits:9',
            'correo'          => 'nullable|email|max:255',
        ]);

        $cliente->update($request->only(['nombre_completo', 'dni', 'telefono', 'correo']));

        return response()->json($cliente->fresh(['sede']));
    }

    public function toggleEstado(Request $request, $id)
    {
        $user = auth('api')->user();
        $cliente = Cliente::where('empresa_id', $user->empresa_id)->findOrFail($id);
        $cliente->estado = !$cliente->estado;
        $cliente->save();
        return response()->json($cliente->load('sede'));
    }

    public function pagarConSaldo(Request $request, $id)
    {
        $user = auth('api')->user();
        $sedeIdContexto = $request->header('X-Sede-Id') ?? $user->sede_id;
        $cliente = Cliente::where('empresa_id', $user->empresa_id)->findOrFail($id);
        $this->limpiarVencidos($cliente);

        $request->validate([
            'monto_total' => 'required|numeric|min:0.01',
            'servicio' => 'required|string',
            'wallet_deducido' => 'required|numeric|min:0',
            'cashback_deducido' => 'required|numeric|min:0',
        ]);

        $montoTotal = (float)$request->monto_total;
        $walletDeducido = (float)$request->wallet_deducido;
        $cashbackDeducido = (float)$request->cashback_deducido;

        // Validaciones de seguridad
        if ($walletDeducido > $cliente->wallet) $walletDeducido = $cliente->wallet;
        if ($cashbackDeducido > $cliente->cashback) $cashbackDeducido = $cliente->cashback;

        // Cálculos
        $efectivoPagado = $montoTotal - $walletDeducido - $cashbackDeducido;
        $montoParaCashback = $montoTotal - $cashbackDeducido;

        $nivelObj = $this->getNivelObj($user->empresa_id, $cliente->consumo_acumulado);
        $cashbackGenerado = round(($montoParaCashback * $nivelObj->cashback_porcentaje) / 100, 2);

        // Limpiar wallet_vence si se vacía
        $cliente->wallet -= $walletDeducido;
        if ($cliente->wallet <= 0) {
            $cliente->wallet = 0;
            $cliente->wallet_vence = null;
        }

        $cliente->consumo_acumulado += ($walletDeducido + $efectivoPagado);

        // Deducir cashback usado y acumular el nuevo generado
        $cliente->cashback -= $cashbackDeducido;
        if ($cliente->cashback < 0) $cliente->cashback = 0;

        // ── Marcar cashbacks individuales como consumidos (FIFO) ──
        if ($cashbackDeducido > 0) {
            $pendiente = $cashbackDeducido;
            $cashbacksTx = Transaccion::where('cliente_id', $cliente->id)
                ->where('tipo', 'cashback')
                ->where('expirado', false)
                ->where('consumido', false)
                ->whereNotNull('vence_at')
                ->orderBy('vence_at', 'asc')
                ->get();

            foreach ($cashbacksTx as $txCb) {
                if ($pendiente <= 0) break;
                $txCb->consumido = true;
                $txCb->save();
                $pendiente -= (float)$txCb->monto;
            }
        }

        if ($cashbackGenerado > 0) {
            $cliente->cashback       += $cashbackGenerado;
            $cliente->cashback_vence  = Carbon::now()->addDays($nivelObj->vigencia_dias);
        }

        $cliente->save();

        Transaccion::create([
            'cliente_id'  => $cliente->id,
            'sede_id'     => $sedeIdContexto,
            'tipo'        => 'pago_saldo',
            'descripcion' => "Pago de servicio: {$request->servicio}. Wallet: -S/{$walletDeducido}. Cashback: -S/{$cashbackDeducido}",
            'monto'       => $montoTotal,
        ]);

        if ($cashbackGenerado > 0) {
            Transaccion::create([
                'cliente_id'  => $cliente->id,
                'sede_id'     => $sedeIdContexto,
                'tipo'        => 'cashback',
                'descripcion' => "Cashback generado ({$nivelObj->cashback_porcentaje}%): {$request->servicio}",
                'monto'       => $cashbackGenerado,
                'vence_at'    => Carbon::now()->addDays($nivelObj->vigencia_dias),
            ]);
        }

        return response()->json($cliente);
    }
}
