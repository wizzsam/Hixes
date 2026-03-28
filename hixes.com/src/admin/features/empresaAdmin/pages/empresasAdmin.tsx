import { Edit, Search, Power, Eye, Building2 } from "lucide-react"
import { useState, useMemo } from "react"
import { useEmpresas } from "../hooks/useEmpresas"
import CrearEmpresaModal from "../components/crearEmpresaModal"
import EditarEmpresaModal from "../components/editarEmpresaModal"


const ITEMS_PER_PAGE = 5;

export default function EmpresasAdmin() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [empresaToEdit, setEmpresaToEdit] = useState<any | null>(null);

  const { empresas, isLoading, fetchEmpresas, toggleEstado } = useEmpresas();

  // Filtrado por Razón Social o RUC
  const filteredData = useMemo(() => {
    return empresas.filter(item =>
      item.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ruc.includes(searchTerm)
    );
  }, [empresas, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEdit = (id: number) => {
    const empresa = empresas.find(e => e.id === id);
    if (empresa) {
      setEmpresaToEdit(empresa);
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
              <div className="p-2 rounded-lg bg-blue-50">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestión de Empresas</h1>
                <p className="mt-1 text-slate-600">Administra las empresas clientes del sistema Hexis</p>
              </div>
            </div>
            {/* <button
              className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-[#132436] rounded-lg shadow-sm hover:bg-[#224666]"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Empresa</span>
            </button> */}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                <input
                  placeholder="Buscar por Razón Social o RUC..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200">
              <span className="font-medium text-slate-700">{filteredData.length}</span>
              <span className="ml-1 text-slate-500">empresas registradas</span>
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
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Fecha Creación</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">RUC / Empresa</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Dirección</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Teléfono</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Cargando empresas...</td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No se encontraron empresas.</td>
                </tr>
              ) : (
                currentData.map((empresa) => (
                  <tr key={empresa.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900">
                          {new Date(empresa.created_at || new Date()).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{empresa.ruc}</span>
                        <span className="text-xs text-slate-500">{empresa.razon_social}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 line-clamp-1">{empresa.direccion}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">{empresa.telefono}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleEstado(empresa.id)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${Number(empresa.estado) === 1 ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}>
                        {Number(empresa.estado) === 1 ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <button className="p-2 transition-colors rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(empresa.id)}
                          className="p-2 transition-colors rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleEstado(empresa.id)}
                          title={Number(empresa.estado) === 1 ? "Desactivar empresa" : "Activar empresa"}
                          className={`p-2 transition-colors rounded-lg ${Number(empresa.estado) === 1
                              ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
                              : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                            }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 border-t sm:flex-row border-slate-200">
          <div className="text-sm text-slate-600">
            Mostrando <span className="font-medium text-slate-900">{startIndex + 1}</span> a{" "}
            <span className="font-medium text-slate-900">{Math.min(endIndex, filteredData.length)}</span> de{" "}
            <span className="font-medium text-slate-900">{filteredData.length}</span> empresas
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
      </div>
      <CrearEmpresaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEmpresaCreada={() => { fetchEmpresas(); setIsModalOpen(false); }}
      />
      <EditarEmpresaModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        empresaData={empresaToEdit}
        onEmpresaEditada={() => { fetchEmpresas(); setIsEditModalOpen(false); }}
      />
    </div>
  )
}