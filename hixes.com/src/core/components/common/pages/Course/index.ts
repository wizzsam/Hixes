import type { CourseCardProps } from "./CourseCard"

// Datos de ejemplo para los cursos de fitness
export const mockCourses: CourseCardProps[] = [
  {
    title: "Fundamentos de Fitness",
    description: "Aprende los conceptos básicos del entrenamiento físico, anatomía y nutrición deportiva.",
    progressPct: 75,
    modules: 8,
    sessions: 24,
    ctaText: "Continuar curso",
    onClick: () => console.log("Navegando a Fundamentos de Fitness")
  },
  {
    title: "Entrenamiento Funcional",
    description: "Domina los movimientos funcionales y técnicas de entrenamiento para mejorar la fuerza y movilidad.",
    progressPct: 45,
    modules: 6,
    sessions: 18,
    ctaText: "Reanudar",
    onClick: () => console.log("Navegando a Entrenamiento Funcional")
  },
  {
    title: "Nutrición Deportiva Avanzada",
    description: "Estrategias nutricionales para optimizar el rendimiento deportivo y la composición corporal.",
    progressPct: 20,
    modules: 10,
    sessions: 32,
    ctaText: "Empezar",
    onClick: () => console.log("Navegando a Nutrición Deportiva")
  },
  {
    title: "Yoga y Flexibilidad",
    description: "Técnicas de yoga, estiramientos y movilidad para complementar tu entrenamiento físico.",
    progressPct: 90,
    modules: 5,
    sessions: 15,
    ctaText: "Finalizar",
    onClick: () => console.log("Navegando a Yoga y Flexibilidad")
  },
  {
    title: "Entrenamiento HIIT",
    description: "Intervalos de alta intensidad para quemar grasa y mejorar tu condición cardiovascular.",
    progressPct: 60,
    modules: 4,
    sessions: 12,
    ctaText: "Continuar",
    onClick: () => console.log("Navegando a Entrenamiento HIIT")
  },
  {
    title: "Psicología del Deporte",
    description: "Desarrolla la mentalidad correcta y técnicas de motivación para alcanzar tus objetivos fitness.",
    progressPct: 0,
    modules: 7,
    sessions: 21,
    ctaText: "Comenzar curso",
    onClick: () => console.log("Navegando a Psicología del Deporte")
  }
]

// Exportar componentes
export { default as CourseCard } from "./CourseCard"
export { default as CoursesGrid } from "./CoursesGrid"
export type { CourseCardProps } from "./CourseCard"