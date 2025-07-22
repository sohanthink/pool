"use client";
import { SessionProvider } from "next-auth/react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RouteGuard } from "@/components/RouteGuard";
import { AppSideBar } from "@/components/AppSideBar";
import TopBar from "@/components/TopBar";

export default function DashboardLayout({ children }) {
    return (
        <SessionProvider>
            <RouteGuard allowedRoles={["admin"]}>
                <SidebarProvider>
                    <div className="flex min-h-screen">
                        <AppSideBar role="admin" />
                        <div className="flex-1 p-5">
                            <SidebarTrigger />
                            <TopBar />
                            {children}
                        </div>
                    </div>
                </SidebarProvider>
            </RouteGuard>
        </SessionProvider>
    );
}