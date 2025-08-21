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
    Target,
    Plus
} from "lucide-react"

const SuperadminPickleballPage = () => {
    const [pickleballCourts, setPickleballCourts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [ownerFilter, setOwnerFilter] = useState("all")

    const fetchPickleballCourts = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/superadmin/pickleball')
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
        fetchPickleballCourts()
    }, [])

    const filteredPickleballCourts = pickleballCourts.filter(court => {
        const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            court.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            court.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || court.status === statusFilter
        const matchesOwner = ownerFilter === "all" || court.owner.email === ownerFilter
        return matchesSearch && matchesStatus && matchesOwner
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

    // Get unique owners for filter
    const owners = [...new Set(pickleballCourts.map(court => court.owner.email))]

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
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">All Pickleball Courts</h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
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

                        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by owner" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Owners</SelectItem>
                                {owners.map((owner) => (
                                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("")
                                setStatusFilter("all")
                                setOwnerFilter("all")
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Pickleball Courts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPickleballCourts.map((court) => (
                    <Card key={court._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-orange-600" />
                                    <CardTitle className="text-lg">{court.name}</CardTitle>
                                </div>
                                {getStatusBadge(court.status)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">{court.description}</p>
                                <p className="text-sm font-medium">📍 {court.location}</p>
                                <div className="flex gap-2 text-sm text-gray-600">
                                    <span>Surface: {court.surface}</span>
                                    <span>•</span>
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

                            <div className="flex flex-wrap gap-2">
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

                            <div className="border-t pt-3">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                    <span>Owner: {court.owner.name}</span>
                                    <span>{court.totalBookings || 0} bookings</span>
                                </div>
                                <Link href={`/dashboard/superadmin/pickleball/${court._id}`}>
                                    <Button size="sm" variant="outline" className="w-full">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View Details
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredPickleballCourts.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No pickleball courts found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default SuperadminPickleballPage
