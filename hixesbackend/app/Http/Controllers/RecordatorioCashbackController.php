<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RecordatorioCashback;
use Symfony\Component\HttpFoundation\JsonResponse;

class RecordatorioCashbackController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $recordatorios = RecordatorioCashback::with('empresa')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['success' => true, 'data' => $recordatorios]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'empresa_id'        => 'required|exists:empresas,id',
            'tipo_saldo'        => 'required|in:cashback,wallet,ambos',
            'canal'             => 'required|string|max:50',
            'mensaje_plantilla' => 'required|string',
            'dias_antes'        => 'required|integer|min:1|max:365',
            'activo'            => 'boolean',
        ]);

        $recordatorio = RecordatorioCashback::create($validated);

        return response()->json(['success' => true, 'data' => $recordatorio], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $recordatorio = RecordatorioCashback::findOrFail($id);

        $validated = $request->validate([
            'empresa_id'        => 'sometimes|exists:empresas,id',
            'tipo_saldo'        => 'sometimes|in:cashback,wallet,ambos',
            'canal'             => 'sometimes|string|max:50',
            'mensaje_plantilla' => 'sometimes|string',
            'dias_antes'        => 'sometimes|integer|min:1|max:365',
            'activo'            => 'sometimes|boolean',
        ]);

        $recordatorio->update($validated);

        return response()->json(['success' => true, 'data' => $recordatorio]);
    }

    public function toggleActivo($id): JsonResponse
    {
        $recordatorio = RecordatorioCashback::findOrFail($id);

        $recordatorio->activo = !$recordatorio->activo;
        $recordatorio->save();

        return response()->json(['success' => true, 'data' => $recordatorio]);
    }

    public function destroy($id): JsonResponse
    {
        $recordatorio = RecordatorioCashback::findOrFail($id);
        $recordatorio->delete();

        return response()->json(['success' => true, 'message' => 'Recordatorio eliminado']);
    }
}
