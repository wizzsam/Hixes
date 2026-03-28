import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Cliente } from '../schemas/cliente.interface';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  onRecargar: (monto: number) => void;
}

export default function RecargarWalletModal({ isOpen, onClose, cliente, onRecargar }: Props) {
  const [monto, setMonto] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const montoNum = parseFloat(monto) || 0;
  let porcentajeBono = 0;
  if (montoNum >= 2000) porcentajeBono = 12;
  else if (montoNum >= 1000) porcentajeBono = 10;
  else if (montoNum >= 500) porcentajeBono = 8;
  else if (montoNum >= 300) porcentajeBono = 5;
  else if (montoNum >= 1) porcentajeBono = 3;

  const montoBono = (montoNum * porcentajeBono) / 100;
  const montoTotal = montoNum + montoBono;

  const handleClose = () => { setMonto(''); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      toast.error('Ingresa un monto válido.');
      return;
    }

    setIsLoading(true);
    await new Promise(res => setTimeout(res, 600));
    onRecargar(montoNum);
    toast.success(`Wallet recargado con S/${montoNum.toFixed(2)}.`);
    setIsLoading(false);
    handleClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
                <Dialog.Title className="text-lg font-bold text-slate-900">Recargar Wallet</Dialog.Title>
                <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6 space-y-5">
                {/* Info cliente */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 rounded-xl text-sm border border-amber-100">
                  <span className="font-medium text-slate-700">
                    Cliente: <span className="text-amber-600">{cliente.nombre_completo}</span>
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-medium text-slate-700">
                    Wallet actual: <span className="text-amber-600">S/{parseFloat(String(cliente.wallet)).toFixed(2)}</span>
                  </span>
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto a recargar (S/)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                  />
                  {montoNum > 0 ? (
                    <div className="mt-3 p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-sm">
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>Recarga base:</span>
                        <span>S/{montoNum.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-amber-600 font-medium mb-1">
                        <span>Bono HEXIS ({porcentajeBono}%):</span>
                        <span>+ S/{montoBono.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-bold border-t border-amber-200/60 pt-1 mt-1">
                        <span>Total a Wallet:</span>
                        <span>S/{montoTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-400">
                      La recarga no genera cashback. Vigencia: 12 meses.
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={handleClose} disabled={isLoading}
                    className="flex-1 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-60 transition-colors">
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Recargando...</span></> : 'Recargar Wallet'}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
