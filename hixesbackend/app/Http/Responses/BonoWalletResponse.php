<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class BonoWalletResponse
{
    public static function bonoCreado($bono): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Bono de wallet registrado y vinculado correctamente',
            'data'    => self::format($bono)
        ], 201);
    }

    public static function bonos($bonos): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $bonos->map(fn($b) => self::format($b))
        ], 200);
    }

    public static function bono($bono): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => self::format($bono)
        ], 200);
    }

    public static function bonoActualizado($bono): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'La configuración del bono ha sido actualizada',
            'data'    => self::format($bono)
        ], 200);
    }

    /**
     * Formatea el objeto BonoWallet para el Frontend.
     * Incluye los montos, el porcentaje y la relación con empresas.
     */
    private static function format($bono): array
    {
        return [
            'id'              => $bono->id,
            'monto_minimo'    => (float) $bono->monto_minimo,
            'monto_maximo'    => $bono->monto_maximo ? (float) $bono->monto_maximo : null,
            'bono_porcentaje' => (float) $bono->bono_porcentaje,
           
            'created_at'      => $bono->created_at,
            // Mapeamos las empresas vinculadas a través de la tabla intermedia
            'empresas'        => $bono->empresas->map(fn($e) => [
                'id'           => $e->id,
                'razon_social' => $e->razon_social
            ])->toArray(),
        ];
    }
}