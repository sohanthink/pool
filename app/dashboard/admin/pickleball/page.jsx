"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Share2,
    Link as LinkIcon,
    Target,
    Plus
} from "lucide-react"
import { useSession } from "next-auth/react"

const PickleballPage = () => {
    const { data: session, status } = useSession()
    const [pickleballCourts, setPickleballCourts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const fetchPickleballCourts = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`/api/pickleball?ownerEmail=${encodeURIComponent(session.user.email)}`)
            if (!res.ok) throw new Error('Failed to fetch pickleball courts')
            const data = await res.json()
            setPickleballCourts(data)
        } catch (err) {
            setError('Failed to load pickleball courts')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!session?.user?.email) return
        fetchPickleballCourts()
    }, [session?.user?.email])

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this pickleball court?')) return

        try {
            const res = await fetch(`/api/pickleball/${id}/delete-with-images`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Failed to delete pickleball court')
            fetchPickleballCourts()
        } catch (err) {
            setError('Failed to delete pickleball court')
        }
    }

    const handleShareLink = async (id) => {
        try {
            const res = await fetch(`/api/pickleball/${id}/share-link`, {
                method: 'POST'
            })
            if (!res.ok) throw new Error('Failed to generate share link')
            const data = await res.json()

            const shareUrl = `${window.location.origin}/pickleball/${id}/share/${data.linkToken}`
            navigator.clipboard.writeText(shareUrl)
            alert('Share link copied to clipboard!')
        } catch (err) {
            setError('Failed to generate share link')
        }
    }


    const filteredPickleballCourts = pickleballCourts.filter(court => {
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

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pickleball Courts</h1>
                <Link href="/dashboard/admin/pickleball/create">
                    <Button className="flex items-center gap-2 w-full sm:w-auto">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Pickleball Court</span>
                        <span className="sm:hidden">Add Court</span>
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-3 rounded text-sm md:text-base">
                    {error}
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:gap-4 sm:space-y-0">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search pickleball courts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col space-y-3 sm:flex-row sm:gap-4 sm:space-y-0">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm("")
                                    setStatusFilter("all")
                                }}
                                className="w-full sm:w-auto"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pickleball Courts List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredPickleballCourts.map((court) => (
                    <Card key={court._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Target className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                    <CardTitle className="text-lg truncate">{court.name}</CardTitle>
                                </div>
                                <div className="self-start sm:self-auto">
                                    {getStatusBadge(court.status)}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 md:space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600 line-clamp-2">{court.description}</p>
                                <p className="text-sm font-medium truncate">📍 {court.location}</p>
                                <div className="flex flex-col space-y-1 sm:flex-row sm:gap-2 sm:space-y-0 text-sm text-gray-600">
                                    <span>Surface: {court.surface}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>Type: {court.type}</span>
                                </div>
                                <p className="text-lg font-bold text-green-600">${court.price}/hour</p>
                            </div>

                            {court.images && court.images.length > 0 && (
                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={court.images[0]}
                                        alt={court.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex flex-wrap gap-1.5">
                                {court.amenities?.slice(0, 3).map((amenity, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                        {amenity}
                                    </Badge>
                                ))}
                                {court.amenities?.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                        +{court.amenities.length - 3} more
                                    </Badge>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Link href={`/dashboard/admin/pickleball/${court._id}`} className="flex-1">
                                    <Button size="sm" variant="outline" className="w-full">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                </Link>
                                {/* <Link href={`/dashboard/admin/pickleball/${court._id}/edit`}>
                                    <Button size="sm" variant="outline">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </Link> */}
                                {/* <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleShareLink(court._id)}
                                >
                                    <Share2 className="h-4 w-4" />
                                </Button> */}
                                {/* <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(court._id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button> */}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredPickleballCourts.length === 0 && (
                <Card>
                    <CardContent className="p-8 md:p-12 text-center">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No pickleball courts found</h3>
                        <p className="text-gray-500 mb-4 text-sm md:text-base">Get started by adding your first pickleball court.</p>
                        <Link href="/dashboard/admin/pickleball/create">
                            <Button className="w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Pickleball Court
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

        </div>
    )
}

export default PickleballPage
