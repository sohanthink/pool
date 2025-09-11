"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import {
  FaGoogle,
  FaSwimmingPool,
  FaTableTennis,
  FaCircle,
} from "react-icons/fa";
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={signinbanner}
          alt="Private Pool Background"
          className="object-cover w-full h-full"
          priority
          fill
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-teal-900/80"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce">
        <FaSwimmingPool className="text-white/20 text-4xl" />
      </div>
      <div className="absolute top-40 right-16 animate-pulse">
        <FaCircle className="text-white/20 text-3xl" />
      </div>
      <div className="absolute bottom-32 left-20 animate-bounce delay-1000">
        <FaTableTennis className="text-white/20 text-2xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <FaSwimmingPool className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              PoolBook
            </h1>
            <p className="text-blue-100 text-lg font-medium">
              Premium Venue Management
            </p>
          </div>

          {/* Features */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center text-white/90">
              <FaSwimmingPool className="text-blue-300 mr-3 text-lg" />
              <span className="text-sm">Private Pools</span>
            </div>
            <div className="flex items-center text-white/90">
              <FaCircle className="text-green-300 mr-3 text-lg" />
              <span className="text-sm">Tennis Courts</span>
            </div>
            <div className="flex items-center text-white/90">
              <FaTableTennis className="text-orange-300 mr-3 text-lg" />
              <span className="text-sm">Pickleball Courts</span>
            </div>
          </div>

          {/* Sign In Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-blue-100 text-sm">
                Sign in to manage your venues and bookings
              </p>
            </div>

            <Button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              onClick={() =>
                signIn("google", { callbackUrl: "/dashboard/admin" })
              }
            >
              <FaGoogle className="text-blue-600 text-xl" />
              Continue with Google
            </Button>

            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-xs text-blue-100 text-center leading-relaxed">
                By signing in, you agree to our{" "}
                <span className="text-white underline cursor-pointer hover:text-blue-200">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-white underline cursor-pointer hover:text-blue-200">
                  Privacy Policy
                </span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/60 text-xs">
              © 2024 PoolBook. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
