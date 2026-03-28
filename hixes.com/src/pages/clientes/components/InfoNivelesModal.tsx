import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Lock } from 'lucide-react';
import type { Cliente, Nivel } from '../schemas/cliente.interface';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  niveles: Nivel[];
}

export default function InfoNivelesModal({ isOpen, onClose, cliente, niveles }: Props) {
  if (niveles.length === 0) return null;

  // Encontrar nivel actual
  const nivelActual = niveles.slice().reverse().find(n => cliente.consumo_acumulado >= n.consumo_minimo) ?? niveles[0];
  
  // Encontrar el siguiente nivel
  const idx = niveles.findIndex(n => n.id === nivelActual.id);
  const siguienteNivel = idx >= 0 && idx < niveles.length - 1 ? niveles[idx + 1] : null;

  const faltaParaSiguiente = siguienteNivel
    ? Math.max(0, siguienteNivel.consumo_minimo - cliente.consumo_acumulado)
    : 0;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 shrink-0">
                <Dialog.Title className="text-lg font-bold text-slate-900">Programa de Niveles HEXIS</Dialog.Title>
                <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-5 space-y-5">
                {/* Nivel actual del cliente */}
                <div className="border-2 border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Nivel actual de {cliente.nombre_completo.split(' ')[0]}
                  </p>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{nivelActual.icono}</span>
                        <span className="text-2xl font-bold text-slate-900">{nivelActual.nombre}</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">Beneficios exclusivos del nivel {nivelActual.nombre}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-slate-900">{nivelActual.cashback_porcentaje}%</p>
                      <p className="text-xs text-slate-400">cashback</p>
                      <p className="text-xs text-slate-400">{nivelActual.vigencia_dias} días vigencia</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-sm">
                    <span className="text-slate-500">Consumo: <span className="font-semibold text-slate-800">S/{parseFloat(String(cliente.consumo_acumulado)).toFixed(2)}</span></span>
                    {siguienteNivel && (
                      <span className="text-slate-500">Meta: <span className="font-semibold text-slate-800">S/{parseFloat(String(siguienteNivel.consumo_minimo)).toFixed(2)}</span></span>
                    )}
                  </div>
                  {siguienteNivel && (
                    <p className="mt-2 text-xs text-slate-500">
                      Faltan <span className="font-semibold">S/{faltaParaSiguiente.toFixed(2)}</span> en consumo para subir a{' '}
                      <span className={`font-semibold ${siguienteNivel.color}`}>{siguienteNivel.icono} {siguienteNivel.nombre}</span>
                    </p>
                  )}
                </div>

                {/* Cómo subir */}
                {siguienteNivel && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">💡</span>
                      <div className="text-sm text-slate-700">
                        <p className="font-semibold text-blue-700 mb-1">Cómo subir a {siguienteNivel.icono} {siguienteNivel.nombre}</p>
                        <p>Cada visita que realizas y consumes un servicio en HEXIS, ese monto se acumula automáticamente.
                          Con solo <span className="font-bold">S/{faltaParaSiguiente.toFixed(2)} más en servicios</span> alcanzas el nivel{' '}
                          <span className="font-bold">{siguienteNivel.nombre}</span> y obtienes{' '}
                          <span className="font-bold">{siguienteNivel.cashback_porcentaje}% de cashback</span> con{' '}
                          <span className="font-bold">{siguienteNivel.vigencia_dias} días de vigencia</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Todos los niveles */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Todos los niveles del programa</h3>
                  <div className="space-y-2">
                    {niveles.map(nivel => {
                      const esActual = nivel.id === nivelActual.id;
                      const bloqueado = nivel.consumo_minimo > cliente.consumo_acumulado && !esActual;
                      return (
                        <div
                          key={nivel.id}
                          className={`relative p-4 rounded-xl border transition-all ${
                            esActual
                              ? 'border-slate-300 bg-white shadow-sm'
                              : bloqueado
                              ? 'border-slate-100 bg-slate-50 opacity-60'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          {esActual && (
                            <span className="absolute top-3 right-3 text-xs font-semibold bg-slate-800 text-white px-2 py-0.5 rounded-full">
                              Nivel actual
                            </span>
                          )}
                          {bloqueado && (
                            <span className="absolute top-3 right-3">
                              <Lock className="w-4 h-4 text-slate-300" />
                            </span>
                          )}
                          <div className="flex items-center gap-3">
                            <span className="text-xl w-8 text-center">{nivel.icono}</span>
                            <div>
                                <p className={`font-bold text-sm ${bloqueado ? 'text-slate-400' : 'text-slate-800'}`}>
                                  {nivel.nombre} <span className={`font-normal ${bloqueado ? 'text-slate-400' : 'text-slate-500'}`}>{nivel.cashback_porcentaje}% cashback</span>
                                </p>
                                <p className={`text-xs mt-0.5 ${bloqueado ? 'text-slate-400' : 'text-slate-500'}`}>Beneficio nivel {nivel.nombre}</p>
                                <p className={`text-xs mt-1.5 ${bloqueado ? 'text-slate-400' : 'text-slate-400'}`}>
                                  S/{nivel.consumo_minimo} en adelante
                                  {'  · '}Cashback válido {nivel.vigencia_dias} días
                                </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
