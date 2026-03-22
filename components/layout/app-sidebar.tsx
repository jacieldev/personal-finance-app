import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
   LayoutDashboard,
   Calendar,
   ArrowLeftRight,
   CreditCard,
   Wallet,
   Settings,
   User,
} from "lucide-react"
import Link from "next/link"

const menuItems = [
   {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
   },
   {
      title: "Calendar",
      url: "/calendario",
      icon: Calendar,
   },
   {
      title: "Transactions",
      url: "/movimientos",
      icon: ArrowLeftRight,
   },
   {
      title: "Bills",
      url: "/obligaciones",
      icon: CreditCard,
   },
   {
      title: "Accounts",
      url: "/cuentas",
      icon: Wallet,
   },
]

export function AppSidebar() {
   return (
      <Sidebar>
         <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
               <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Wallet className="size-4" />
               </div>
               <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">My Finance</span>
                  <span className="text-xs text-muted-foreground">Personal</span>
               </div>
            </div>
         </SidebarHeader>
         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupLabel>Main</SidebarGroupLabel>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {menuItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                           <SidebarMenuButton>
                              <Link href={item.url}>
                                 <item.icon />
                                 <span>{item.title}</span>
                              </Link>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                     ))}
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
               <SidebarGroupLabel>Settings</SidebarGroupLabel>
               <SidebarGroupContent>
                  <SidebarMenu>
                     <SidebarMenuItem>
                        <SidebarMenuButton>
                           <Link href="/ajustes">
                              <Settings />
                              <span>Settings</span>
                           </Link>
                        </SidebarMenuButton>
                     </SidebarMenuItem>
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
         </SidebarContent>
         <SidebarFooter>
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton>
                     <User />
                     <span>User</span>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarFooter>
      </Sidebar>
   )
}
