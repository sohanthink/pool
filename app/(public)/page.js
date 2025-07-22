"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";
import Image from "next/image";
import signinbanner from "@/public/signinbanner.png";

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

  return (
    <section className="min-h-[95vh] flex items-center justify-center mt-10 relative container mx-auto">
      {/* Background Image */}
      <div className="absolute inset-0 z-10">
        <Image
          src={signinbanner}
          alt="Private Pool Background"
          className="object-cover opacity-90"
          priority
        />
      </div>
      {/* Content Card */}
      <div className="p-8 flex flex-col items-center z-10 rounded-2xl backdrop-blur-3xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-white">Private Pool</h1>
        <p className="text-white text-sm mb-8 text-center max-w-[280px]">
          Enter your info to access your account
        </p>
        <Button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer"
          variant="outline"
          onClick={() => signIn("google", { callbackUrl: "/dashboard/admin" })}
        >
          <FaGoogle />
          Sign in with Google
        </Button>
        <p className="text-xs text-gray-500 mt-6 text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </section>
  );
}
