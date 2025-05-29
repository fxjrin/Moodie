import * as React from "react"
import { LogOut } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { NavUser } from "@/components/ui/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"

export function AppSidebar({ user, onLogout, ...props }) {
    return (
        <Sidebar {...props}>
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                {/* <NavUser user={data.user} /> */}
                <NavUser
                    user={{
                        name: user?.name || "Unnamed",
                        username: user?.username || "unknown",
                        avatar: user?.profilePicture?.[0] || "./profile.png",
                    }}
                />
            </SidebarHeader>
            <SidebarContent>
                <DatePicker />
                <SidebarSeparator className="mx-0" />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={onLogout}>
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
