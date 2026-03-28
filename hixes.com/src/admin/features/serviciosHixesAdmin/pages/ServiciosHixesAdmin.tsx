import { Edit, Plus, Search, Sparkles, Power, Loader2 } from "lucide-react"
import { useState, useMemo, useEffect, useCallback } from "react"
import { toast } from "sonner"

// Servicios y Tipos Reales
import { obtenerServicios } from "../services/obtenerServicios"
import { cambiarEstadoServicio } from "../services/estadoServicio"
import ModalServicioHixes from "../components/ModalCrearServicio"
import type { ServicioHixes } from "../schemas/servicio.interface"

const ITEMS_PER_PAGE = 5;

export default function ServicioHixesAdmin() {
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [servicios, setServicios] = useState<ServicioHixes[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [servicioParaEditar, setServicioParaEditar] = useState<ServicioHixes | null>(null);

  // 1. Obtener datos del Backend
  const fetchServicios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerServicios();
      setServicios(data);
    } catch (error) {
      toast.error("Error al cargar el catálogo de servicios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  // 2. Cambiar Estado (Endpoint PATCH)
  const handleToggleEstado = async (id: number) => {
    try {
      const success = await cambiarEstadoServicio(id);
      if (success) {
        toast.success("Disponibilidad actualizada");
        setServicios(prev => 
          prev.map(s => s.id === id ? { ...s, estado: !s.estado } : s)
        );
      }
    } catch (error) {
      toast.error("No se pudo cambiar el estado");
    }
  };

  // 3. Abrir Modal para Editar
  const handleEdit = (item: ServicioHixes) => {
    setServicioParaEditar(item);
    setIsModalOpen(true);
  };

  // 4. Abrir Modal para Crear
  const handleOpenCreate = () => {
    setServicioParaEditar(null);
    setIsModalOpen(true);
  };

  // 5. Filtrado y ORDENACIÓN (1, 2, 3...)
  const filteredData = useMemo(() => {
    const filtered = servicios.filter(item =>
      item.tratamiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.descripcion?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    // Ordenamos por ID de forma ascendente
    return [...filtered].sort((a, b) => a.id - b.id);
  }, [servicios, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getPageNumbers = () => Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border shadow-sm rounded-xl border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de Servicios</h1>
                <p className="mt-1 text-sm text-slate-500">Gestiona los tratamientos y precios ofrecidos en HEXIS</p>
              </div>
            </div>
            <button
              className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-[#132436] rounded-lg shadow-sm hover:bg-[#224666]"
              onClick={handleOpenCreate}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-semibold">Nuevo Servicio</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                <input
                  placeholder="Buscar tratamiento o descripción..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex items-center px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200">
              <span className="font-bold text-slate-700">{filteredData.length}</span>
              <span className="ml-1 text-slate-500 tracking-tight">servicios configurados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Servicios */}
      <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b bg-slate-50 border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-slate-500">ID</th>
                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-slate-500">Tratamiento</th>
                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-slate-500">Descripción</th>
                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-slate-500">Precio Base</th>
                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Sincronizando con HEXIS...
                  </td>
                </tr>
              ) : currentData.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-400">
                    #{item.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 leading-tight">{item.tratamiento}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-500 line-clamp-2 max-w-xs italic leading-relaxed">
                      "{item.descripcion || 'Sin descripción'}"
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-slate-900">
                      <span className="text-sm font-bold">S/ {Number(item.precio_base).toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleEstado(item.id)} 
                        className={`p-2 rounded-lg transition-colors ${
                          item.estado 
                            ? 'text-emerald-500 hover:bg-emerald-50' 
                            : 'text-slate-300 hover:bg-slate-100'
                        }`}
                        title={item.estado ? "Desactivar servicio" : "Activar servicio"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Paginación */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/30 flex justify-between items-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Gestión de Catálogo v1.0</p>
          <div className="flex gap-1">
            {getPageNumbers().map(n => (
              <button 
                key={n} 
                onClick={() => setCurrentPage(n)} 
                className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-all ${
                  currentPage === n ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ModalServicioHixes 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setServicioParaEditar(null);
        }}
        onSuccess={fetchServicios}
        servicioData={servicioParaEditar}
      />
    </div>
  )
}