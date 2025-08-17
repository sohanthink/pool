"use client"

import Image from 'next/image'
import React from 'react'
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import siginbanner from "@/public/signinbanner.png"
import { FaGoogle } from "react-icons/fa";

const TopBar = () => {
    const { data: session } = useSession();
    const user = session?.user;
    return (
        <section className='relative'>
            <Image
                src={siginbanner}
                alt="Private Pool Background"
                className='object-cover opacity-90 h-[150px]'
                priority
            />
            <div className='absolute top-5 left-5 z-10'>
                {/* <h3 className='text-2xl text-white'>Welcome, admin!</h3>
                <h4 className='text-xl text-white'>welcome to the pool dashboard !!</h4> */}
                <div>
                    <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name || 'Admin'}!</h1>
                    <p className="text-gray-100 mt-2">Email: {user?.email}</p>
                </div>
            </div>
        </section>
    )
}

export default TopBar