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
    CheckCircle,
    XCircle,
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

    // Get unique pools and tennis courts for filter
    const pools = [...new Set(bookings.map(booking => booking.poolId?.name || booking.poolName).filter(Boolean))]
    const tennisCourts = [...new Set(bookings.map(booking => booking.tennisCourtId?.name || booking.tennisCourtName).filter(Boolean))]
    const allVenues = [...pools, ...tennisCourts]

    // Filter bookings
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            (booking.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (booking.customerEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (booking.poolId?.name?.toLowerCase() || booking.poolName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (booking.tennisCourtId?.name?.toLowerCase() || booking.tennisCourtName?.toLowerCase() || '').includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || booking.status === statusFilter
        const matchesPool = poolFilter === "all" || 
            (booking.poolId?.name || booking.poolName) === poolFilter ||
            (booking.tennisCourtId?.name || booking.tennisCourtName) === poolFilter
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
            case "Pending":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
            case "Cancelled":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    // Handle status change
    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            const res = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            await fetchBookings(); // Refresh bookings after update
            alert(`Booking status updated to ${newStatus}`);
        } catch (err) {
            alert('Failed to update booking status');
        }
    }

    if (status === 'loading' || !session?.user?.email) return <div className="p-8 text-center text-gray-500">Loading user...</div>;
    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>

    return (
        <div className="pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h1 className="text-2xl font-semibold text-gray-800">Bookings Management</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Total Bookings: {filteredBookings.length}
                    </div>
                    <Link href="/dashboard/admin/bookings/create">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Calendar className="h-4 w-4 mr-2" />
                            Create Booking
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="relative">
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
                                <SelectItem value="Pending">Pending</SelectItem>
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
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {bookings.filter(b => b.poolId).length}
                            </div>
                            <div className="text-sm text-gray-600">Pool Bookings</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {bookings.filter(b => b.tennisCourtId).length}
                            </div>
                            <div className="text-sm text-gray-600">Tennis Court Bookings</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">
                                {bookings.length}
                            </div>
                            <div className="text-sm text-gray-600">Total Bookings</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings List */}
            <div className="space-y-4">
                {filteredBookings.map((booking) => (
                    <Card key={booking._id || booking.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Booking Info */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg text-gray-800">
                                            Booking #{booking._id || booking.id}
                                        </h3>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>{booking.date?.slice(0, 10) || booking.date} • {booking.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4" />
                                            <span>{booking.duration} hours</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
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
                                    <h4 className="font-medium text-gray-800">
                                        {booking.poolId ? "Pool Details" : "Tennis Court Details"}
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            {booking.poolId ? (
                                                <MapPin className="h-4 w-4" />
                                            ) : (
                                                <Target className="h-4 w-4" />
                                            )}
                                            <span>
                                                {booking.poolId?.name || booking.poolName || 
                                                 booking.tennisCourtId?.name || booking.tennisCourtName}
                                            </span>
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
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="h-4 w-4" />
                                            <span>{booking.guests} guests</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800">Customer Details</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="h-4 w-4" />
                                            <span>{booking.customerName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="h-4 w-4" />
                                            <span>{booking.customerEmail}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="h-4 w-4" />
                                            <span>{booking.customerPhone}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800">Actions</h4>
                                    <div className="space-y-2">
                                        {booking.status === "Pending" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleStatusChange(booking._id || booking.id, "Confirmed")}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Confirm
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => handleStatusChange(booking._id || booking.id, "Cancelled")}
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {booking.notes && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Notes:</span> {booking.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {filteredBookings.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">No bookings found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default BookingsPage 