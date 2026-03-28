import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers"
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
      <html lang="es" className={inter.variable} suppressHydrationWarning>
         <body className="font-sans antialiased">
            <ThemeProvider>
               <Providers>
                  <TooltipProvider>
                     {children}
                  </TooltipProvider>
               </Providers>
            </ThemeProvider>
            <Analytics />
         </body>
      </html>
   )
}
