import type { FC } from "react"
import { Info } from "lucide-react"

export interface CourseCardProps {
  title: string
  description: string
  progressPct: number // 0 - 100
  modules: number
  sessions: number
  ctaText?: string
  onClick?: () => void
}

export const CourseCard: FC<CourseCardProps> = ({
  title,
  description,
  progressPct,
  modules,
  sessions,
  ctaText = "Continuar",
  onClick,
}) => {
  const pct = Math.max(0, Math.min(100, progressPct))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden w-full max-w-md">
      {/* Banda superior tipo cover */}
      <div className="h-20 bg-gradient-to-r from-emerald-500 to-blue-500" />

      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>

        {/* Progreso */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700">Progreso</span>
            <span className="font-semibold text-emerald-700">{pct}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full rounded-full bg-emerald-100">
            <div
              className="h-2.5 rounded-full bg-emerald-600 transition-[width]"
              style={{ width: `${pct}%` }}
              aria-label={`Progreso ${pct}%`}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Meta: módulos y sesiones */}
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <Info className="h-4 w-4" aria-hidden />
          <span>
            {modules} módulo{modules !== 1 ? "s" : ""} · {sessions} sesión
            {sessions !== 1 ? "es" : ""}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={onClick}
          className="mt-5 w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 active:translate-y-px"
        >
          {ctaText}
        </button>
      </div>
    </div>
  )
}

export default CourseCard
