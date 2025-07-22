"use client"

import Image from 'next/image'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import siginbanner from "@/public/signinbanner.png"
import { FaGoogle } from "react-icons/fa"
import { signIn } from "next-auth/react"

const superadminEmail = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || 'superadmin@example.com'

const Signin = () => {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleGoogleSignIn = async () => {
        setLoading(true)
        setError('')
        await signIn('google', { callbackUrl: '/dashboard/admin' })
        setLoading(false)
    }

    return (
        <section className='min-h-[95vh] flex items-center justify-center mt-10 relative container mx-auto'>
            {/* Background Image */}
            <div className='absolute inset-0 z-10'>
                <Image
                    src={siginbanner}
                    alt="Private Pool Background"
                    className='object-cover opacity-90'
                    priority
                />
            </div>

            {/* Content Card */}
            <div className='p-8 flex flex-col items-center z-10 rounded-2xl backdrop-blur-3xl shadow-lg '>
                <h1 className='text-3xl font-bold mb-2 text-white'>Private Pool</h1>
                <p className='text-white text-sm mb-8 text-center max-w-[280px]'>
                    Enter your info to access your account
                </p>

                {/* Only Google login button for admin */}
                <Button
                    type="button"
                    className='w-full flex items-center justify-center gap-3 py-3 px-6 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer'
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                >
                    <FaGoogle />
                    {loading ? 'Signing in...' : 'Sign in with Google'}
                </Button>
                {error && <div className='text-red-500 text-sm mb-2'>{error}</div>}
                <p className='text-xs text-gray-500 mt-6 text-center'>
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </section>
    )
}

export default Signin