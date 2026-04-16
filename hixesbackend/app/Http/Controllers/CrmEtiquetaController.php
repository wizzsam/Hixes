<?php

namespace App\Http\Controllers;

use App\Models\CrmEtiqueta;
use App\Models\CrmConversacionEtiqueta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CrmEtiquetaController extends Controller
{
    private function userId(): int
    {
        return auth()->user()->id_usuario;
    }

    // ─── GET /crm/etiquetas ─────────────────────────────────────────────────
    public function index()
    {
        $etiquetas = CrmEtiqueta::where('usuario_id', $this->userId())
            ->orderBy('nombre')
            ->get();

        return response()->json($etiquetas);
    }

    // ─── POST /crm/etiquetas ────────────────────────────────────────────────
    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'nombre'      => 'required|string|max:80',
            'color'       => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'descripcion' => 'nullable|string|max:255',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $existe = CrmEtiqueta::where('usuario_id', $this->userId())
            ->where('nombre', $request->nombre)
            ->exists();

        if ($existe) {
            return response()->json(['message' => 'Ya tienes una etiqueta con ese nombre.'], 422);
        }

        $etiqueta = CrmEtiqueta::create([
            'usuario_id'  => $this->userId(),
            'nombre'      => $request->nombre,
            'color'       => $request->color,
            'descripcion' => $request->descripcion,
        ]);

        return response()->json($etiqueta, 201);
    }

    // ─── PUT /crm/etiquetas/{id} ────────────────────────────────────────────
    public function update(Request $request, int $id)
    {
        $etiqueta = CrmEtiqueta::where('id', $id)
            ->where('usuario_id', $this->userId())
            ->firstOrFail();

        $v = Validator::make($request->all(), [
            'nombre'      => 'sometimes|required|string|max:80',
            'color'       => ['sometimes', 'required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'descripcion' => 'nullable|string|max:255',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        if ($request->filled('nombre') && $request->nombre !== $etiqueta->nombre) {
            $existe = CrmEtiqueta::where('usuario_id', $this->userId())
                ->where('nombre', $request->nombre)
                ->exists();

            if ($existe) {
                return response()->json(['message' => 'Ya tienes una etiqueta con ese nombre.'], 422);
            }
        }

        $etiqueta->update($request->only(['nombre', 'color', 'descripcion']));

        return response()->json($etiqueta);
    }

    // ─── DELETE /crm/etiquetas/{id} ─────────────────────────────────────────
    public function destroy(int $id)
    {
        $etiqueta = CrmEtiqueta::where('id', $id)
            ->where('usuario_id', $this->userId())
            ->firstOrFail();

        $etiqueta->delete();

        return response()->json(null, 204);
    }

    // ─── GET /crm/conversacion-etiquetas ────────────────────────────────────
    // Devuelve todas las asignaciones del usuario actual, agrupadas por phone.
    // Formato: [ { id, phone, etiqueta_id, etiqueta: {...} }, ... ]
    public function asignaciones()
    {
        $asignaciones = CrmConversacionEtiqueta::with('etiqueta')
            ->where('usuario_id', $this->userId())
            ->get();

        return response()->json($asignaciones);
    }

    // ─── POST /crm/conversacion-etiquetas ───────────────────────────────────
    // Body: { phone, etiqueta_id }
    public function asignar(Request $request)
    {
        $v = Validator::make($request->all(), [
            'phone'       => 'required|string|max:30',
            'etiqueta_id' => 'required|integer',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        // Verificar que la etiqueta pertenece al usuario
        $etiqueta = CrmEtiqueta::where('id', $request->etiqueta_id)
            ->where('usuario_id', $this->userId())
            ->firstOrFail();

        $asignacion = CrmConversacionEtiqueta::firstOrCreate([
            'phone'       => $request->phone,
            'etiqueta_id' => $etiqueta->id,
            'usuario_id'  => $this->userId(),
        ]);

        $asignacion->load('etiqueta');

        return response()->json($asignacion, 201);
    }

    // ─── DELETE /crm/conversacion-etiquetas/{id} ────────────────────────────
    public function desasignar(int $id)
    {
        $asignacion = CrmConversacionEtiqueta::where('id', $id)
            ->where('usuario_id', $this->userId())
            ->firstOrFail();

        $asignacion->delete();

        return response()->json(null, 204);
    }
}
