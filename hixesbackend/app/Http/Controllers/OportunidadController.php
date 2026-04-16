<?php

namespace App\Http\Controllers;

use App\Models\Oportunidad;
use App\Models\OportunidadHistorial;
use App\Models\Cliente;
use App\Models\Usuarios;
use App\Models\CrmAsignacionChat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class OportunidadController extends Controller
{
    private const ETAPAS = [
        'Nuevo lead',
        'Contactado',
        'Cotización enviada',
        'Negociación',
        'Venta cerrada',
    ];

    public function index(Request $request)
    {
        /** @var \App\Models\Usuarios $user */
        $user = auth('api')->user();
        $user->load('roles');
        $rolesNombres = $user->roles->pluck('nombre_rol')->toArray();

        $query = Oportunidad::with(['cliente', 'vendedor', 'servicios'])
            ->whereIn('estado', ['abierta', 'perdida', 'ganada']);

        // VENTAS y ADMIN_EMPRESA solo ven sus propias oportunidades
        $soloMias = in_array('VENTAS', $rolesNombres) || in_array('ADMIN_EMPRESA', $rolesNombres);
        if ($soloMias && !in_array('SUPER_ADMIN', $rolesNombres)) {
            $query->where('vendedor_id', $user->id_usuario);
        }

        // Filtro de fecha: ?desde=YYYY-MM-DD  (por defecto última semana)
        $desde = $request->filled('desde')
            ? \Carbon\Carbon::parse($request->desde)->startOfDay()
            : \Carbon\Carbon::now()->subDays(7)->startOfDay();

        // Si envían desde=all, no aplicamos filtro de fecha
        if ($request->query('desde') !== 'all') {
            $query->where('created_at', '>=', $desde);
        }

        $oportunidades = $query->get()->map(fn($o) => [
                'id'              => $o->id,
                'titulo'          => $o->titulo,
                'descripcion'     => $o->descripcion,
                'fecha_proxima'   => $o->fecha_proxima?->toIso8601String(),
                'valor_estimado'  => (float) $o->valor_estimado,
                'etapa'           => $o->etapa,
                'estado'          => $o->estado,
                'cliente'         => $o->cliente ? [
                    'id'              => $o->cliente->id,
                    'nombre_completo' => $o->cliente->nombre_completo,
                    'dni'             => $o->cliente->dni,
                    'correo'          => $o->cliente->correo,
                    'telefono'        => $o->cliente->telefono,
                    'empresa'         => $o->cliente->empresa,
                ] : null,
                'vendedor'        => $o->vendedor ? [
                    'id'             => $o->vendedor->id_usuario,
                    'nombre_completo' => $o->vendedor->nombre_completo,
                ] : null,
                'servicios'       => $o->servicios->map(fn($s) => [
                    'id'          => $s->id,
                    'tratamiento' => $s->tratamiento,
                    'precio_base' => (float) $s->precio_base,
                    'cantidad'    => (int) ($s->pivot->cantidad ?? 1),
                ])->values(),
                'created_at' => $o->created_at,
            ]);

        return response()->json($oportunidades);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cliente_id'      => 'required|exists:clientes,id',
            'vendedor_id'     => 'nullable|exists:usuarios,id_usuario',
            'titulo'          => 'required|string|max:255',
            'descripcion'     => 'nullable|string',
            'fecha_proxima'   => 'nullable|date',
            'valor_estimado'  => 'nullable|numeric|min:0',
            'etapa'           => 'nullable|string|max:100',
            'servicios_ids'   => 'nullable|array',
            'servicios_ids.*' => 'integer|exists:servicios,id',
            'servicios'       => 'nullable|array',
            'servicios.*.id'  => 'required_with:servicios|integer|exists:servicios,id',
            'servicios.*.cantidad' => 'required_with:servicios|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $etapaInicial = $request->etapa ?? 'Nuevo lead';

        $oportunidad = Oportunidad::create([
            'cliente_id'     => $request->cliente_id,
            'vendedor_id'    => $request->vendedor_id,
            'titulo'         => $request->titulo,
            'descripcion'    => $request->descripcion,
            'fecha_proxima'  => $request->fecha_proxima,
            'valor_estimado' => $request->valor_estimado ?? 0,
            'etapa'          => $etapaInicial,
            'estado'         => 'abierta',
        ]);

        if (!empty($request->servicios)) {
            $syncData = [];
            foreach ($request->servicios as $item) {
                $syncData[$item['id']] = ['cantidad' => $item['cantidad']];
            }
            $oportunidad->servicios()->sync($syncData);
        } elseif (!empty($request->servicios_ids)) {
            $syncData = [];
            foreach ($request->servicios_ids as $id) {
                $syncData[$id] = ['cantidad' => 1];
            }
            $oportunidad->servicios()->sync($syncData);
        }

        // Registrar creación en historial
        OportunidadHistorial::create([
            'oportunidad_id' => $oportunidad->id,
            'usuario_id'     => auth('api')->id(),
            'etapa_anterior' => null,
            'etapa_nueva'    => $etapaInicial,
            'estado_anterior'=> null,
            'estado_nuevo'   => 'abierta',
            'accion'         => 'creacion',
        ]);

        $oportunidad->load(['cliente', 'vendedor', 'servicios']);

        return response()->json([
            'id'             => $oportunidad->id,
            'titulo'         => $oportunidad->titulo,
            'descripcion'    => $oportunidad->descripcion,
            'fecha_proxima'  => $oportunidad->fecha_proxima?->toIso8601String(),
            'valor_estimado' => (float) $oportunidad->valor_estimado,
            'etapa'          => $oportunidad->etapa,
            'estado'         => $oportunidad->estado,
            'cliente'        => $oportunidad->cliente ? [
                'id'              => $oportunidad->cliente->id,
                'nombre_completo' => $oportunidad->cliente->nombre_completo,
                'dni'             => $oportunidad->cliente->dni,
                'correo'          => $oportunidad->cliente->correo,
                'telefono'        => $oportunidad->cliente->telefono,
                'empresa'         => $oportunidad->cliente->empresa,
            ] : null,
            'vendedor'       => $oportunidad->vendedor ? [
                'id'              => $oportunidad->vendedor->id_usuario,
                'nombre_completo' => $oportunidad->vendedor->nombre_completo,
            ] : null,
            'servicios'      => $oportunidad->servicios->map(fn($s) => [
                'id'          => $s->id,
                'tratamiento' => $s->tratamiento,
                'precio_base' => (float) $s->precio_base,
                'cantidad'    => (int) ($s->pivot->cantidad ?? 1),
            ])->values(),
        ], 201);
    }

    public function updateEtapa(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'etapa' => 'required|string|max:100',
            'nota'  => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oportunidad    = Oportunidad::findOrFail($id);
        $etapaAnterior  = $oportunidad->etapa;
        $oportunidad->etapa = $request->etapa;

        // Al llegar a "Venta cerrada" se marca como ganada automáticamente
        $estadoAnterior = $oportunidad->estado;
        if ($request->etapa === 'Venta cerrada') {
            $oportunidad->estado = 'ganada';
        }

        $oportunidad->save();

        // Liberar chat asignado
        if ($request->etapa === 'Venta cerrada') {
            $this->liberarChatDeOportunidad($oportunidad);
        }

        OportunidadHistorial::create([
            'oportunidad_id' => $oportunidad->id,
            'usuario_id'     => auth('api')->id(),
            'etapa_anterior' => $etapaAnterior,
            'etapa_nueva'    => $request->etapa,
            'estado_anterior'=> $estadoAnterior,
            'estado_nuevo'   => $oportunidad->estado,
            'accion'         => 'cambio_etapa',
            'notas'          => $request->nota,
        ]);

        return response()->json(['etapa' => $oportunidad->etapa]);
    }

    public function updateEtapaConArchivos(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'etapa'       => 'required|string|max:100',
            'nota'        => 'nullable|string|max:2000',
            'archivos'    => 'nullable|array',
            'archivos.*'  => 'file|mimes:jpg,jpeg,png,gif,webp,pdf|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oportunidad   = Oportunidad::findOrFail($id);
        $etapaAnterior = $oportunidad->etapa;
        $oportunidad->etapa = $request->etapa;
        $oportunidad->save();

        $archivosData = [];
        if ($request->hasFile('archivos')) {
            foreach ($request->file('archivos') as $file) {
                $path = $file->store('historial', 'public');
                $archivosData[] = [
                    'nombre' => $file->getClientOriginalName(),
                    'url'    => config('app.url') . Storage::url($path),
                ];
            }
        }

        OportunidadHistorial::create([
            'oportunidad_id' => $oportunidad->id,
            'usuario_id'     => auth('api')->id(),
            'etapa_anterior' => $etapaAnterior,
            'etapa_nueva'    => $request->etapa,
            'accion'         => 'cambio_etapa',
            'notas'          => $request->nota,
            'archivos'       => empty($archivosData) ? null : $archivosData,
        ]);

        return response()->json(['etapa' => $oportunidad->etapa]);
    }

    public function updateEstado(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'estado' => 'required|in:abierta,ganada,perdida',
            'motivo' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oportunidad     = Oportunidad::findOrFail($id);
        $estadoAnterior  = $oportunidad->estado;
        $oportunidad->estado = $request->estado;
        $oportunidad->save();

        // Si la oportunidad se marca como "perdida", liberar chat asignado
        if ($request->estado === 'perdida') {
            $this->liberarChatDeOportunidad($oportunidad);
        }

        OportunidadHistorial::create([
            'oportunidad_id' => $oportunidad->id,
            'usuario_id'     => auth('api')->id(),
            'etapa_anterior' => $oportunidad->etapa,
            'etapa_nueva'    => $oportunidad->etapa,
            'estado_anterior'=> $estadoAnterior,
            'estado_nuevo'   => $request->estado,
            'accion'         => 'cambio_estado',
            'notas'          => $request->motivo,
        ]);

        return response()->json(['estado' => $oportunidad->estado]);
    }

    // ─── Helper: liberar chat asignado al teléfono del cliente ─────────────────
    private function liberarChatDeOportunidad(Oportunidad $oportunidad): void
    {
        $oportunidad->load('cliente');
        $telefono = $oportunidad->cliente?->telefono;
        if (!$telefono) return;

        $digits = preg_replace('/\D/', '', $telefono);
        CrmAsignacionChat::where('contact_phone', 'like', "%{$digits}%")
            ->update(['estado' => 'liberado']);
    }

    // ─── GET /oportunidades/{id}/historial ─────────────────────────────────────
    public function historial(int $id)
    {
        Oportunidad::findOrFail($id); // 404 si no existe

        $historial = OportunidadHistorial::with('usuario')
            ->where('oportunidad_id', $id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($h) => [
                'id'              => $h->id,
                'accion'          => $h->accion,
                'etapa_anterior'  => $h->etapa_anterior,
                'etapa_nueva'     => $h->etapa_nueva,
                'estado_anterior' => $h->estado_anterior,
                'estado_nuevo'    => $h->estado_nuevo,
                'notas'           => $h->notas,
                'archivos'        => $h->archivos,
                'created_at'      => $h->created_at?->format('Y-m-d H:i:s'),
                'usuario'         => $h->usuario ? [
                    'id'             => $h->usuario->id_usuario,
                    'nombre_completo'=> $h->usuario->nombre_completo,
                ] : null,
            ]);

        return response()->json($historial);
    }

    // ─── PATCH /clientes/{id}/contacto ─────────────────────────────────────────
    public function updateClienteContacto(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'nombre_completo' => 'nullable|string|max:255',
            'dni'             => 'nullable|string|max:30',
            'correo'          => 'nullable|email|max:255',
            'telefono'        => 'nullable|string|max:30',
            'empresa'         => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cliente = Cliente::findOrFail($id);

        if ($request->filled('nombre_completo')) {
            $cliente->nombre_completo = $request->nombre_completo;
        }
        if ($request->filled('dni')) {
            $cliente->dni = $request->dni;
        }
        if ($request->filled('correo')) {
            $cliente->correo = $request->correo;
        }
        if ($request->filled('telefono')) {
            $cliente->telefono = $request->telefono;
        }
        if ($request->has('empresa')) {
            $cliente->empresa = $request->empresa ?: null;
        }

        // Asignar sede del trabajador si el cliente aún no tiene sede
        if (!$cliente->sede_id) {
            $user = auth('api')->user();
            if ($user && $user->sede_id) {
                $cliente->sede_id = $user->sede_id;
            }
        }

        $cliente->save();

        return response()->json([
            'id'              => $cliente->id,
            'nombre_completo' => $cliente->nombre_completo,
            'correo'          => $cliente->correo,
            'telefono'        => $cliente->telefono,
        ]);
    }
}
