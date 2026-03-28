import { Edit, Plus, Search, Trash2, TrendingUp, Award, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"
import CrearNivelModal from "../components/ModalCrearNivel"
import EditarNivelModal from "../components/EditarModalNivel"
import { eliminarNivel } from "../services/eliminarNiveles"

import { useNiveles } from "../hooks/useNiveles"

import { toast } from "sonner"

const ITEMS_PER_PAGE = 5;

export default function NivelesAdmin() {
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [nivelToEdit, setNivelToEdit] = useState<any | null>(null);

    // 2. Usamos el Hook para obtener datos reales del Backend
    const { niveles, loading, refetch } = useNiveles();

    // Filtrado dinámico sobre los datos del backend
    const filteredData = useMemo(() => {
        return niveles.filter(item =>
            item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [niveles, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleEdit = (nivel: any) => {
        // Mapeamos los datos para que el modal de edición reciba los IDs de empresas
        setNivelToEdit({
            ...nivel,
            empresa_ids: nivel.empresas.map((e: any) => e.id)
        });
        setIsEditModalOpen(true);
    };


    const handleDelete = async (id: number) => {
        // Usamos una confirmación nativa o podrías usar un modal personalizado luego
        if (window.confirm("¿Estás seguro de eliminar este nivel? Esta acción desvinculará a todas las empresas asociadas.")) {
            try {
                const success = await eliminarNivel(id);
                if (success) {
                    toast.success("Nivel eliminado exitosamente");
                    refetch(); // Refrescamos la tabla para que desaparezca la fila
                }
            } catch (error: any) {
                toast.error(error.message);
            }
        }
    }

    const getPageNumbers = () => Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border shadow-sm rounded-xl border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-indigo-50">
                                <TrendingUp className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Niveles</h1>
                                <p className="mt-1 text-slate-600">Configura beneficios de fidelidad para HEXIS</p>
                            </div>
                        </div>
                        <button
                            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-[#132436] rounded-lg shadow-sm hover:bg-[#224666]"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nuevo Nivel</span>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="relative max-w-md">
                        <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                        <input
                            placeholder="Buscar nivel..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full py-2.5 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b bg-slate-50 border-slate-200 text-xs font-semibold uppercase text-slate-600">
                            <tr>
                                <th className="px-6 py-4 text-left">Nivel</th>
                                <th className="px-6 py-4 text-left">Empresas asociadas</th>
                                <th className="px-6 py-4 text-left">Consumo Mínimo</th>
                                <th className="px-6 py-4 text-left">Cashback</th>
                                <th className="px-6 py-4 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                                        <p className="mt-2 text-sm text-slate-500">Cargando niveles...</p>
                                    </td>
                                </tr>
                            ) : currentData.map((item) => (
                                <tr key={item.id} className={`transition-colors hover:bg-slate-50 ${item.estado === 0 ? 'bg-slate-50/50 opacity-60' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 rounded-lg bg-slate-100">
                                                <Award className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{item.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                                            {item.empresas?.map((emp: any) => (
                                                <span key={emp.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded border border-indigo-100">
                                                    {emp.razon_social}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-mono font-medium">S/ {item.consumo_minimo.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-indigo-100 text-indigo-800">
                                            {item.cashback_porcentaje}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            {/* Botón de Estado */}
                                            {/* <button 
                                                onClick={() => handleToggleEstado(item.id)}
                                                className={`p-2 rounded-lg transition-colors ${item.estado === 1 ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                                title={item.estado === 1 ? "Desactivar" : "Activar"}
                                            >
                                                {item.estado === 1 ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                                            </button> */}

                                            <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                <Edit className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Eliminar nivel"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center">
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-light">Sistema HEXIS</span>
                    <div className="flex gap-1">
                        {getPageNumbers().map(n => (
                            <button
                                key={n}
                                onClick={() => setCurrentPage(n)}
                                className={`w-8 h-8 rounded-md text-[10px] font-bold transition-all ${currentPage === n ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-200 text-slate-600'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modales */}
            <CrearNivelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onNivelCreado={refetch} // Refresca tras crear
            />
            <EditarNivelModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onNivelEditado={refetch} // Refresca tras editar
                nivelData={nivelToEdit}
            />
        </div>
    )
}