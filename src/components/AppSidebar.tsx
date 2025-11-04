import { Home, BarChart3 } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import React from "react";

// Small React component wrapper for the remote PNG so it can be used
// interchangeably with the lucide-react icon components below (they all
// accept `className`). This avoids the invalid `import "https://..." as ...` syntax.
const SpiceGoldIcon = ({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src="https://appcdn.goqii.com/storeimg/79306_1762237023.png"
    alt="SpiceGold"
    className={cn("h-4 w-4 object-contain flex-shrink-0", className)}
    style={{ aspectRatio: "1", objectFit: "contain" }}
    {...props}
  />
);
const menuItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Traffic and Acquisition", url: "/analytics", icon: BarChart3 },
  {
    title: "SpiceGold Report",
    url: "/spicegold_analytics",
    icon: SpiceGoldIcon,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 py-2">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-lg font-bold">
                IceSpice Dashboard
              </SidebarGroupLabel>
            )}
            <SidebarTrigger className="ml-auto" />
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
