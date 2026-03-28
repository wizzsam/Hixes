import { Footer } from "./footer/Footer"
import { NavbarSection } from "./navbar/NavbarSection"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  return (
    <>
      <NavbarSection />
      {children}
      <Footer />
    </>
  )
}
