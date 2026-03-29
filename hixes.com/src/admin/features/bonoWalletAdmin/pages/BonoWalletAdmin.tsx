import { Edit, Plus, Search, Trash2, Wallet, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"
import { toast } from "sonner"
import { useBonos } from "../hooks/useBonos"
import { eliminarBono } from "../services/eliminarBono"
import CrearBonoModal from "../components/ModalBonoCrear"
import EditarBonoModal from "../components/EditarBonoModal"

const ITEMS_PER_PAGE = 5;

export default function BonoWalletAdmin() {
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [bonoToEdit, setBonoToEdit] = useState<any | null>(null);

    // 1. Usamos el Hook real para obtener datos del Backend
    const { bonos, loading, refetch } = useBonos();

    // 2. Filtrado dinámico sobre los datos reales
    const filteredData = useMemo(() => {
        return bonos.filter(item =>
            // Filtramos por porcentaje o por los nombres de las empresas vinculadas
            item.bono_porcentaje.toString().includes(searchTerm) ||
            item.empresas.some(emp => emp.razon_social.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [bonos, searchTerm]);

    // Paginación
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleEdit = (bono: any) => {
        // Mapeamos los datos para que el modal de edición reciba los IDs de empresas
        setBonoToEdit({
            ...bono,
            empresas_ids: bono.empresas.map((e: any) => e.id)
        });
        setIsEditModalOpen(true);
    };

    // 3. Función de Eliminación Real
    const handleDelete = async (id: number) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta escala de bono? Se desvinculará de todas las sedes.")) {
            try {
                const success = await eliminarBono(id);
                if (success) {
                    toast.success("Escala de bono eliminada correctamente");
                    refetch(); // Refrescamos la lista desde el backend
                }
            } catch (error: any) {
                toast.error(error.message || "Error al eliminar");
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
                            <div className="p-2 rounded-lg bg-emerald-50">
                                <Wallet className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Escalas de Bono Wallet</h1>
                                <p className="mt-1 text-slate-600">Configura los porcentajes de bonificación por recarga</p>
                            </div>
                        </div>
                        <button
                            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-[#132436] rounded-lg shadow-sm hover:bg-[#224666]"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nueva Escala</span>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="relative max-w-md">
                        <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                        <input
                            placeholder="Buscar por porcentaje o sede..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full py-2.5 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Tabla de Datos */}
            <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b bg-slate-50 border-slate-200 text-xs font-semibold uppercase text-slate-600">
                            <tr>
                                <th className="px-6 py-4 text-left">Rango de Recarga</th>
                                <th className="px-6 py-4 text-left">Sedes Aplicables</th>
                                <th className="px-6 py-4 text-left">Bono Adicional</th>
                                <th className="px-6 py-4 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
                                        <p className="mt-2 text-sm text-slate-500 font-medium">Cargando escalas...</p>
                                    </td>
                                </tr>
                            ) : currentData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center text-slate-500">No se encontraron escalas configuradas.</td>
                                </tr>
                            ) : currentData.map((item) => (
                                <tr key={item.id} className="transition-colors hover:bg-slate-50/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        S/ {item.monto_minimo.toFixed(2)} {item.monto_maximo ? `- S/ ${item.monto_maximo.toFixed(2)}` : 'a más'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-[250px]">
                                            {item.empresas?.map((emp: any) => (
                                                <span key={emp.id} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-100">
                                                    {emp.razon_social}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                            {item.bono_porcentaje.toFixed(2)}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="p-2 transition-colors rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleEdit(item)}
                                                title="Editar escala"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="p-2 transition-colors rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(item.id)}
                                                title="Eliminar escala"
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
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/30">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">HEXIS Wallet Engine</p>
                    <div className="flex gap-1">
                        {getPageNumbers().map(n => (
                            <button
                                key={n}
                                onClick={() => setCurrentPage(n)}
                                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-md transition-all ${currentPage === n ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modales */}
            <CrearBonoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onBonoCreado={refetch}
            />
            <EditarBonoModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onBonoEditado={refetch}
                bonoData={bonoToEdit}
            />
        </div>
    )
}