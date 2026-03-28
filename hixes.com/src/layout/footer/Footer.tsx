import type { FC } from "react"
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react"
import { Link } from "react-router-dom"

export const Footer: FC = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">
        {/* Columna 1: Marca */}
        <div>
          <h2 className="text-xl font-semibold mb-3">MiEmpresa</h2>
          <p className="text-sm text-slate-400">
            Desarrollamos soluciones digitales modernas y eficientes. 
            Tu aliado en tecnología e innovación.
          </p>
        </div>

        {/* Columna 2: Navegación */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Enlaces</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-blue-400">Inicio</Link></li>
            <li><Link to="/nosotros" className="hover:text-blue-400">Nosotros</Link></li>
            <li><Link to="/servicios" className="hover:text-blue-400">Servicios</Link></li>
            <li><Link to="/contacto" className="hover:text-blue-400">Contacto</Link></li>
          </ul>
        </div>

        {/* Columna 3: Redes sociales */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Síguenos</h3>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook className="w-5 h-5 hover:text-blue-500 transition-colors" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram className="w-5 h-5 hover:text-pink-500 transition-colors" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5 hover:text-blue-400 transition-colors" />
            </a>
            <a href="mailto:contacto@miempresa.com" aria-label="Correo">
              <Mail className="w-5 h-5 hover:text-emerald-400 transition-colors" />
            </a>
          </div>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="border-t border-slate-800 py-4 text-center text-sm text-slate-400">
        © {year} MiEmpresa. Todos los derechos reservados.
      </div>
    </footer>
  )
}

export default Footer
