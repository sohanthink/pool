"use client"
import React, { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Plus, Search, Filter, Eye, Edit, Trash2, Share } from "lucide-react"
import Link from 'next/link'

const TennisCourtsPage = () => {
    const { data: session, status } = useSession()
    const [tennisCourts, setTennisCourts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    useEffect(() => {
        if (!session?.user?.email) return
        fetchTennisCourts()
    }, [session?.user?.email])

    const fetchTennisCourts = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`/api/tennis?ownerEmail=${encodeURIComponent(session.user.email)}`)
            if (!res.ok) throw new Error('Failed to fetch tennis courts')
            const data = await res.json()
            setTennisCourts(data)
        } catch (err) {
            setError('Failed to load tennis courts')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this tennis court?')) return

        try {
            const res = await fetch(`/api/tennis/${id}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Failed to delete tennis court')
            fetchTennisCourts() // Refresh the list
        } catch (err) {
            setError('Failed to delete tennis court')
        }
    }

    const handleShare = async (id) => {
        try {
            const res = await fetch(`/api/tennis/${id}/share-link`, {
                method: 'POST'
            })
            if (!res.ok) throw new Error('Failed to generate share link')
            const data = await res.json()

            // Copy to clipboard
            const shareUrl = `${window.location.origin}/tennis/${id}/share/${data.token}`
            await navigator.clipboard.writeText(shareUrl)
            alert('Share link copied to clipboard!')
        } catch (err) {
            setError('Failed to generate share link')
        }
    }


    // Filter tennis courts
    const filteredTennisCourts = tennisCourts.filter(court => {
        const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            court.location.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || court.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status) => {
        switch (status) {
            case "Active":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
            case "Inactive":
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
            case "Maintenance":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Maintenance</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    if (status === 'loading' || !session?.user?.email) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>
    }

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading tennis courts...</div>
    }

    return (
        <div className="pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Target className="h-6 w-6 text-green-600" />
                        <h1 className="text-2xl font-semibold text-gray-800">Tennis Courts</h1>
                    </div>
                    <Badge variant="secondary">{tennisCourts.length} courts</Badge>
                </div>
                <Link href="/dashboard/admin/tennis/create">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Tennis Court
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search tennis courts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Tennis Courts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTennisCourts.map((court) => (
                    <Card key={court._id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-gray-800 mb-1">{court.name}</h3>
                                        <p className="text-sm text-gray-600">{court.location}</p>
                                    </div>
                                    {getStatusBadge(court.status)}
                                </div>

                                {/* Details */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Target className="h-4 w-4" />
                                        <span>{court.surface} • {court.type}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>Capacity: {court.capacity} players</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>Price: ${court.price}/hour</span>
                                    </div>
                                </div>

                                {/* Image */}
                                {court.images && court.images.length > 0 && (
                                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={court.images[0]}
                                            alt={court.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t">
                                    <Link href={`/dashboard/admin/tennis/${court._id}`}>
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                    </Link>
                                    {/* <Link href={`/dashboard/admin/tennis/${court._id}/edit`}>
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </Link> */}
                                    {/* <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleShare(court._id)}
                                    >
                                        <Share className="h-4 w-4 mr-1" />
                                        Share
                                    </Button> */}
                                    {/* <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(court._id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button> */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredTennisCourts.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No tennis courts found</h3>
                        <p className="text-gray-500 mb-4">
                            {tennisCourts.length === 0
                                ? "You haven't added any tennis courts yet."
                                : "Try adjusting your search or filter criteria."
                            }
                        </p>
                        {tennisCourts.length === 0 && (
                            <Link href="/dashboard/admin/tennis/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Tennis Court
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}

        </div>
    )
}

export default TennisCourtsPage
