import type { FC } from "react"
import { Link } from "react-router-dom"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  tabs: { href: string; label: string }[]
}

export const MobileMenu: FC<MobileMenuProps> = ({ isOpen, onClose, tabs }) => {
  if (!isOpen) return null
  return (
    <div className="md:hidden fixed inset-0 z-[60] bg-black/30" onClick={onClose}>
      <div className="absolute left-0 top-0 h-full w-72 bg-white shadow p-4" onClick={(e)=>e.stopPropagation()}>
        <ul className="space-y-2">
          {tabs.map(t => (
            <li key={t.href}>
              <Link to={t.href} className="block px-2 py-2 rounded hover:bg-slate-50" onClick={onClose}>
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
