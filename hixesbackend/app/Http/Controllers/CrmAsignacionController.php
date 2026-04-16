<?php

namespace App\Http\Controllers;

use App\Models\CrmAsignacionChat;
use App\Models\Usuarios;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CrmAsignacionController extends Controller
{
    
    public static function resolverAsignacion(string $contactPhone): ?int
    {
       
        $existente = CrmAsignacionChat::where('contact_phone', $contactPhone)
            ->where('estado', 'activo')
            ->first();

        if ($existente) {
            return $existente->vendedor_id;
        }

        // Buscar vendedores disponibles con rol VENTAS y sesion_activa=true
        $vendedores = Usuarios::where('sesion_activa', true)
            ->where('estado', true)
            ->whereHas('roles', fn($q) => $q->where('nombre_rol', 'VENTAS'))
            ->withCount(['asignacionesChat' => fn($q) => $q->where('estado', 'activo')])
            ->orderBy('asignaciones_chat_count', 'asc')
            ->get();

        if ($vendedores->isEmpty()) {
            return null; // No hay vendedores disponibles
        }

        $vendedor = $vendedores->first();

        CrmAsignacionChat::updateOrCreate(
            ['contact_phone' => $contactPhone],
            ['vendedor_id' => $vendedor->id_usuario, 'estado' => 'activo']
        );

        return $vendedor->id_usuario;
    }

    // ─── GET /crm/asignaciones ─────────────────────────────────────────────────
    /** Lista todas las asignaciones activas (para admins) */
    public function index(): JsonResponse
    {
        $asignaciones = CrmAsignacionChat::with('vendedor')
            ->where('estado', 'activo')
            ->get()
            ->map(fn($a) => [
                'id'            => $a->id,
                'contact_phone' => $a->contact_phone,
                'vendedor_id'   => $a->vendedor_id,
                'nombre_vendedor' => $a->vendedor?->nombre_completo,
                'estado'        => $a->estado,
                'created_at'    => $a->created_at,
            ]);

        return response()->json(['success' => true, 'data' => $asignaciones]);
    }

    // ─── GET /crm/mi-asignacion ────────────────────────────────────────────────
    /** Devuelve los contact_phones asignados al usuario autenticado */
    public function miAsignacion(): JsonResponse
    {
        $userId = auth('api')->id();

        $phones = CrmAsignacionChat::where('vendedor_id', $userId)
            ->where('estado', 'activo')
            ->pluck('contact_phone');

        return response()->json(['success' => true, 'phones' => $phones]);
    }

    // ─── POST /crm/asignaciones/resolver ──────────────────────────────────────
    /** Dado un teléfono, asigna/devuelve el vendedor. Llamado desde el webhook. */
    public function resolver(Request $request): JsonResponse
    {
        $request->validate(['phone' => 'required|string']);
        $vendedorId = self::resolverAsignacion($request->phone);

        return response()->json([
            'success'     => true,
            'vendedor_id' => $vendedorId,
        ]);
    }

    // ─── DELETE /crm/asignaciones/{phone} ─────────────────────────────────────
    /** Libera manualmente un chat del vendedor */
    public function liberar(Request $request, string $phone): JsonResponse
    {
        $decoded = urldecode($phone);

        CrmAsignacionChat::where('contact_phone', $decoded)
            ->update(['estado' => 'liberado']);

        return response()->json(['success' => true]);
    }

    // ─── POST /crm/asignaciones/liberar-por-oportunidad ───────────────────────
    /**
     * Llamado cuando una oportunidad llega a Venta cerrada o Perdida.
     * Si el cliente tiene teléfono registrado, libera su chat.
     */
    public function liberarPorOportunidad(Request $request): JsonResponse
    {
        $request->validate(['telefono' => 'required|string']);

        $digits = preg_replace('/\D/', '', $request->telefono);

        CrmAsignacionChat::where('contact_phone', 'like', "%{$digits}%")
            ->update(['estado' => 'liberado']);

        return response()->json(['success' => true]);
    }

    // ─── POST /crm/asignaciones/transferir ────────────────────────────────────
    /** Reasigna un chat activo a otro vendedor */
    public function transferir(Request $request): JsonResponse
    {
        $request->validate([
            'phone'       => 'required|string',
            'vendedor_id' => 'required|integer|exists:usuarios,id_usuario',
        ]);

        CrmAsignacionChat::updateOrCreate(
            ['contact_phone' => $request->phone],
            ['vendedor_id' => $request->vendedor_id, 'estado' => 'activo']
        );

        $vendedor = Usuarios::find($request->vendedor_id);

        return response()->json([
            'success'  => true,
            'vendedor' => [
                'id'              => $vendedor?->id_usuario,
                'nombre_completo' => $vendedor?->nombre_completo,
            ],
        ]);
    }

    // ─── GET /vendedores/disponibles ──────────────────────────────────────────
    /** Lista vendedores con su estado y carga actual */
    public function vendedoresDisponibles(): JsonResponse
    {
        $vendedores = Usuarios::where('estado', true)
            ->where('sesion_activa', true)
            ->whereHas('roles', fn($q) => $q->where('nombre_rol', 'VENTAS'))
            ->withCount(['asignacionesChat' => fn($q) => $q->where('estado', 'activo')])
            ->get()
            ->map(fn($v) => [
                'id'              => $v->id_usuario,
                'nombre_completo' => $v->nombre_completo,
                'sesion_activa'   => (bool) $v->sesion_activa,
                'chats_activos'   => $v->asignaciones_chat_count,
            ]);

        return response()->json(['success' => true, 'data' => $vendedores]);
    }
}
