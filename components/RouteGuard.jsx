"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Placeholder: Replace with your actual auth store or context
const useAuth = () => {
    // Example: Replace with real user/role logic
    return {
        user: { role: "admin" }, // or "superadmin"
        token: true,
    };
};

export const RouteGuard = ({ children, allowedRoles }) => {
    const router = useRouter();
    const { user, token } = useAuth();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!token) {
            router.replace("/auth/admin");
            return;
        }
        if (allowedRoles && !allowedRoles.includes(user?.role)) {
            router.replace("/unauthorized");
            return;
        }
        setIsChecking(false);
    }, [router, allowedRoles, token, user]);

    if (isChecking) {
        return <div>Loading...</div>;
    }
    if (!token || (allowedRoles && !allowedRoles.includes(user?.role))) {
        return null;
    }
    return children;
}; 