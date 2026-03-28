import { Edit, Plus, Search, Power, Eye, MapPin } from "lucide-react"
import { useState, useMemo } from "react"
import { useSedes } from "../hooks/useSedes"
import { useEmpresas } from "../../empresaAdmin/hooks/useEmpresas"
import CrearSedeModal from "../components/crearSedeModal"
import EditarSedeModal from "../components/editarSedeModal"

const ITEMS_PER_PAGE = 5;

export default function SedesAdmin() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sedeToEdit, setSedeToEdit] = useState<any | null>(null);

  const { sedes, isLoading, fetchSedes, toggleEstado,} = useSedes();
  const { empresas } = useEmpresas();

  // Filtrado por Nombre de Sede o Empresa
  const filteredData = useMemo(() => {
    return sedes.filter(item => {
      const nombreEmpresa = item.empresa?.razon_social || empresas.find(e => e.id === item.empresa_id)?.razon_social || "";
      return item.nombre_sede.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nombreEmpresa.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [sedes, empresas, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEdit = (id: number) => {
    const sede = sedes.find(s => s.id === id);
    if (sede) {
      setSedeToEdit(sede);
      setIsEditModalOpen(true);
    }
  }



  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border shadow-sm rounded-xl border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestión de Sedes</h1>
                <p className="mt-1 text-slate-600">Administra los locales físicos de cada empresa</p>
              </div>
            </div>
            <button
              className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-[#132436] rounded-lg shadow-sm hover:bg-[#224666]"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Sede</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                <input
                  placeholder="Buscar por sede o empresa..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200">
              <span className="font-medium text-slate-700">{filteredData.length}</span>
              <span className="ml-1 text-slate-500">sedes registradas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-slate-50 border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Sede</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Empresa</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Dirección</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Cargando sedes...</td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No se encontraron sedes.</td>
                </tr>
              ) : (
                currentData.map((sede) => {
                  const nombreEmpresa = sede.empresa?.razon_social || empresas.find(e => e.id === sede.empresa_id)?.razon_social || "Desconocida";
                  return (
                    <tr key={sede.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-bold text-slate-900">{sede.nombre_sede}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-600">{nombreEmpresa}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 line-clamp-1">{sede.direccion_sede}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleEstado(sede.id)}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${Number(sede.estado) === 1 ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}>
                          {Number(sede.estado) === 1 ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button className="p-2 transition-colors rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(sede.id)}
                            className="p-2 transition-colors rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleEstado(sede.id)}
                            title={Number(sede.estado) === 1 ? "Desactivar empresa" : "Activar empresa"}
                            className={`p-2 transition-colors rounded-lg ${Number(sede.estado) === 1
                              ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
                              : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                              }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredData.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 border-t sm:flex-row border-slate-200">
            <div className="text-sm text-slate-600">
              Mostrando <span className="font-medium text-slate-900">{startIndex + 1}</span> a{" "}
              <span className="font-medium text-slate-900">{Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)}</span> de{" "}
              <span className="font-medium text-slate-900">{filteredData.length}</span> sedes
            </div>
            <div className="flex items-center gap-2">
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum ? "bg-[#132436] text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <CrearSedeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSedeCreada={() => { fetchSedes(); setIsModalOpen(false); }}
      />
      <EditarSedeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        sedeData={sedeToEdit}
        onSedeEditada={() => { fetchSedes(); setIsEditModalOpen(false); }}
      />
    </div>
  )
}