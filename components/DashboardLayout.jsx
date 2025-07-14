import React from "react";
import { RouteGuard } from "@/components/RouteGuard";
import { Sidebar } from "@/components/ui/sidebar";

export default function DashboardLayout({ children, role = "admin" }) {
    return (
        <RouteGuard allowedRoles={[role]}>
            <div className="flex min-h-screen">
                <Sidebar role={role} />
                <main className="flex-1 p-6 bg-gray-50">
                    {children}
                </main>
            </div>
        </RouteGuard>
    );
} 