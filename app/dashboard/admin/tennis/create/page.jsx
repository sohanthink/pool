"use client"
import React from 'react'
import TennisForm from '@/components/TennisForm'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'

const CreateTennisCourtPage = () => {
    const { data: session, status } = useSession()
    const router = useRouter()

    if (status === 'loading') {
        return <div className="p-8 text-center text-gray-500">Loading...</div>
    }

    if (!session?.user?.email) {
        router.push('/signin')
        return null
    }

    return (
        <div className="container mx-auto px-4">
            <TennisForm />
        </div>
    )
}

export default CreateTennisCourtPage
