import { Edit, Plus, Search, Power, User, Mail, Building, Shield, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"
import CrearUsuarioModal from "../components/crearUsuarioModal"
import EditarUsuarioModal from "../components/editarUsuarioModal"
import { useUsuarios } from "../hooks/useUsuarios"
import type { UsuarioInput } from "../components/crearUsuarioModal"

const ITEMS_PER_PAGE = 5;

export default function UsuariosAdmin() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState<UsuarioInput | null>(null);

  const { usuarios, isLoading, fetchUsuarios, toggleEstado } = useUsuarios();

  const handleUsuarioCreado = () => {
    fetchUsuarios();
  };

  const handleUsuarioEditado = () => {
    fetchUsuarios();
  };

  const filteredData = useMemo(() => {
    return usuarios.filter(item =>
      item.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.correo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [usuarios, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleEdit = (id_usuario: number) => {
    const usuario = usuarios.find(u => u.id_usuario === id_usuario);
    if (usuario) {
      setUsuarioToEdit({
        id_usuario: usuario.id_usuario,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        rol_ids: usuario.roles?.map(r => r.id) ?? (usuario.rol_id ? [usuario.rol_id] : [])?.map(r => r.id) ?? (usuario.rol_id ? [usuario.rol_id] : []),
        empresa_id: usuario.empresa_id,
        sede_ids: usuario.sedes?.map(s => s.id) ?? [],
        estado: usuario.estado ? 1 : 0,
      });
      setIsEditModalOpen(true);
    }
  }

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
              <div className="p-2 rounded-lg bg-orange-50">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
                <p className="mt-1 text-slate-600">Administra las cuentas y accesos de todo el sistema</p>
              </div>
            </div>
            <button
              className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-[#132436] rounded-lg shadow-sm hover:bg-[#224666]"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
              <input
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              />
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
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Usuario</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Empresa</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Rol</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500 mb-2" />
                        Cargando usuarios...
                    </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No se encontraron usuarios.
                    </td>
                </tr>
              ) : (
                currentData.map((u) => (
                  <tr key={u.id_usuario} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{u.nombre_completo}</span>
                          <div className="flex items-center text-xs text-slate-500">
                            <Mail className="w-3 h-3 mr-1" />
                            {u.correo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-600">
                        <Building className="w-4 h-4 mr-2 text-slate-400" />
                        {u.nombre_empresa}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1 items-center">
                        <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                        {(u.roles?.length ? u.roles : u.nombre_rol ? [{ id: u.rol_id, nombre_rol: u.nombre_rol }] : []).map(r => (
                          <span key={r.id} className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                            {r.nombre_rol}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleEstado(u.id_usuario)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          u.estado ? "bg-emerald-100 text-emerald-800 focus:ring-emerald-500" : "bg-red-100 text-red-800 focus:ring-red-500"
                        }`}
                        title="Clic para cambiar estado"
                      >
                        {u.estado ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <button onClick={() => handleEdit(u.id_usuario)} className="p-2 transition-colors rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                          <Edit className="w-4 h-4" />
                        </button>
                       <button
                            onClick={() => toggleEstado(u.id_usuario)}
                            title={Number(u.estado) === 1 ? "Desactivar empresa" : "Activar empresa"}
                            className={`p-2 transition-colors rounded-lg ${Number(u.estado) === 1
                              ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
                              : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                              }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                      </div>
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
                                    ? 'bg-orange-50 text-orange-600 border-orange-200'
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

      <CrearUsuarioModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUsuarioCreado={handleUsuarioCreado} />
      <EditarUsuarioModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} usuarioData={usuarioToEdit} onUsuarioEditada={handleUsuarioEditado} />
    </div>
  )
}