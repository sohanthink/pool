import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RouteGuard } from "@/components/RouteGuard";
import { AppSidebar } from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";

export default function DashboardLayout({ children }) {
    return (
        <RouteGuard allowedRoles={["admin"]}>
            <SidebarProvider>
                <div className="flex min-h-screen">
                    <AppSidebar role="admin" />
                    <div className="flex-1 p-5">
                        <SidebarTrigger />
                        <TopBar />
                        {children}
                    </div>
                </div>
            </SidebarProvider>
        </RouteGuard>
    );
}