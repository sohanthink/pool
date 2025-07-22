"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Signin from "@/components/Signin";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role === "admin") {
      router.replace("/dashboard/admin");
    }
  }, [session, status, router]);

  if (status === "loading") return null;
  return <Signin />;
}
