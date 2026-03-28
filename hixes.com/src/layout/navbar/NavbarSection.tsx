import { useState } from "react"
import Navbar from "./Navbar"
import { MobileMenu } from "./MobileMenu"
import { tabs } from "./navLinks"


export const NavbarSection = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <Navbar
        appName="Academia Plus"
        subtitle="Bienvenido"
        logoSrc="{logo}"
        userName="Juan García"
        onLogout={() => console.log("logout")}
        tabs={tabs}
      />
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} tabs={tabs} />
    </>
  )
}
