"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PickleballForm from "@/components/PickleballForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

const EditPickleballPage = ({ params }) => {
    const router = useRouter()
    const courtId = params.id
    const [pickleball, setPickleball] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchPickleball() {
            try {
                const res = await fetch(`/api/pickleball/${courtId}`)
                if (!res.ok) throw new Error('Pickleball court not found')
                const data = await res.json()
                setPickleball(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchPickleball()
    }, [courtId])

    if (loading) {
        return (
            <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading pickleball court...</p>
            </div>
        )
    }

    if (error || !pickleball) {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error || 'Pickleball court not found'}</p>
            </div>
        )
    }

    return <PickleballForm pickleball={pickleball} />
}

export default EditPickleballPage
