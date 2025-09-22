"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Calendar,
    Search,
    Filter,
    Eye,
    Clock,
    User,
    Phone,
    Mail,
    MapPin,
    DollarSign,
    Target
} from "lucide-react"
import { useSession } from "next-auth/react";

const BookingsPage = () => {
    const { data: session, status } = useSession();
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [poolFilter, setPoolFilter] = useState("all")
    const [sourceFilter, setSourceFilter] = useState("all")

    // Move fetchBookings outside useEffect for reuse
    const fetchBookings = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`/api/bookings?ownerEmail=${encodeURIComponent(session.user.email)}`)
            if (!res.ok) throw new Error('Failed to fetch bookings')
            const data = await res.json()
            // Sort bookings by creation date (newest first)
            const sortedBookings = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            setBookings(sortedBookings)
        } catch (err) {
            setError('Failed to load bookings')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!session?.user?.email) return;
        fetchBookings()
    }, [session?.user?.email])

    // Get unique pools, tennis courts, and pickleball courts for filter
    const pools = [...new Set(bookings.map(booking => booking.poolId?.name || booking.poolName).filter(Boolean))]
    const tennisCourts = [...new Set(bookings.map(booking => booking.tennisCourtId?.name || booking.tennisCourtName).filter(Boolean))]
    const pickleballCourts = [...new Set(bookings.map(booking => booking.pickleballCourtId?.name || booking.pickleballCourtName).filter(Boolean))]
    const allVenues = [...pools, ...tennisCourts, ...pickleballCourts]

    // Filter bookings
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            (booking.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (booking.customerEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (booking.poolId?.name?.toLowerCase() || booking.poolName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (booking.tennisCourtId?.name?.toLowerCase() || booking.tennisCourtName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (booking.pickleballCourtId?.name?.toLowerCase() || booking.pickleballCourtName?.toLowerCase() || '').includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || booking.status === statusFilter
        const matchesPool = poolFilter === "all" ||
            (booking.poolId?.name || booking.poolName) === poolFilter ||
            (booking.tennisCourtId?.name || booking.tennisCourtName) === poolFilter ||
            (booking.pickleballCourtId?.name || booking.pickleballCourtName) === poolFilter
        const matchesSource = sourceFilter === "all" ||
            (sourceFilter === "shareLink" && booking.fromShareLink) ||
            (sourceFilter === "direct" && !booking.fromShareLink && booking.createdBy !== "admin") ||
            (sourceFilter === "adminCreated" && booking.createdBy === "admin")

        return matchesSearch && matchesStatus && matchesPool && matchesSource
    })

    // Get status badge variant
    const getStatusBadge = (status) => {
        switch (status) {
            case "Confirmed":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
            case "Cancelled":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }


    if (status === 'loading' || !session?.user?.email) return <div className="p-8 text-center text-gray-500">Loading user...</div>;
    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>

    return (
        <div className="pt-4 sm:pt-6 space-y-4 sm:space-y-6 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Bookings Management</h1>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="text-sm text-gray-600">
                        Total Bookings: {filteredBookings.length}
                    </div>
                    <Link href="/dashboard/admin/bookings/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                            <Calendar className="h-4 w-4 mr-2" />
                            Create Booking
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                        {/* Search */}
                        <div className="relative sm:col-span-2 lg:col-span-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search bookings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Venue Filter */}
                        <Select value={poolFilter} onValueChange={setPoolFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by venue" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Venues</SelectItem>
                                {allVenues.map((venue) => (
                                    <SelectItem key={venue} value={venue}>{venue}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Source Filter */}
                        <Select value={sourceFilter} onValueChange={setSourceFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sources</SelectItem>
                                <SelectItem value="shareLink">Share Link</SelectItem>
                                <SelectItem value="direct">Direct Booking</SelectItem>
                                <SelectItem value="adminCreated">Admin Created</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Clear Filters */}
                        <Button
                            variant="outline"
                            className="sm:col-span-2 lg:col-span-1"
                            onClick={() => {
                                setSearchTerm("")
                                setStatusFilter("all")
                                setPoolFilter("all")
                                setSourceFilter("all")
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card>
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">
                                {bookings.filter(b => b.poolId).length}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Pool Bookings</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-green-600">
                                {bookings.filter(b => b.tennisCourtId).length}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Tennis Court Bookings</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-orange-600">
                                {bookings.filter(b => b.pickleballCourtId).length}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Pickleball Court Bookings</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg col-span-2 lg:col-span-1">
                            <div className="text-xl sm:text-2xl font-bold text-gray-600">
                                {bookings.length}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Total Bookings</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings List */}
            <div className="space-y-4">
                {filteredBookings.map((booking) => (
                    <Card key={booking._id || booking.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                {/* Booking Info */}
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                                            Booking #{booking._id || booking.id}
                                        </h3>
                                        <div className="self-start sm:self-auto">{getStatusBadge(booking.status)}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                            <span className="break-words">{booking.date?.slice(0, 10) || booking.date} • {booking.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                            <span>{booking.duration} hours</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                            {booking.fromShareLink && (
                                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
                                                    Share Link
                                                </Badge>
                                            )}
                                            {booking.createdBy === "admin" && (
                                                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs">
                                                    Admin Created
                                                </Badge>
                                            )}
                                        </div>

                                    </div>
                                </div>

                                {/* Venue Info */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm sm:text-base text-gray-800">
                                        {booking.poolId ? "Pool Details" : booking.tennisCourtId ? "Tennis Court Details" : "Pickleball Court Details"}
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                                            {booking.poolId ? (
                                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                                            ) : booking.tennisCourtId ? (
                                                <Target className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <Target className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div className="flex flex-col gap-1">
                                                <span className="break-words">
                                                    {booking.poolId?.name || booking.poolName ||
                                                        booking.tennisCourtId?.name || booking.tennisCourtName ||
                                                        booking.pickleballCourtId?.name || booking.pickleballCourtName}
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {booking.poolId && (
                                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
                                                            Pool
                                                        </Badge>
                                                    )}
                                                    {booking.tennisCourtId && (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                                                            Tennis Court
                                                        </Badge>
                                                    )}
                                                    {booking.pickleballCourtId && (
                                                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs">
                                                            Pickleball Court
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                            <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                            <span>{booking.guests} guests</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm sm:text-base text-gray-800">Customer Details</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                                            <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                                            <span className="break-words">{booking.customerName}</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                                            <span className="break-all">{booking.customerEmail}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                            <span className="break-words">{booking.customerPhone}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Notes */}
                            {booking.notes && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        <span className="font-medium">Notes:</span> {booking.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {filteredBookings.length === 0 && (
                    <Card>
                        <CardContent className="p-8 sm:p-12 text-center">
                            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">No bookings found</h3>
                            <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filter criteria.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default BookingsPage 