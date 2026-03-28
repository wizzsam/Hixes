import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Copy, Check, MessageCircle } from 'lucide-react'; // Añadimos MessageCircle
import type { Cliente, Nivel } from '../schemas/cliente.interface';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  servicio: string;
  monto: number;
  walletUsado: number;
  cashbackUsado: number;
  nivelActual: Nivel;
  siguienteNivel: Nivel | null;
  faltaParaSig: number;
}

export default function ResumenMensajeModal({ isOpen, onClose, cliente, servicio, monto, walletUsado, cashbackUsado, nivelActual, siguienteNivel, faltaParaSig }: Props) {
  const [copiado, setCopiado] = useState(false);

  const nombre = cliente.nombre_completo.split(' ')[0]; // Solo el primer nombre
  const usaSaldo = walletUsado > 0 || cashbackUsado > 0;
  const efectivoPagado = monto - walletUsado - cashbackUsado;
  const cashbackNuevo = ((monto - cashbackUsado) * nivelActual.cashback_porcentaje) / 100;

  const generarMensaje = () => {
    const lineas = [
      `✨ ¡Gracias por tu visita a HEXIS, ${nombre}! ✨`,
      ``,
      `📋 *Resumen de tu visita*`,
      `🛎️ Servicio: ${servicio}`,
      `💰 Total del servicio: S/${monto.toFixed(2)}`,
    ];

    if (usaSaldo) {
      lineas.push(``);
      lineas.push(`💳 *Beneficios aplicados*`);
      if (walletUsado > 0) lineas.push(`🔵 Wallet HEXIS: -S/${walletUsado.toFixed(2)}`);
      if (cashbackUsado > 0) lineas.push(`🟢 Cashback: -S/${cashbackUsado.toFixed(2)}`);
      lineas.push(`🏷️ Pagaste en caja: S/${efectivoPagado.toFixed(2)}`);
    }

    lineas.push(``);
    lineas.push(`🎁 *Tu Cuenta HEXIS*`);
    lineas.push(`⭐ Nivel: ${nivelActual.icono} ${nivelActual.nombre} (${nivelActual.cashback_porcentaje}% cashback)`);
    lineas.push(`💚 Cashback generado hoy: +S/${cashbackNuevo.toFixed(2)}`);
    lineas.push(`💼 Saldo Wallet: S/${parseFloat(String(cliente.wallet)).toFixed(2)}`);
    lineas.push(`🏦 Cashback acumulado: S/${parseFloat(String(cliente.cashback)).toFixed(2)}`);

    lineas.push(``);
    if (siguienteNivel) {
      lineas.push(`🚀 ¡Te faltan S/${parseFloat(String(faltaParaSig)).toFixed(2)} para subir a ${siguienteNivel.icono} ${siguienteNivel.nombre}!`);
    } else {
      lineas.push(`👑 ¡Eres nuestro cliente VIP de más alto nivel!`);
    }

    lineas.push(``);
    lineas.push(`💆 Tu bienestar siempre vuelve a HEXIS.`);
    lineas.push(`_Vigencia de beneficios: ${nivelActual.vigencia_dias} días_`);

    return lineas.join('\n');
  };

  const texto = generarMensaje();

  // --- NUEVA FUNCIÓN PARA WHATSAPP ---
  const handleEnviarWhatsApp = () => {
    // 1. Limpiamos el número (solo dejamos dígitos)
    const phoneClean = cliente.telefono.replace(/\D/g, '');
    
    // 2. Si no tiene código de país, asumimos Perú (+51) por tu ubicación
    const fullPhone = phoneClean.length === 9 ? `51${phoneClean}` : phoneClean;
    
    // 3. Codificamos el texto para URL
    const encodedText = encodeURIComponent(texto);
    
    // 4. Abrimos el link oficial de WhatsApp
    window.open(`https://wa.me/${fullPhone}?text=${encodedText}`, '_blank');
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
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 hidden sm:flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
                <Dialog.Title className="text-lg font-bold text-slate-900">Vista previa del mensaje</Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
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

                {/* Botón Principal de WhatsApp */}
                <button
                  onClick={handleEnviarWhatsApp}
                  className="w-full mb-3 flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-[#25D366] hover:bg-[#128C7E] rounded-xl transition-all shadow-lg shadow-green-100 group"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Enviar por WhatsApp
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={handleCopiar}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors ${
                      copiado ? 'bg-emerald-600' : 'bg-slate-800 hover:bg-slate-900'
                    }`}
                  >
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