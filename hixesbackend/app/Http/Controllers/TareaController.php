<?php

namespace App\Http\Controllers;

use App\Models\Tarea;
use App\Models\Usuarios;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TareaController extends Controller
{
    // ─── GET /tareas ───────────────────────────────────────────────────────────
    // Soporta filtros: ?oportunidad_id=X  o  ?cliente_id=X
    public function index(Request $request)
    {
        $query = Tarea::with(['asignado', 'oportunidad', 'cliente']);

        if ($request->filled('oportunidad_id')) {
            $query->where('oportunidad_id', $request->oportunidad_id);
        }

        if ($request->filled('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }

        return response()->json($query->orderBy('fecha_vencimiento')->get()->map(fn($t) => $this->format($t)));
    }

    // ─── POST /tareas ──────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo'           => 'required|string|max:255',
            'descripcion'      => 'nullable|string',
            'estado'           => 'nullable|in:pendiente,completada',
            'fecha_vencimiento'=> 'required|date',
            'minutos_aviso'    => 'nullable|integer|min:0',
            'asignado_a'       => 'nullable|exists:usuarios,id_usuario',
            'oportunidad_id'   => 'nullable|exists:oportunidades,id',
            'cliente_id'       => 'nullable|exists:clientes,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tarea = Tarea::create([
            'titulo'            => $request->titulo,
            'descripcion'       => $request->descripcion,
            'estado'            => $request->estado ?? 'pendiente',
            'fecha_vencimiento' => $request->fecha_vencimiento,
            'minutos_aviso'     => $request->minutos_aviso ?? 60,
            'asignado_a'        => $request->asignado_a,
            'oportunidad_id'    => $request->oportunidad_id,
            'cliente_id'        => $request->cliente_id,
            'notificado'        => false,
        ]);

        $tarea->load(['asignado', 'oportunidad', 'cliente']);

        return response()->json($this->format($tarea), 201);
    }

    // ─── PATCH /tareas/{id}/estado ─────────────────────────────────────────────
    public function updateEstado(Request $request, int $id)
    {
        $tarea = Tarea::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'estado' => 'required|in:pendiente,completada',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tarea->update(['estado' => $request->estado]);

        return response()->json($this->format($tarea->fresh(['asignado', 'oportunidad', 'cliente'])));
    }

    // ─── DELETE /tareas/{id} ───────────────────────────────────────────────────
    public function destroy(int $id)
    {
        Tarea::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    // ─── Serialización ────────────────────────────────────────────────────────
    private function format(Tarea $t): array
    {
        return [
            'id'                => $t->id,
            'titulo'            => $t->titulo,
            'descripcion'       => $t->descripcion,
            'estado'            => $t->estado,
            'fecha_vencimiento' => $t->fecha_vencimiento?->format('Y-m-d\TH:i:s'),
            'minutos_aviso'     => $t->minutos_aviso,
            'notificado'        => $t->notificado,
            'oportunidad_id'    => $t->oportunidad_id,
            'cliente_id'        => $t->cliente_id,
            'asignado_a'        => $t->asignado_a,
            'asignado'          => $t->asignado ? [
                'id'             => $t->asignado->id_usuario,
                'nombre_completo'=> $t->asignado->nombre_completo,
            ] : null,
        ];
    }
}
