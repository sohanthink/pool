import DashboardLayout from "@/components/DashboardLayout";

export default function AdminDashboardPage() {
    return (
        <DashboardLayout role="admin">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <p>Welcome, admin! Here is your dashboard.</p>
        </DashboardLayout>
    );
} 