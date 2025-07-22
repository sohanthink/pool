"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import signinbanner from "@/public/signinbanner.png";

export default function SuperadminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showReset, setShowReset] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
            callbackUrl: "/dashboard/superadmin",
        });
        setLoading(false);
        if (res?.error) {
            setError("Invalid credentials");
        } else if (res?.ok) {
            router.replace("/dashboard/superadmin");
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        // Simulate sending reset email (replace with real logic)
        setTimeout(() => {
            setLoading(false);
            setResetSent(true);
        }, 1500);
    };

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
            <div className="p-8 flex flex-col items-center z-10 rounded-2xl backdrop-blur-3xl shadow-lg min-w-[340px]">
                <h1 className="text-3xl font-bold mb-2 text-white">Superadmin Login</h1>
                <p className="text-white text-sm mb-8 text-center max-w-[280px]">
                    Enter your superadmin credentials
                </p>
                {!showReset ? (
                    <form onSubmit={handleLogin} className="w-full flex flex-col gap-4 mb-4">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-2 rounded border border-gray-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-2 rounded border border-gray-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                            variant="outline"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in as Superadmin"}
                        </Button>
                        <button
                            type="button"
                            className="text-xs text-blue-200 hover:underline mt-2"
                            onClick={() => setShowReset(true)}
                        >
                            Forgot password?
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} className="w-full flex flex-col gap-4 mb-4">
                        <input
                            type="email"
                            placeholder="Enter your email to reset password"
                            className="w-full px-4 py-2 rounded border border-gray-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                            variant="outline"
                            disabled={loading}
                        >
                            {loading ? "Sending reset link..." : "Send reset link"}
                        </Button>
                        <button
                            type="button"
                            className="text-xs text-blue-200 hover:underline mt-2"
                            onClick={() => setShowReset(false)}
                        >
                            Back to login
                        </button>
                        {resetSent && (
                            <div className="text-green-200 text-xs mt-2">Reset link sent! Check your email.</div>
                        )}
                    </form>
                )}
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <p className="text-xs text-gray-500 mt-6 text-center">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </section>
    );
} 