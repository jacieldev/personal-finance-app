import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarHeader,
} from "@/components/ui/sidebar"

export function AppSidebar() {
   return (
      <Sidebar>
         <SidebarHeader>
            <h2 className="text-lg font-bold">Mi Finanzas</h2>
         </SidebarHeader>
         <SidebarContent>
            {/* Aquí puedes agregar tu contenido del sidebar */}
         </SidebarContent>
         <SidebarFooter>
            {/* Footer opcional */}
         </SidebarFooter>
      </Sidebar>
   )
}
