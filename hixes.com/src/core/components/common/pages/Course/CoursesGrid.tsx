import type { FC } from "react"
import CourseCard from "./CourseCard"
import type { CourseCardProps } from "./CourseCard"

interface CoursesGridProps {
  courses: CourseCardProps[]
}

export const CoursesGrid: FC<CoursesGridProps> = ({ courses }) => {
  return (
    <section
      aria-label="Listado de cursos"
      className="py-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((c, i) => (
          <CourseCard key={i} {...c} />
        ))}
      </div>
    </section>
  )
}

export default CoursesGrid
