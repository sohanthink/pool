"use client"

import Image from 'next/image'
import React from 'react'
import { Button } from "@/components/ui/button"

import siginbanner from "@/public/signinbanner.png"
import { FaGoogle } from "react-icons/fa";

const Signin = () => {
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
            <div className='p-8 flex flex-col items-center z-10 bg-gradient-to-b from-white via-white/90 to-blue-100/80 rounded-2xl backdrop-blur-sm shadow-lg'>
                <h1 className='text-3xl font-bold mb-2 text-gray-800'>Private Pool</h1>
                <p className='text-gray-600 text-sm mb-8 text-center max-w-[280px]'>
                    Enter your info to access your account
                </p>

                <Button
                    className='w-full flex items-center justify-center gap-3 py-10 px-6 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer'
                    variant="outline"
                    onClick={() => window.location.href = '/dashboard/admin'}
                >
                    <FaGoogle />
                    Sign in with Google
                </Button>

                <p className='text-xs text-gray-500 mt-6 text-center'>
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </section>
    )
}

export default Signin