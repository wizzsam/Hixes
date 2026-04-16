import { useState } from 'react'
import { Plus, Edit, Trash2, Power, Kanban } from 'lucide-react'
import { usePipelines } from '../hooks/usePipelines'
import CrearPipelineModal from '../components/crearPipelineModal'
import EditarPipelineModal from '../components/editarPipelineModal'
import type { PipelineEtapa } from '../schemas/pipeline.interface'

export default function KanbamPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [etapaToEdit, setEtapaToEdit] = useState<PipelineEtapa | null>(null)

    const { etapas, isLoading, fetchEtapas, toggleActivo, eliminar, reordenar } = usePipelines()

    const handleEdit = (etapa: PipelineEtapa) => {
        setEtapaToEdit(etapa)
        setIsEditModalOpen(true)
    }

    const handleOrderChange = (etapaId: number, newPosStr: string) => {
        const newPos = parseInt(newPosStr)
        if (isNaN(newPos) || newPos < 1 || newPos > etapas.length) return
        const currentIdx = etapas.findIndex(e => e.id === etapaId)
        if (currentIdx === -1 || currentIdx + 1 === newPos) return
        const nueva = [...etapas]
        const [item] = nueva.splice(currentIdx, 1)
        nueva.splice(newPos - 1, 0, item)
        reordenar(nueva)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border shadow-sm rounded-xl border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-blue-50">
                                <Kanban className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Gestión de Pipelines</h1>
                                <p className="mt-1 text-slate-600">
                                    Define las etapas del pipeline de ventas CRM y su orden de aparición.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-[#132436] rounded-lg shadow-sm hover:bg-[#224666]"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nueva Etapa</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between px-6 py-4">
                    <p className="text-sm text-slate-500">
                        Las etapas se muestran en el Kanban en el orden que definas aquí.
                    </p>
                    <div className="flex items-center px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200">
                        <span className="font-medium text-slate-700">{etapas.length}</span>
                        <span className="ml-1 text-slate-500">etapas registradas</span>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b bg-slate-50 border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">
                                    Orden
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">
                                    Etapa
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">
                                    Color
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Cargando etapas...
                                    </td>
                                </tr>
                            ) : etapas.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No hay etapas registradas. Crea la primera.
                                    </td>
                                </tr>
                            ) : (
                                etapas.map((etapa, idx) => (
                                    <tr key={etapa.id} className="transition-colors hover:bg-slate-50">
                                        {/* Orden */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                key={etapa.id + '-' + (idx + 1)}
                                                type="number"
                                                defaultValue={idx + 1}
                                                min={1}
                                                max={etapas.length}
                                                onBlur={e => handleOrderChange(etapa.id, e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                                                className="w-14 px-2 py-1 text-sm font-bold text-center border border-slate-300 rounded-lg text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            />
                                        </td>

                                        {/* Nombre + badge */}
                                        <td className="px-6 py-4">
                                            <span
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                                                style={{ backgroundColor: etapa.color }}
                                            >
                                                {etapa.nombre}
                                            </span>
                                        </td>

                                        {/* Color */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-5 h-5 rounded-full border border-slate-200"
                                                    style={{ backgroundColor: etapa.color }}
                                                />
                                                <span className="text-xs font-mono text-slate-500">{etapa.color}</span>
                                            </div>
                                        </td>

                                        {/* Estado */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleActivo(etapa.id)}
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                                                    etapa.activo
                                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                            >
                                                {etapa.activo ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-1">
                                                <button
                                                    onClick={() => handleEdit(etapa)}
                                                    title="Editar"
                                                    className="p-2 transition-colors rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleActivo(etapa.id)}
                                                    title={etapa.activo ? 'Desactivar' : 'Activar'}
                                                    className={`p-2 transition-colors rounded-lg ${
                                                        etapa.activo
                                                            ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                                            : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                                                    }`}
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => eliminar(etapa.id)}
                                                    title="Eliminar"
                                                    className="p-2 transition-colors rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modales */}
            <CrearPipelineModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onEtapaCreada={() => { setIsModalOpen(false); fetchEtapas() }}
            />
            <EditarPipelineModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                etapaData={etapaToEdit}
                onEtapaEditada={() => { setIsEditModalOpen(false); fetchEtapas() }}
            />
        </div>
    )
}
