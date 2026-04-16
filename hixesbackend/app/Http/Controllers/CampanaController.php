<?php

namespace App\Http\Controllers;

use App\Models\Campana;
use App\Models\CampanaEtapa;
use App\Models\CampanaCliente;
use App\Models\Cliente;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CampanaController extends Controller
{
    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function getEmpresaId(): ?int
    {
        /** @var \App\Models\Usuarios $user */
        $user = auth('api')->user();
        if ($user->empresa_id) {
            return (int) $user->empresa_id;
        }
        // Para usuarios con sede (VENTAS, TRABAJADOR)
        if ($user->sede_id) {
            return (int) DB::table('sedes')->where('id', $user->sede_id)->value('empresa_id');
        }
        return null;
    }

    private function isSuperAdmin(): bool
    {
        $user = auth('api')->user();
        $user->load('roles');
        return $user->roles->pluck('nombre_rol')->contains('SUPER_ADMIN');
    }

    private function formatCampana(Campana $c): array
    {
        $c->loadMissing(['etapas', 'empresa']);
        return [
            'id'                     => $c->id,
            'empresa_id'             => $c->empresa_id,
            'empresa_nombre'         => $c->empresa?->nombre ?? null,
            'nombre'                 => $c->nombre,
            'descripcion'            => $c->descripcion,
            'fecha_inicio'           => $c->fecha_inicio?->format('Y-m-d'),
            'fecha_fin'              => $c->fecha_fin?->format('Y-m-d'),
            'mensaje_recordatorio'   => $c->mensaje_recordatorio,
            'frecuencia_recordatorio'=> $c->frecuencia_recordatorio,
            'activo'                 => $c->activo,
            'vigente'                => $c->vigente,
            'total_clientes'         => $c->clientePivots()->count(),
            'etapas'                 => $c->etapas->map(fn($e) => [
                'id'     => $e->id,
                'nombre' => $e->nombre,
                'orden'  => $e->orden,
                'color'  => $e->color,
                'total'  => $e->clientePivots()->count(),
            ])->values(),
        ];
    }

    // ─── CRUD Campañas ────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $query = Campana::with(['empresa', 'etapas']);

        if ($this->isSuperAdmin()) {
            if ($request->filled('empresa_id')) {
                $query->where('empresa_id', $request->empresa_id);
            }
        } else {
            $empresaId = $this->getEmpresaId();
            if (!$empresaId) {
                return response()->json(['error' => 'No se pudo determinar la empresa'], 403);
            }
            $query->where('empresa_id', $empresaId);
        }

        if ($request->boolean('solo_activas')) {
            $today = Carbon::today()->toDateString();
            $query->where('activo', true)
                  ->where('fecha_inicio', '<=', $today)
                  ->where('fecha_fin', '>=', $today);
        }

        $campanas = $query->orderByDesc('fecha_inicio')->get();

        return response()->json($campanas->map(fn($c) => $this->formatCampana($c)));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'empresa_id'              => 'required_if_super_admin|nullable|exists:empresas,id',
            'nombre'                  => 'required|string|max:255',
            'descripcion'             => 'nullable|string',
            'fecha_inicio'            => 'required|date',
            'fecha_fin'               => 'required|date|after_or_equal:fecha_inicio',
            'mensaje_recordatorio'    => 'nullable|string',
            'frecuencia_recordatorio' => 'nullable|in:una_vez,semanal,quincenal',
            'activo'                  => 'boolean',
            'etapas'                  => 'nullable|array',
            'etapas.*.nombre'         => 'required_with:etapas|string|max:100',
            'etapas.*.color'          => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($this->isSuperAdmin()) {
            $empresaId = $request->input('empresa_id');
        } else {
            $empresaId = $this->getEmpresaId();
        }

        if (!$empresaId) {
            return response()->json(['error' => 'empresa_id requerido'], 422);
        }

        $campana = Campana::create([
            'empresa_id'              => $empresaId,
            'nombre'                  => $request->nombre,
            'descripcion'             => $request->descripcion,
            'fecha_inicio'            => $request->fecha_inicio,
            'fecha_fin'               => $request->fecha_fin,
            'mensaje_recordatorio'    => $request->mensaje_recordatorio,
            'frecuencia_recordatorio' => $request->frecuencia_recordatorio,
            'activo'                  => $request->boolean('activo', true),
        ]);

        // Crear etapas personalizadas o las 3 por defecto
        $etapas = $request->input('etapas') ?: [
            ['nombre' => 'Interesado',  'color' => '#3b82f6'],
            ['nombre' => 'En proceso',  'color' => '#f59e0b'],
            ['nombre' => 'Convertido',  'color' => '#10b981'],
        ];

        foreach ($etapas as $i => $etapa) {
            CampanaEtapa::create([
                'campana_id' => $campana->id,
                'nombre'     => $etapa['nombre'],
                'orden'      => $i + 1,
                'color'      => $etapa['color'] ?? '#64748b',
            ]);
        }

        $campana->load(['etapas', 'empresa']);
        return response()->json($this->formatCampana($campana), 201);
    }

    public function show(int $id)
    {
        $campana = Campana::with(['etapas', 'empresa'])->findOrFail($id);
        $this->authorizeEmpresa($campana->empresa_id);
        return response()->json($this->formatCampana($campana));
    }

    public function update(Request $request, int $id)
    {
        $campana = Campana::findOrFail($id);
        $this->authorizeEmpresa($campana->empresa_id);

        $validator = Validator::make($request->all(), [
            'nombre'                  => 'sometimes|required|string|max:255',
            'descripcion'             => 'nullable|string',
            'fecha_inicio'            => 'sometimes|required|date',
            'fecha_fin'               => 'sometimes|required|date|after_or_equal:fecha_inicio',
            'mensaje_recordatorio'    => 'nullable|string',
            'frecuencia_recordatorio' => 'nullable|in:una_vez,semanal,quincenal',
            'activo'                  => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $campana->update($request->only([
            'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin',
            'mensaje_recordatorio', 'frecuencia_recordatorio', 'activo',
        ]));

        $campana->load(['etapas', 'empresa']);
        return response()->json($this->formatCampana($campana));
    }

    public function destroy(int $id)
    {
        $campana = Campana::findOrFail($id);
        $this->authorizeEmpresa($campana->empresa_id);
        $campana->delete();
        return response()->json(['message' => 'Campaña eliminada']);
    }

    // ─── Etapas ───────────────────────────────────────────────────────────────

    public function etapas(int $campanaId)
    {
        $campana = Campana::findOrFail($campanaId);
        $this->authorizeEmpresa($campana->empresa_id);
        return response()->json($campana->etapas->map(fn($e) => [
            'id'     => $e->id,
            'nombre' => $e->nombre,
            'orden'  => $e->orden,
            'color'  => $e->color,
            'total'  => $e->clientePivots()->count(),
        ]));
    }

    public function storeEtapa(Request $request, int $campanaId)
    {
        $campana = Campana::findOrFail($campanaId);
        $this->authorizeEmpresa($campana->empresa_id);

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100',
            'color'  => 'nullable|string|max:20',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $maxOrden = CampanaEtapa::where('campana_id', $campanaId)->max('orden') ?? 0;
        $etapa = CampanaEtapa::create([
            'campana_id' => $campanaId,
            'nombre'     => $request->nombre,
            'orden'      => $maxOrden + 1,
            'color'      => $request->color ?? '#64748b',
        ]);

        return response()->json($etapa, 201);
    }

    public function updateEtapa(Request $request, int $campanaId, int $etapaId)
    {
        $etapa = CampanaEtapa::where('campana_id', $campanaId)->findOrFail($etapaId);
        $this->authorizeEmpresa($etapa->campana->empresa_id);

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|required|string|max:100',
            'color'  => 'nullable|string|max:20',
            'orden'  => 'sometimes|integer|min:1',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $etapa->update($request->only(['nombre', 'color', 'orden']));
        return response()->json($etapa);
    }

    public function destroyEtapa(int $campanaId, int $etapaId)
    {
        $etapa = CampanaEtapa::where('campana_id', $campanaId)->findOrFail($etapaId);
        $this->authorizeEmpresa($etapa->campana->empresa_id);

        // Mover clientes de esta etapa a null antes de eliminarla
        CampanaCliente::where('etapa_id', $etapaId)->update(['etapa_id' => null]);
        $etapa->delete();

        return response()->json(['message' => 'Etapa eliminada']);
    }

    // ─── Clientes en Campaña (Kanban) ─────────────────────────────────────────

    public function clientes(int $id)
    {
        $campana = Campana::with(['etapas'])->findOrFail($id);
        $this->authorizeEmpresa($campana->empresa_id);

        $pivots = CampanaCliente::where('campana_id', $id)
            ->with(['cliente', 'etapa'])
            ->get();

        return response()->json([
            'campana' => $this->formatCampana($campana),
            'clientes' => $pivots->map(fn($p) => [
                'pivot_id'  => $p->id,
                'etapa_id'  => $p->etapa_id,
                'cliente'   => [
                    'id'              => $p->cliente->id,
                    'nombre_completo' => $p->cliente->nombre_completo,
                    'dni'             => $p->cliente->dni,
                    'telefono'        => $p->cliente->telefono,
                    'cashback'        => (float) $p->cliente->cashback,
                    'wallet'          => (float) $p->cliente->wallet,
                ],
            ])->values(),
        ]);
    }

    public function agregarCliente(Request $request, int $id)
    {
        $campana = Campana::with('etapas')->findOrFail($id);
        $this->authorizeEmpresa($campana->empresa_id);

        $validator = Validator::make($request->all(), [
            'cliente_id' => 'required|exists:clientes,id',
            'etapa_id'   => 'nullable|exists:campana_etapas,id',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verificar que la etapa pertenece a esta campaña
        $etapaId = $request->etapa_id;
        if ($etapaId) {
            $etapaValida = $campana->etapas->contains('id', $etapaId);
            if (!$etapaValida) {
                return response()->json(['error' => 'La etapa no pertenece a esta campaña'], 422);
            }
        } else {
            // Primera etapa por defecto
            $etapaId = $campana->etapas->first()?->id;
        }

        $pivot = CampanaCliente::firstOrCreate(
            ['campana_id' => $id, 'cliente_id' => $request->cliente_id],
            ['etapa_id' => $etapaId]
        );

        return response()->json(['pivot_id' => $pivot->id, 'etapa_id' => $pivot->etapa_id], 201);
    }

    public function removerCliente(int $id, int $clienteId)
    {
        $campana = Campana::findOrFail($id);
        $this->authorizeEmpresa($campana->empresa_id);

        CampanaCliente::where('campana_id', $id)
            ->where('cliente_id', $clienteId)
            ->delete();

        return response()->json(['message' => 'Cliente removido de la campaña']);
    }

    public function moverEtapa(Request $request, int $id, int $clienteId)
    {
        $campana = Campana::with('etapas')->findOrFail($id);
        $this->authorizeEmpresa($campana->empresa_id);

        $validator = Validator::make($request->all(), [
            'etapa_id' => 'required|exists:campana_etapas,id',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $etapaValida = $campana->etapas->contains('id', $request->etapa_id);
        if (!$etapaValida) {
            return response()->json(['error' => 'La etapa no pertenece a esta campaña'], 422);
        }

        CampanaCliente::where('campana_id', $id)
            ->where('cliente_id', $clienteId)
            ->update(['etapa_id' => $request->etapa_id]);

        return response()->json(['etapa_id' => $request->etapa_id]);
    }

    // ─── Authorization helper ─────────────────────────────────────────────────

    private function authorizeEmpresa(int $empresaId): void
    {
        if ($this->isSuperAdmin()) return;

        $myEmpresaId = $this->getEmpresaId();
        if ($myEmpresaId !== $empresaId) {
            abort(403, 'No autorizado');
        }
    }
}
