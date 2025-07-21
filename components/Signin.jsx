"use client"

import Image from 'next/image'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import siginbanner from "@/public/signinbanner.png"
import { FaGoogle } from "react-icons/fa"
import { signIn } from "next-auth/react"

const superadminEmail = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || 'superadmin@example.com'

const Signin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const isSuperadmin = email === superadminEmail

    const handleGoogleSignIn = async () => {
        setLoading(true)
        setError('')
        await signIn('google', { callbackUrl: '/dashboard/admin' })
        setLoading(false)
    }

    const handleSuperadminSignIn = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
            callbackUrl: '/dashboard/superadmin',
        })
        setLoading(false)
        if (res?.error) {
            setError('Invalid credentials')
        } else if (res?.ok) {
            window.location.href = '/dashboard/superadmin'
        }
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

                {/* Superadmin login form */}
                <form onSubmit={handleSuperadminSignIn} className='w-full flex flex-col gap-4 mb-4'>
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 rounded border border-gray-300"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    {isSuperadmin && (
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-2 rounded border border-gray-300"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    )}
                    {isSuperadmin ? (
                        <Button
                            type="submit"
                            className='w-full flex items-center justify-center gap-3 py-3 px-6 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer'
                            variant="outline"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign in as Superadmin'}
                        </Button>
                    ) : (
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
                    )}
                </form>
                {error && <div className='text-red-500 text-sm mb-2'>{error}</div>}
                <p className='text-xs text-gray-500 mt-6 text-center'>
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </section>
    )
}

export default Signin