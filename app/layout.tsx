
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export default function RootLayout({
   children,
}: {
   children: React.ReactNode
}) {
   return (
      <html lang="es">
         <body>
            <TooltipProvider>
               <SidebarProvider>
                  <AppSidebar />
                  <main className="flex-1">
                     {children}
                  </main>
               </SidebarProvider>
            </TooltipProvider>
         </body>
      </html>
   )
}