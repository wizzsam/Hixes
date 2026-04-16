import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Kanban, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { crearPipelineEtapa } from '../services/crearPipeline'

const COLORES_PRESET = [
    { valor: '#3b82f6', nombre: 'Azul' },
    { valor: '#8b5cf6', nombre: 'Violeta' },
    { valor: '#f59e0b', nombre: 'Amarillo' },
    { valor: '#ef4444', nombre: 'Rojo' },
    { valor: '#10b981', nombre: 'Verde' },
    { valor: '#f97316', nombre: 'Naranja' },
    { valor: '#06b6d4', nombre: 'Cyan' },
    { valor: '#64748b', nombre: 'Gris' },
]

interface CrearPipelineModalProps {
    isOpen: boolean
    onClose: () => void
    onEtapaCreada: () => void
}

export default function CrearPipelineModal({ isOpen, onClose, onEtapaCreada }: CrearPipelineModalProps) {
    const [nombre, setNombre] = useState('')
    const [color, setColor] = useState('#3b82f6')
    const [isLoading, setIsLoading] = useState(false)

    const resetForm = () => {
        setNombre('')
        setColor('#3b82f6')
    }

    const handleClose = () => {
        onClose()
        resetForm()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!nombre.trim()) {
            toast.error('El nombre de la etapa es obligatorio.')
            return
        }

        setIsLoading(true)
        try {
            const response = await crearPipelineEtapa({ nombre: nombre.trim(), color })
            if (response.success) {
                toast.success('¡Etapa creada con éxito!')
                onEtapaCreada()
                setTimeout(() => handleClose(), 300)
            } else {
                if (response.errors) {
                    const msgs = Object.values(response.errors).flat().join('\n')
                    toast.error(msgs || 'Error de validación.')
                } else {
                    toast.error(response.message || 'Error al crear la etapa.')
                }
            }
        } catch {
            toast.error('Ocurrió un error inesperado.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 transition-opacity bg-slate-900/70 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative overflow-hidden text-left transition-all transform bg-white border shadow-2xl rounded-2xl border-slate-200 sm:my-8 sm:w-full sm:max-w-md">

                                {/* Cabecera */}
                                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2.5 rounded-xl bg-blue-100">
                                                <Kanban className="w-6 h-6 text-blue-700" />
                                            </div>
                                            <div>
                                                <Dialog.Title as="h3" className="text-xl font-bold text-slate-950">
                                                    Nueva Etapa de Pipeline
                                                </Dialog.Title>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    Define el nombre y color de la nueva etapa.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="p-1.5 transition-colors rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Formulario */}
                                <form onSubmit={handleSubmit}>
                                    <div className="px-6 py-6 space-y-5">

                                        {/* Nombre */}
                                        <div>
                                            <label className="block mb-1.5 text-sm font-semibold text-slate-700">
                                                Nombre de la etapa <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={nombre}
                                                onChange={e => setNombre(e.target.value)}
                                                placeholder="Ej. Nuevo lead, En seguimiento..."
                                                maxLength={100}
                                                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            />
                                        </div>

                                        {/* Color */}
                                        <div>
                                            <label className="block mb-1.5 text-sm font-semibold text-slate-700">
                                                Color de la etapa
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {COLORES_PRESET.map(c => (
                                                    <button
                                                        key={c.valor}
                                                        type="button"
                                                        title={c.nombre}
                                                        onClick={() => setColor(c.valor)}
                                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c.valor ? 'border-slate-700 scale-110' : 'border-transparent'}`}
                                                        style={{ backgroundColor: c.valor }}
                                                    />
                                                ))}
                                            </div>
                                            <p className="mt-2 text-xs text-slate-500">
                                                Color seleccionado: <span className="font-mono">{color}</span>
                                            </p>
                                        </div>

                                        {/* Preview */}
                                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                                            <p className="text-xs text-slate-500 mb-2">Vista previa:</p>
                                            <span
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                                                style={{ backgroundColor: color }}
                                            >
                                                {nombre || 'Nombre de etapa'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-100"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-[#132436] rounded-lg hover:bg-[#224666] disabled:opacity-60"
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Crear Etapa
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
