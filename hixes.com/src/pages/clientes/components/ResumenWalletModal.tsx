import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Copy, Check, MessageCircle } from 'lucide-react';
import type { Cliente } from '../schemas/cliente.interface';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  montoRecargado: number;
  montoTotal: number;
  porcentajeBono: number;
  montoBono: number;
}

export default function ResumenWalletModal({ isOpen, onClose, cliente, montoRecargado, montoTotal, porcentajeBono, montoBono }: Props) {
  const [copiado, setCopiado] = useState(false);

  const nombre = cliente.nombre_completo.split(' ')[0];

  const generarMensaje = () => {
    const lineas = [
      `🎉 ¡Felicidades, ${nombre}! Tu Wallet HEXIS fue recargado.`,
      ``,
      `💳 *Resumen de tu recarga*`,
      `💵 Monto recargado: S/${montoRecargado.toFixed(2)}`,
    ];

    if (montoBono > 0) {
      lineas.push(`🎁 Bono HEXIS (${porcentajeBono}%): +S/${montoBono.toFixed(2)}`);
      lineas.push(`✅ Total acreditado: S/${montoTotal.toFixed(2)}`);
    }

    lineas.push(``);
    lineas.push(`💼 *Tu Wallet HEXIS actualizado*`);
    lineas.push(`🏦 Nuevo saldo disponible: S/${(Number(cliente.wallet) + montoTotal).toFixed(2)}`);
    lineas.push(``);
    lineas.push(`⏰ *Vigencia:* 12 meses a partir de hoy`);
    lineas.push(`📌 Tu saldo se aplica automáticamente en tu próxima visita.`);
    lineas.push(``);
    lineas.push(`💆 Gracias por confiar en HEXIS. ¡Nos vemos pronto!`);

    return lineas.join('\n');
  };

  const texto = generarMensaje();

  const handleEnviarWhatsApp = () => {
    const phoneClean = cliente.telefono.replace(/\D/g, '');
    const fullPhone = phoneClean.length === 9 ? `51${phoneClean}` : phoneClean;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

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
            <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
                <div>
                  <Dialog.Title className="text-lg font-bold text-slate-900">Mensaje de Recarga</Dialog.Title>
                  <p className="text-[11px] text-slate-500 font-medium">Vista previa para enviar por WhatsApp</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-[#0f172a] text-[#10b981] p-5 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
                  {texto}
                </div>
                <p className="mt-4 text-xs text-slate-400 mb-5 text-center">
                  El mensaje se enviará al número <span className="font-bold text-slate-600">{cliente.telefono}</span>.
                </p>

                <button
                  onClick={handleEnviarWhatsApp}
                  className="w-full mb-3 flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-[#25D366] hover:bg-[#128C7E] rounded-xl transition-all shadow-lg shadow-green-100 group"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Enviar por WhatsApp
                </button>

                <div className="flex gap-3">
                  <button onClick={onClose}
                    className="flex-1 py-2.5 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    Cerrar
                  </button>
                  <button onClick={handleCopiar}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors ${copiado ? 'bg-emerald-600' : 'bg-slate-800 hover:bg-slate-900'}`}>
                    {copiado ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Texto</>}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
