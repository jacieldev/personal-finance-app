
import { Inter } from "next/font/google"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const inter = Inter({
   subsets: ["latin"],
   variable: "--font-sans",
})

export default function RootLayout({
   children,
}: {
   children: React.ReactNode
}) {
   return (
      <html lang="es" className={inter.variable}>
         <body className="font-sans antialiased">
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