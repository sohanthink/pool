"use client";
import { SessionProvider } from "next-auth/react";
import { RouteGuard } from "@/components/RouteGuard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSideBar } from "@/components/AppSideBar";

export default function SuperAdminLayout({ children }) {
    return (
        <SessionProvider>
            <RouteGuard allowedRoles={["superadmin"]}>
                <SidebarProvider>
                    <div className="flex h-screen bg-gray-50">
                        <AppSideBar role="superadmin" />
                        <div className="flex-1 overflow-auto">
                            <div className="p-6">
                                {children}
                            </div>
                        </div>
                    </div>
                </SidebarProvider>
            </RouteGuard>
        </SessionProvider>
    );
} 