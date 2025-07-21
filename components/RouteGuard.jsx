"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const RouteGuard = ({ children, allowedRoles }) => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const isLoading = status === "loading";
    const user = session?.user;

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace("/signin");
                return;
            }
            if (allowedRoles && !allowedRoles.includes(user.role)) {
                router.replace("/unauthorized");
                return;
            }
        }
    }, [isLoading, user, allowedRoles, router]);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
        return null;
    }
    return children;
}; 