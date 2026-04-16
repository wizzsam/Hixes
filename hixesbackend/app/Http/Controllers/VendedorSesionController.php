<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendedorSesionController extends Controller
{
    // ─── POST /vendedor/sesion ────────────────────────────────────────────────
    /** Activa o desactiva manualmente la sesión (disponible) del vendedor */
    public function toggle(Request $request): JsonResponse
    {
        $request->validate(['sesion_activa' => 'required|boolean']);

        /** @var \App\Models\Usuarios $user */
        $user = auth('api')->user();
        $user->sesion_activa = (bool) $request->sesion_activa;
        $user->save();

        return response()->json([
            'success'       => true,
            'sesion_activa' => $user->sesion_activa,
        ]);
    }

    // ─── GET /vendedor/sesion ─────────────────────────────────────────────────
    public function estado(): JsonResponse
    {
        /** @var \App\Models\Usuarios $user */
        $user = auth('api')->user();
        return response()->json([
            'success'       => true,
            'sesion_activa' => (bool) $user->sesion_activa,
        ]);
    }
}
