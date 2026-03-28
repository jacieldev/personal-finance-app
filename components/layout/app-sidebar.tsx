"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import { AnimatePresence, motion } from "framer-motion"
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarGroup,
   SidebarGroupContent,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarSeparator,
} from "@/components/ui/sidebar"
import {
   LayoutDashboard,
   Calendar,
   ArrowLeftRight,
   CreditCard,
   Wallet,
   Settings,
   Moon,
   LogOut,
   ChevronUp,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

const navItems = [
   { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
   { title: "Calendario", url: "/calendario", icon: Calendar },
   { title: "Movimientos", url: "/movimientos", icon: ArrowLeftRight },
   { title: "Obligaciones", url: "/obligaciones", icon: CreditCard },
   { title: "Cuentas", url: "/cuentas", icon: Wallet },
]

export function AppSidebar() {
   const pathname = usePathname()
   const { data: session } = useSession()
   const { resolvedTheme, setTheme } = useTheme()
   const [ajustesOpen, setAjustesOpen] = useState(false)
   const footerRef = useRef<HTMLDivElement>(null)

   function handleLogout() {
      signOut({ callbackUrl: "/login" })
   }

   useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
         if (footerRef.current && !footerRef.current.contains(e.target as Node)) {
            setAjustesOpen(false)
         }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
   }, [])

   return (
      <Sidebar>
         <SidebarHeader>
            <div className="flex items-center gap-3 px-3 py-3">
               <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <Wallet className="size-5" />
               </div>
               <div className="flex flex-col leading-tight">
                  <span className="font-bold text-sm leading-snug">Mis Finanzas</span>
                  <span className="font-bold text-sm leading-snug">Personales</span>
                  <span className="text-xs text-muted-foreground">{session?.user?.email ?? ""}</span>
               </div>
            </div>
         </SidebarHeader>

         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {navItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                           <SidebarMenuButton
                              render={<Link href={item.url} />}
                              isActive={pathname === item.url}
                           >
                              <item.icon />
                              <span>{item.title}</span>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                     ))}
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
         </SidebarContent>

         <SidebarFooter>
            <div ref={footerRef}>
               <SidebarSeparator />

               {/* Menú desplegable hacia arriba */}
               <AnimatePresence>
                  {ajustesOpen && (
                     <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="mx-2 mb-1 overflow-hidden rounded-lg border bg-background shadow-md"
                     >
                        <button
                           onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                           className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
                        >
                           <Moon className="size-4 shrink-0" />
                           <span>{resolvedTheme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
                        </button>
                        <div className="mx-3 h-px bg-border" />
                        <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                           <LogOut className="size-4 shrink-0" />
                           <span>Cerrar sesión</span>
                        </button>
                     </motion.div>
                  )}
               </AnimatePresence>

               {/* Ajustes + trigger de opciones */}
               <SidebarMenu>
                  <SidebarMenuItem>
                     <div className="flex items-center gap-1">
                        <SidebarMenuButton
                           render={<Link href="/ajustes" />}
                           isActive={pathname === "/ajustes"}
                           className="flex-1"
                        >
                           <Settings className="size-4 shrink-0" />
                           <span>Ajustes</span>
                        </SidebarMenuButton>
                        <button
                           onClick={() => setAjustesOpen((v) => !v)}
                           className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                              ajustesOpen ? "bg-muted" : "hover:bg-muted"
                           )}
                        >
                           <ChevronUp className={cn(
                              "size-3.5 text-muted-foreground transition-transform duration-200",
                              ajustesOpen ? "rotate-180" : "rotate-0"
                           )} />
                        </button>
                     </div>
                  </SidebarMenuItem>
               </SidebarMenu>
            </div>
         </SidebarFooter>
      </Sidebar>
   )
}
