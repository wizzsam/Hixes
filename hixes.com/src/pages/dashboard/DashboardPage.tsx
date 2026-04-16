import { useEffect, useState } from 'react';
import { TrendingUp, CheckCircle2, Users, GitBranch, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { getReporteOportunidades, type ReporteOportunidades } from './services/reportes';

const ETAPA_COLORS: Record<string, string> = {
    'Nuevo lead':          'bg-slate-400',
    'Contactado':          'bg-blue-400',
    'Cotización enviada':  'bg-amber-400',
    'Negociación':         'bg-purple-400',
    'Venta cerrada':       'bg-emerald-500',
};

const formatSoles = (v: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(v);

export const DashboardPage = () => {
    const [data, setData] = useState<ReporteOportunidades | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getReporteOportunidades()
            .then(setData)
            .catch(() => setError('No se pudo cargar el reporte.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
    );

    if (error || !data) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p>{error || 'Sin datos disponibles'}</p>
        </div>
    );

    const tasaCierre = data.total_oportunidades > 0
        ? Math.round(data.ventas_cerradas / data.total_oportunidades * 100)
        : 0;

    return (
        <div className="space-y-6 animate-fade-in">

            {/* ── KPIs ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Oportunidades generadas */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Oportunidades</p>
                        <p className="text-3xl font-bold text-slate-800">{data.total_oportunidades}</p>
                        <p className="text-xs text-slate-400 mt-0.5">generadas en total</p>
                    </div>
                </div>

                {/* Ventas cerradas */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-xl">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Ventas cerradas</p>
                        <p className="text-3xl font-bold text-slate-800">{data.ventas_cerradas}</p>
                        <p className="text-xs text-slate-400 mt-0.5">tasa de cierre: {tasaCierre}%</p>
                    </div>
                </div>

                {/* Valor ganado */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="bg-amber-50 p-3 rounded-xl">
                        <DollarSign className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Valor ganado</p>
                        <p className="text-2xl font-bold text-slate-800">{formatSoles(data.valor_ventas_cerradas)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">en ventas cerradas</p>
                    </div>
                </div>

                {/* Vendedores activos */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="bg-purple-50 p-3 rounded-xl">
                        <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Vendedores</p>
                        <p className="text-3xl font-bold text-slate-800">{data.por_vendedor.length}</p>
                        <p className="text-xs text-slate-400 mt-0.5">con oportunidades</p>
                    </div>
                </div>
            </div>

            {/* ── Fila inferior ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                {/* Embudo de conversión */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="bg-indigo-50 p-2 rounded-lg">
                            <GitBranch className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="font-semibold text-slate-800">Conversión por etapas del embudo</h2>
                    </div>
                    <div className="space-y-3">
                        {data.embudo.map((e) => (
                            <div key={e.etapa}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600 font-medium">{e.etapa}</span>
                                    <span className="text-slate-500">{e.cantidad} <span className="text-slate-400">({e.porcentaje}%)</span></span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`${ETAPA_COLORS[e.etapa] ?? 'bg-slate-400'} h-2.5 rounded-full transition-all duration-700`}
                                        style={{ width: `${e.porcentaje}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desempeño por vendedor */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="bg-rose-50 p-2 rounded-lg">
                            <Users className="w-5 h-5 text-rose-500" />
                        </div>
                        <h2 className="font-semibold text-slate-800">Desempeño por vendedor</h2>
                    </div>
                    {data.por_vendedor.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">Sin datos de vendedores aún</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="text-left pb-3 font-medium">Vendedor</th>
                                        <th className="text-center pb-3 font-medium">Total</th>
                                        <th className="text-center pb-3 font-medium">Cerradas</th>
                                        <th className="text-center pb-3 font-medium">Perdidas</th>
                                        <th className="text-right pb-3 font-medium">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.por_vendedor.map((v) => {
                                        const tasa = v.total > 0 ? Math.round(v.cerradas / v.total * 100) : 0;
                                        return (
                                            <tr key={v.vendedor} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-3 pr-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                                                            {v.vendedor.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-700 leading-tight">{v.vendedor}</p>
                                                            <p className="text-[10px] text-slate-400">{tasa}% cierre</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center text-slate-600 font-medium">{v.total}</td>
                                                <td className="text-center">
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs">{v.cerradas}</span>
                                                </td>
                                                <td className="text-center">
                                                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold text-xs">{v.perdidas}</span>
                                                </td>
                                                <td className="text-right text-slate-700 font-semibold">{formatSoles(v.valor_total)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

