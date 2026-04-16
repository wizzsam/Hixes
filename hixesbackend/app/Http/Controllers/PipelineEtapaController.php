<?php

namespace App\Http\Controllers;

use App\Models\PipelineEtapa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PipelineEtapaController extends Controller
{
    public function index()
    {
        $etapas = PipelineEtapa::orderBy('orden')->get();
        return response()->json(['success' => true, 'data' => $etapas]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100|unique:pipeline_etapas,nombre',
            'color'  => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $maxOrden = PipelineEtapa::max('orden') ?? 0;

        $etapa = PipelineEtapa::create([
            'nombre' => $request->nombre,
            'orden'  => $maxOrden + 1,
            'color'  => $request->color ?? '#64748b',
            'activo' => true,
        ]);

        return response()->json(['success' => true, 'data' => $etapa], 201);
    }

    public function update(Request $request, int $id)
    {
        $etapa = PipelineEtapa::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|required|string|max:100|unique:pipeline_etapas,nombre,' . $id,
            'color'  => 'sometimes|nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $etapa->update($request->only(['nombre', 'color']));

        return response()->json(['success' => true, 'data' => $etapa]);
    }

    public function toggleActivo(int $id)
    {
        $etapa = PipelineEtapa::findOrFail($id);
        $etapa->activo = !$etapa->activo;
        $etapa->save();

        return response()->json(['success' => true, 'data' => $etapa]);
    }

    public function reordenar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'orden'   => 'required|array',
            'orden.*' => 'integer|exists:pipeline_etapas,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        foreach ($request->orden as $posicion => $etapaId) {
            PipelineEtapa::where('id', $etapaId)->update(['orden' => $posicion + 1]);
        }

        $etapas = PipelineEtapa::orderBy('orden')->get();
        return response()->json(['success' => true, 'data' => $etapas]);
    }

    public function destroy(int $id)
    {
        $etapa = PipelineEtapa::findOrFail($id);
        $etapa->delete();

        return response()->json(['success' => true, 'message' => 'Etapa eliminada correctamente.']);
    }
}
