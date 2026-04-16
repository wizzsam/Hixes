import { Search, ShieldCheck, Info, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"
import CrearRolModal from "../components/crearRolModal"
import EditarRolModal from "../components/editarRolModal"
import { useRolesAdmin } from "../hooks/useRolesAdmin"
import type { RolInput } from "../components/crearRolModal"

const ITEMS_PER_PAGE = 5;

export default function RolesAdmin() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rolToEdit, setRolToEdit] = useState<RolInput | null>(null);

  const { roles, isLoading, fetchRoles, } = useRolesAdmin();

  const handleRolCreado = () => {
    fetchRoles();
  };

  const handleRolEditado = () => {
    fetchRoles();
  };

  const filteredData = useMemo(() => {
    return roles.filter(item =>
      item.nombre_rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [roles, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // const handleEdit = (id: number) => {
  //   const rol = roles.find(r => r.id === id);
  //   if (rol) {
  //     setRolToEdit({
  //       id: rol.id,
  //       nombre_rol: rol.nombre_rol,
  //       descripcion: rol.descripcion || "",
  //     });
  //     setIsEditModalOpen(true);
  //   }
  // }

  // Handle page changes
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border shadow-sm rounded-xl border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestión de Roles</h1>
                <p className="mt-1 text-slate-600">Define los niveles de acceso y permisos del sistema</p>
              </div>
            </div>
            {/* <button
              className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-[#132436] rounded-lg shadow-sm hover:bg-[#224666]"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Rol</span>
            </button> */}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                <input
                  placeholder="Buscar rol..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
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
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Nombre del Rol</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Descripción</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                        Cargando roles...
                    </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                        No se encontraron roles.
                    </td>
                </tr>
              ) : (
                currentData.map((rol) => (
                  <tr key={rol.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-sm font-bold tracking-tight rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                        {rol.nombre_rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-2">
                        <Info className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                        <p className="text-sm text-slate-600">{rol.descripcion || "Sin descripción"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEdit(rol.id)}
                          className="p-2 transition-colors rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          title="Editar Rol"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminarRol(rol.id)}
                          className="p-2 transition-colors rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Eliminar Rol"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div> */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
          
        {/* Paginación */}
        {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <span className="text-sm text-slate-600">
                    Mostrando del <span className="font-semibold">{startIndex + 1}</span> al{' '}
                    <span className="font-semibold">{Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)}</span> de{' '}
                    <span className="font-semibold">{filteredData.length}</span> resultados
                </span>
                <div className="flex space-x-1">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-md bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1.5 text-sm font-medium border rounded-md ${
                                currentPage === page
                                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-md bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        )}
      </div>

      <CrearRolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRolCreado={handleRolCreado}
      />
      <EditarRolModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        rolData={rolToEdit}
        onRolEditada={handleRolEditado}
      />
    </div>
  )
}