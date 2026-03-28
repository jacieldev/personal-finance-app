import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"

export default function MainLayout({
   children,
}: {
   children: React.ReactNode
}) {
   return (
      <SidebarProvider>
         <AppSidebar />
         <main className="flex-1 min-w-0">
            <div className="sticky top-0 z-10 flex h-10 items-center border-b bg-background px-4">
               <SidebarTrigger />
            </div>
            {children}
         </main>
      </SidebarProvider>
   )
}
