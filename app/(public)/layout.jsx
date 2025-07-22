"use client";
import { SessionProvider } from "next-auth/react";

export default function PublicLayout({ children }) {
    return <SessionProvider>{children}</SessionProvider>;
} 