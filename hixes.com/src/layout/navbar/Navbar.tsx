import type { FC } from "react"
import { Link, useLocation } from "react-router-dom"
import { LogOut } from "lucide-react"

export interface NavbarProps {
  appName: string
  subtitle?: string
  logoSrc: string
  userName?: string
  onLogout?: () => void
  tabs: { href: string; label: string }[]
}

export const Navbar: FC<NavbarProps> = ({
  appName,
  subtitle,
  logoSrc,
  userName,
  onLogout,
  tabs,
}) => {
  const location = useLocation()
  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/")

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Barra superior */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="shrink-0">
            <img src={logoSrc} alt="logo" className="h-9 w-9 rounded-md" />
          </Link>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{appName}</span>
            </div>
            {subtitle && (
              <span className="text-xs text-slate-500 truncate">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <div className="hidden sm:flex flex-col text-right leading-tight">
              <span className="text-xs text-slate-500">Bienvenido,</span>
              <span className="text-sm font-medium text-slate-900">{userName}</span>
            </div>
          )}
          {/* Avatar dummy (puedes reemplazar por <img src=.../> ) */}
          <div className="h-9 w-9 rounded-full bg-slate-200 grid place-content-center text-slate-600">
            🙂
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Línea separadora */}
      {tabs?.length > 0 && (
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      )}

      {/* Tabs inferiores */}
      {tabs?.length > 0 && (
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-6 text-sm">
            {tabs.map((t) => (
              <li key={t.href}>
                <Link
                  to={t.href}
                  className={`inline-flex h-12 items-center border-b-2 transition-all duration-200 font-medium
                    ${isActive(t.href)
                      ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"}
                  `}
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}

export default Navbar
