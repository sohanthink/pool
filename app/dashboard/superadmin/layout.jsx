"use client";
import { SessionProvider } from "next-auth/react";
import { RouteGuard } from "@/components/RouteGuard";

export default function SuperAdminLayout({ children }) {
    return (
        <SessionProvider>
            <RouteGuard allowedRoles={["superadmin"]}>
                <div className="min-h-screen p-6 bg-gray-50">
                    {children}
                </div>
            </RouteGuard>
        </SessionProvider>
    );
} 