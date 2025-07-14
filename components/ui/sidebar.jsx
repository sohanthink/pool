"use client"

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Calendar, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = {
    admin: [
        {
            title: "Dashboard",
            url: "/dashboard/admin",
            icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
            title: "Users",
            url: "/dashboard/admin/users",
            icon: <Users className="h-4 w-4" />,
        },
        {
            title: "Forms",
            url: "/dashboard/admin/forms",
            icon: <FileText className="h-4 w-4" />,
        },
        {
            title: "Appointments",
            url: "/dashboard/admin/appointments",
            icon: <Calendar className="h-4 w-4" />,
        },
    ],
    superadmin: [
        {
            title: "Dashboard",
            url: "/dashboard/superadmin",
            icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
            title: "Admins",
            url: "/dashboard/superadmin/admins",
            icon: <Shield className="h-4 w-4" />,
        },
        {
            title: "Users",
            url: "/dashboard/superadmin/users",
            icon: <Users className="h-4 w-4" />,
        },
        {
            title: "Forms",
            url: "/dashboard/superadmin/forms",
            icon: <FileText className="h-4 w-4" />,
        },
        {
            title: "Appointments",
            url: "/dashboard/superadmin/appointments",
            icon: <Calendar className="h-4 w-4" />,
        },
    ],
};

export function Sidebar({ role = "admin" }) {
    const pathname = usePathname();
    const items = navItems[role.toLowerCase()] || navItems.admin;

    return (
        <aside className="h-screen w-64 bg-white border-r shadow-sm flex flex-col">
            <div className="h-16 flex items-center justify-center border-b">
                <span className="font-bold text-lg tracking-tight">Dashboard</span>
            </div>
            <nav className="flex-1 py-4 px-2 space-y-1">
                {items.map((item) => (
                    <Link
                        key={item.title}
                        href={item.url}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 hover:bg-blue-100 transition-all",
                            pathname === item.url && "bg-blue-100 font-semibold text-blue-700"
                        )}
                    >
                        {item.icon}
                        <span>{item.title}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
} 