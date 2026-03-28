import { useState, useEffect, } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Loader2, ShieldCheck, MapPin, RefreshCw } from 'lucide-react';
import { clientesService } from '../clientes/services/clientesService';

const generarCaptcha = () => {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const ops = ['+', '-', 'x'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let result: number;
  if (op === '+') result = a + b;
  else if (op === '-') result = Math.max(a, b) - Math.min(a, b);
  else result = a * b;
  const pregunta = op === '-'
    ? `${Math.max(a, b)} − ${Math.min(a, b)}`
    : op === 'x'
    ? `${a} × ${b}`
    : `${a} + ${b}`;
  return { pregunta, respuesta: result };
};

interface SedeOpcion {
  id: number;
  nombre_sede: string;
}

export const FormularioPage = () => {
  const [searchParams] = useSearchParams();
  const empresaId = Number(searchParams.get('empresa_id') ?? '1');

  const [sedes, setSedes] = useState<SedeOpcion[]>([]);
  const [loadingSedes, setLoadingSedes] = useState(true);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    celular: '',
    correo: '',
    sedeId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [captcha, setCaptcha] = useState(generarCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  useEffect(() => {
    clientesService.obtenerSedesPublicas(empresaId)
      .then(data => setSedes(data))
      .catch(() => setSedes([]))
      .finally(() => setLoadingSedes(false));
  }, [empresaId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sedeId) {
      setErrorMsg('Por favor selecciona una sede.');
      return;
    }
    if (parseInt(captchaInput) !== captcha.respuesta) {
      setCaptchaError(true);
      setCaptcha(generarCaptcha());
      setCaptchaInput('');
      return;
    }
    setCaptchaError(false);
    setIsLoading(true);
    setErrorMsg('');
    try {
      await clientesService.registroPublico({
        nombre_completo: `${formData.nombre.trim()} ${formData.apellido.trim()}`,
        dni: formData.dni,
        telefono: formData.celular,
        correo: formData.correo.trim() || undefined,
        sede_id: Number(formData.sedeId),
      });
      setIsSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.dni?.[0]
        ?? err?.response?.data?.message
        ?? 'Ocurrió un error al registrarte. Inténtalo de nuevo.';
      setErrorMsg(msg);
      setCaptcha(generarCaptcha());
      setCaptchaInput('');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 antialiased"
        style={{
          backgroundImage: 'linear-gradient(to bottom right, rgba(249, 250, 251, 0.9), rgba(240, 241, 243, 0.95)), url("https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?q=80&w=2000")',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
        <div className="max-w-md w-full bg-white/80 backdrop-blur-md p-12 rounded-xl shadow-xl border border-white text-center animate-fade-in">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check className="text-white w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl text-gray-900 mb-4 tracking-wide">¡REGISTRO COMPLETADO!</h2>
          <p className="text-sm text-gray-500 font-light leading-relaxed">
            Bienvenido a la experiencia <strong>HEXIS</strong>. Tu perfil ha sido creado correctamente y ya puedes empezar a disfrutar de tus beneficios.
          </p>
          <button onClick={() => { setIsSubmitted(false); setFormData({ nombre: '', apellido: '', dni: '', celular: '', correo: '', sedeId: '' }); }} className="mt-8 w-full py-3.5 bg-gray-900 text-white text-xs font-medium uppercase tracking-[0.2em] rounded-md hover:bg-gray-800 transition-all">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 antialiased"
      style={{
        backgroundImage: 'linear-gradient(to bottom right, rgba(249, 250, 251, 0.85), rgba(240, 241, 243, 0.90)), url("https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?q=80&w=2000")',
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
      <div className="max-w-2xl w-full space-y-8 bg-white/70 backdrop-blur-sm p-8 md:p-12 rounded-xl shadow-lg border border-gray-100">

        {/* Header */}
        <div className="text-center">
          <h2 className="font-serif text-4xl font-extralight text-gray-900 tracking-widest uppercase">HEXIS</h2>
          <div className="mt-4 flex flex-col items-center">
            <span className="h-[1px] w-12 bg-gray-300 mb-4"></span>
            <p className="text-xs text-gray-500 font-light uppercase tracking-[0.3em]">Programa de Beneficios</p>
            <p className="mt-2 text-[10px] text-gray-400 font-light tracking-normal italic">
              Únete a nuestra comunidad exclusiva y acumula recompensas
            </p>
          </div>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-widest ml-1">Nombre</label>
              <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} placeholder="Ej. Abel"
                className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-white/50 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm transition-all" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-widest ml-1">Apellido</label>
              <input type="text" name="apellido" required value={formData.apellido} onChange={handleChange} placeholder="Ej. Pelaez"
                className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-white/50 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-widest ml-1">Documento (DNI)</label>
              <input type="text" name="dni" required maxLength={8} value={formData.dni} onChange={handleChange} placeholder="00000000"
                className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-white/50 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm transition-all" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-widest ml-1">Teléfono</label>
              <input type="text" name="celular" required maxLength={9} value={formData.celular} onChange={handleChange} placeholder="987..."
                className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-white/50 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm transition-all" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-widest ml-1">
              Correo Electrónico <span className="normal-case text-gray-400">(opcional)</span>
            </label>
            <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="ejemplo@gmail.com"
              className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-white/50 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm transition-all" />
          </div>

          {/* Sede */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 uppercase tracking-widest ml-1">
              <MapPin className="w-3 h-3" /> Sede de Preferencia
            </label>
            {loadingSedes ? (
              <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-md bg-white/50">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-400">Cargando sedes...</span>
              </div>
            ) : (
              <select name="sedeId" required value={formData.sedeId} onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-white/50 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm transition-all">
                <option value="">— Selecciona tu sede —</option>
                {sedes.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre_sede}</option>
                ))}
              </select>
            )}
          </div>

          {errorMsg && (
            <p className="text-sm text-red-500 text-center font-medium">{errorMsg}</p>
          )}

          {/* CAPTCHA */}
          <div className="space-y-2">
            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-widest ml-1">
              Verificación de seguridad
            </label>
            <div className={`flex items-center gap-3 px-4 py-3 border rounded-md bg-white/70 ${captchaError ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="flex-1 flex items-center gap-3">
                <span className="font-mono text-base font-bold text-gray-800 select-none tracking-wider bg-gray-100 px-3 py-1.5 rounded">
                  {captcha.pregunta} = ?
                </span>
                <input
                  type="number"
                  value={captchaInput}
                  onChange={e => { setCaptchaInput(e.target.value); setCaptchaError(false); }}
                  placeholder="R."
                  required
                  className="w-20 px-3 py-1.5 border border-gray-200 bg-white text-gray-900 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <button
                type="button"
                onClick={() => { setCaptcha(generarCaptcha()); setCaptchaInput(''); setCaptchaError(false); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                title="Cambiar pregunta"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {captchaError && (
              <p className="text-xs text-red-500 ml-1">Respuesta incorrecta. Intenta con la nueva pregunta.</p>
            )}
          </div>

          <button type="submit" disabled={isLoading || loadingSedes}
            className="w-full py-4 mt-8 bg-gray-900 text-white text-xs font-medium uppercase tracking-[0.3em] rounded-md hover:bg-gray-800 disabled:opacity-50 transition-all shadow-sm">
            {isLoading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> PROCESANDO...</span> : 'REGISTRARME AHORA'}
          </button>

          <div className="pt-6 border-t border-gray-100">
            <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-gray-400" />
              <p className="text-[10px] text-gray-500 font-light tracking-tight text-center">
                Sus datos están protegidos bajo nuestra política de privacidad HEXIS.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};