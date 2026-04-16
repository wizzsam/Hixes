<?php

namespace App\Http\Controllers;

use App\Models\Oportunidad;
use Illuminate\Http\JsonResponse;

class ReporteController extends Controller
{
    private const ETAPAS = [
        'Nuevo lead',
        'Contactado',
        'Cotización enviada',
        'Negociación',
        'Venta cerrada',
    ];

    public function oportunidades(): JsonResponse
    {
        $todas = Oportunidad::with('vendedor')->get();

        // ── 1. Total oportunidades generadas ────────────────────────────────
        $totalOportunidades = $todas->count();

        // ── 2. Ventas cerradas (estado=ganada) ───────────────────────────────
        $ventasCerradas      = $todas->where('estado', 'ganada')->count();
        $valorVentasCerradas = $todas->where('estado', 'ganada')->sum('valor_estimado');

        // ── 3. Desempeño por vendedor ────────────────────────────────────────
        $porVendedor = $todas
            ->groupBy('vendedor_id')
            ->map(function ($grupo) {
                $vendedor = $grupo->first()->vendedor;
                $nombre   = $vendedor?->nombre_completo ?? 'Sin asignar';
                return [
                    'vendedor'           => $nombre,
                    'total'              => $grupo->count(),
                    'cerradas'           => $grupo->where('estado', 'ganada')->count(),
                    'perdidas'           => $grupo->where('estado', 'perdida')->count(),
                    'valor_total'        => (float) $grupo->where('estado', 'ganada')->sum('valor_estimado'),
                ];
            })
            ->values();

        // ── 4. Conversión por etapas del embudo ──────────────────────────────
        $embudo = collect(self::ETAPAS)->map(function ($etapa) use ($todas, $totalOportunidades) {
            $count = $todas->where('etapa', $etapa)->count();
            return [
                'etapa'      => $etapa,
                'cantidad'   => $count,
                'porcentaje' => $totalOportunidades > 0
                    ? round($count / $totalOportunidades * 100, 1)
                    : 0,
            ];
        });

        return response()->json([
            'total_oportunidades'   => $totalOportunidades,
            'ventas_cerradas'       => $ventasCerradas,
            'valor_ventas_cerradas' => (float) $valorVentasCerradas,
            'por_vendedor'          => $porVendedor,
            'embudo'                => $embudo,
        ]);
    }
}
