import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Loader2, ArrowUpRight, Calendar, Pencil, Download, Mail, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import NuevoClienteModal from './components/NuevoClienteModal';
import EditarClienteModal from './components/EditarClienteModal';
import { useClientes } from './hooks/useClientes';
import { useNiveles } from './hooks/useNiveles';
import type { Cliente } from './schemas/cliente.interface';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const inicial = (nombre: string) => nombre.charAt(0).toUpperCase();
const ITEMS_POR_PAGINA = 10;

export const ClientesPage = () => {
  const { clientes, isLoading: loadingClientes, agregarCliente, actualizarCliente, toggleEstado } = useClientes();
  const { niveles, isLoading: loadingNiveles, getNivelActual } = useNiveles();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('activos');
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [toggling, setToggling] = useState<number | null>(null);

  const isLoading = loadingClientes || loadingNiveles;

  const filtrados = useMemo(() => {
    let lista = clientes.filter(c => {
      if (!c.con_beneficios) return false;  // Solo clientes con beneficios habilitados
      const coincideBusqueda =
        c.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.dni.includes(busqueda) ||
        c.telefono.includes(busqueda);
      if (!coincideBusqueda) return false;
      if (filtroEstado === 'activos' && !c.estado) return false;
      if (filtroEstado === 'inactivos' && c.estado) return false;
      if (filtroNivel !== null) {
        const nivel = getNivelActual(c.consumo_acumulado);
        return nivel?.id === filtroNivel;
      }
      return true;
    });
    // Activos primero (por fecha desc), inactivos al final (por fecha desc)
    lista = lista.sort((a, b) => {
      if (a.estado !== b.estado) return a.estado ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return lista;
  }, [clientes, busqueda, filtroEstado, filtroNivel, getNivelActual]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const paginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return filtrados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [filtrados, paginaActual]);

  const handleToggleEstado = async (cliente: Cliente) => {
    setToggling(cliente.id);
    try {
      await toggleEstado(cliente.id);
    } finally {
      setToggling(null);
    }
  };

  const resetPagina = () => setPaginaActual(1);

  const exportarExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Clientes');

    ws.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre Completo', key: 'nombre_completo', width: 30 },
      { header: 'DNI', key: 'dni', width: 12 },
      { header: 'Teléfono', key: 'telefono', width: 14 },
      { header: 'Correo Gmail', key: 'correo', width: 28 },
      { header: 'Nivel', key: 'nivel', width: 14 },
      { header: 'Wallet (S/)', key: 'wallet', width: 14 },
      { header: 'Cashback (S/)', key: 'cashback', width: 14 },
      { header: 'Consumo Acumulado (S/)', key: 'consumo_acumulado', width: 24 },
      { header: 'Fecha de Registro', key: 'created_at', width: 20 },
    ];

    // Estilo de cabecera
    const headerRow = ws.getRow(1);
    headerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF1E3A5F' } },
        bottom: { style: 'thin', color: { argb: 'FF1E3A5F' } },
        left: { style: 'thin', color: { argb: 'FF1E3A5F' } },
        right: { style: 'thin', color: { argb: 'FF1E3A5F' } },
      };
    });
    headerRow.height = 22;

    const numFmt = '#,##0.00';
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'hair', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'hair', color: { argb: 'FFD1D5DB' } },
      left: { style: 'hair', color: { argb: 'FFD1D5DB' } },
      right: { style: 'hair', color: { argb: 'FFD1D5DB' } },
    };

    filtrados.forEach((c, idx) => {
      const nivel = getNivelActual(c.consumo_acumulado);
      const isEven = idx % 2 === 0;
      const rowData = {
        id: c.id,
        nombre_completo: c.nombre_completo,
        dni: c.dni,
        telefono: c.telefono,
        correo: c.correo || '---',
        nivel: nivel ? nivel.nombre : '---',
        wallet: parseFloat(String(c.wallet)),
        cashback: parseFloat(String(c.cashback)),
        consumo_acumulado: parseFloat(String(c.consumo_acumulado)),
        created_at: c.created_at ? new Date(c.created_at).toLocaleDateString() : '---',
      };
      const row = ws.addRow(rowData);
      row.height = 18;
      row.eachCell((cell, colNum) => {
        cell.border = borderStyle;
        cell.alignment = { vertical: 'middle', horizontal: colNum === 2 ? 'left' : 'center' };
        if (isEven) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        }
      });
      // Formato numérico para S/
      ['wallet', 'cashback', 'consumo_acumulado'].forEach(key => {
        const col = ws.getColumn(key);
        const cell = row.getCell(col.number);
        cell.numFmt = numFmt;
      });
    });

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), 'clientes.xlsx');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 md:gap-0 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 md:space-x-4 w-full">
          <div className="bg-indigo-50 p-2.5 md:p-3 rounded-xl ring-1 ring-indigo-100 shrink-0">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-bold text-slate-800">Gestión de Clientes</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5 font-medium leading-tight md:leading-normal">
              Administra tu cartera de clientes y haz seguimientos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <button
            onClick={exportarExcel}
            className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 md:px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            title="Exportar a Excel"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-2 md:flex-none flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-600/20 focus:ring-2 focus:ring-blue-500/50 whitespace-nowrap"
          >
            + Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Buscador + Filtros */}
      <div className="space-y-3">
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); resetPagina(); }}
            placeholder="Buscar por nombre, DNI o teléfono..."
            className="w-full pl-11 pr-4 py-3.5 text-sm bg-transparent rounded-2xl focus:outline-none text-slate-700 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Filtro estado */}
          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5 shadow-sm">
            {(['activos', 'todos', 'inactivos'] as const).map(e => (
              <button key={e} onClick={() => { setFiltroEstado(e); resetPagina(); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors capitalize ${filtroEstado === e ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                {e === 'activos' ? '● Activos' : e === 'inactivos' ? '○ Inactivos' : 'Todos'}
              </button>
            ))}
          </div>

          {/* Filtro por nivel */}
          {!loadingNiveles && niveles.length > 0 && (
            <>
              <button
                onClick={() => { setFiltroNivel(null); resetPagina(); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${filtroNivel === null ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                Niveles: Todos
              </button>
              {niveles.map(n => (
                <button
                  key={n.id}
                  onClick={() => { setFiltroNivel(n.id); resetPagina(); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${filtroNivel === n.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  <span>{n.icono}</span>
                  <span>{n.nombre}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Contenedor de Tabla Estilo Excel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Cargando base de datos...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <Users className="w-16 h-16 text-slate-200 mb-4" />
            <h2 className="text-lg font-bold text-slate-700">No se encontraron clientes</h2>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">Intenta ajustar los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Información del Cliente</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Sede</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Correo</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Registro</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Categoría / Nivel</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Saldo Wallet</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Cashback</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginados.map(cliente => {
                  const nivel = getNivelActual(cliente.consumo_acumulado);
                  const inactivo = !cliente.estado;

                  return (
                    <tr key={cliente.id} className={`group hover:bg-slate-50/50 transition-all cursor-default ${inactivo ? 'opacity-50' : ''}`}>
                      {/* Cliente */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                            <span className="text-slate-600 font-bold text-xs">{inicial(cliente.nombre_completo)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 leading-none mb-1">{cliente.nombre_completo}</span>
                            <span className="text-[11px] text-slate-400 font-medium">DNI: {cliente.dni}</span>
                          </div>
                        </div>
                      </td>

                      {/* Sede */}
                      <td className="px-6 py-4">
                        {cliente.sede ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="text-xs font-semibold text-slate-700">{cliente.sede.nombre_sede}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Correo */}
                      <td className="px-6 py-4">
                        {cliente.correo ? (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-xs font-medium truncate max-w-40">{cliente.correo}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Fecha de Registro */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">
                            {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString() : '---'}
                          </span>
                        </div>
                      </td>

                      {/* Nivel */}
                      <td className="px-6 py-4">
                        {nivel ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                            <span>{nivel.icono}</span>
                            <span>{nivel.nombre}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">Sin nivel</span>
                        )}
                      </td>

                      {/* Wallet */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-slate-700">
                          S/ {parseFloat(String(cliente.wallet)).toFixed(2)}
                        </span>
                      </td>

                      {/* Cashback */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-emerald-600">
                          S/ {parseFloat(String(cliente.cashback)).toFixed(2)}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleToggleEstado(cliente)}
                            disabled={toggling === cliente.id}
                            title={cliente.estado ? 'Desactivar cliente' : 'Activar cliente'}
                            className={`p-2 rounded-lg transition-colors ${
                              toggling === cliente.id
                                ? 'opacity-50 cursor-not-allowed text-slate-300'
                                : cliente.estado
                                  ? 'text-emerald-500 hover:text-red-500 hover:bg-red-50'
                                  : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'
                            }`}
                          >
                            {toggling === cliente.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : cliente.estado
                                ? <ToggleRight className="w-4 h-4" />
                                : <ToggleLeft className="w-4 h-4" />
                            }
                          </button>
                          <button
                            onClick={() => setClienteEditando(cliente)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar datos"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => navigate(`/trabajador/clientes/${cliente.id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver Perfil"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!isLoading && totalPaginas > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando {Math.min((paginaActual - 1) * ITEMS_POR_PAGINA + 1, filtrados.length)}
              –{Math.min(paginaActual * ITEMS_POR_PAGINA, filtrados.length)} de {filtrados.length} clientes
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Anterior
              </button>
              <div className="flex items-center gap-1.5 min-w-[60px] justify-center">
                <span className="text-xs font-black text-slate-800">{paginaActual}</span>
                <span className="text-xs text-slate-400">/</span>
                <span className="text-xs font-bold text-slate-400">{totalPaginas}</span>
              </div>
              <button
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal nuevo cliente */}
      <NuevoClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClienteCreado={async (data) => agregarCliente({ ...data, con_beneficios: true })}
      />

      {/* Modal editar cliente */}
      <EditarClienteModal
        isOpen={clienteEditando !== null}
        onClose={() => setClienteEditando(null)}
        cliente={clienteEditando}
        onActualizar={actualizarCliente}
      />
    </div>
  );
};