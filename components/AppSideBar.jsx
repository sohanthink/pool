"use client";
import * as React from "react";
import { GalleryVerticalEnd, ChevronDown, ChevronRight, LayoutDashboard, Users, FileText, Calendar, Shield, Building2, Settings, BarChart3, Lock } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { signOut, useSession } from "next-auth/react";


const LogOut = () => <button
    onClick={() => signOut({ callbackUrl: '/' })}
    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
>
    Logout
</button>

const roleBasedNavItems = {
    admin: [
        {
            title: "Dashboard",
            url: "/dashboard/admin",
            icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
            title: "Pool Management",
            icon: <Building2 className="h-4 w-4" />,
            items: [
                { title: "View Pools", url: "/dashboard/admin/pool" },
                { title: "Add Pool", url: "/dashboard/admin/pool/create" },
            ],
        },
        {
            title: "Booking Management",
            icon: <Calendar className="h-4 w-4" />,
            items: [
                { title: "All Bookings", url: "/dashboard/admin/bookings" },
                { title: "Create Booking", url: "/dashboard/admin/bookings/create" },
            ],
        },
    ],
    superadmin: [
        {
            title: "Dashboard",
            url: "/dashboard/superadmin",
            icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
            title: "Admin Management",
            icon: <Shield className="h-4 w-4" />,
            items: [
                { title: "All Admins", url: "/dashboard/superadmin/admins" },
            ],
        },
        {
            title: "Pool Management",
            icon: <Building2 className="h-4 w-4" />,
            items: [
                { title: "All Pools", url: "/dashboard/superadmin/pools" },
            ],
        },
        {
            title: "Account Settings",
            icon: <Lock className="h-4 w-4" />,
            items: [
                { title: "Change Password", url: "/dashboard/superadmin/change-password" },
            ],
        }
    ]
};

export function AppSideBar({ role = "admin", ...props }) {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = React.useState({});
    const navItems = roleBasedNavItems[role] || roleBasedNavItems.admin;


    const { data: session } = useSession();
    const user = session?.user;

    const toggleExpand = (title) => {
        setExpandedItems(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const isActive = (url) => {
        if (!url) return false;
        return pathname === url || pathname?.startsWith(url);
    };

    const hasActiveChild = (items) => {
        return items?.some(item => isActive(item.url));
    };

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="#">
                                <div className="flex items-center gap-2">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                        <GalleryVerticalEnd className="size-4" />
                                    </div>
                                    <div className="flex flex-col leading-none">
                                        <span className="font-semibold">{user?.name || 'User'}</span>
                                        <span className="text-sm text-muted-foreground capitalize">
                                            {user?.role || "User"}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                {item.items ? (
                                    <>
                                        <SidebarMenuButton
                                            onClick={() => toggleExpand(item.title)}
                                            className={cn(
                                                "flex justify-between items-center w-full",
                                                (expandedItems[item.title] || hasActiveChild(item.items)) && "bg-accent/50 text-accent-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {item.icon}
                                                <span className="font-medium">{item.title}</span>
                                            </div>
                                            {expandedItems[item.title] ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </SidebarMenuButton>
                                        {expandedItems[item.title] && (
                                            <SidebarMenuSub>
                                                {item.items.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            className={cn(
                                                                "relative pl-8",
                                                                isActive(subItem.url) && "bg-accent text-accent-foreground"
                                                            )}
                                                        >
                                                            <Link href={subItem.url}>
                                                                {isActive(subItem.url) && (
                                                                    <span className="absolute left-4 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary" />
                                                                )}
                                                                {subItem.title}
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        )}
                                    </>
                                ) : (
                                    <SidebarMenuButton
                                        asChild
                                        className={cn(
                                            "flex items-center gap-2",
                                            isActive(item.url) && "bg-accent text-accent-foreground"
                                        )}
                                    >
                                        <Link href={item.url}>
                                            {item.icon}
                                            <span className="font-medium">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <div className="p-4">
                <SidebarMenuButton asChild>
                    <LogOut />
                </SidebarMenuButton>
            </div>
            <SidebarRail />
        </Sidebar>
    );
}