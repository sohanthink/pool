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
    DollarSign
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

    useEffect(() => {
        if (!session?.user?.email) return;
        async function fetchBookings() {
            setLoading(true)
            setError('')
            try {
                const res = await fetch(`/api/bookings?ownerEmail=${encodeURIComponent(session.user.email)}`)
                if (!res.ok) throw new Error('Failed to fetch bookings')
                const data = await res.json()
                setBookings(data)
            } catch (err) {
                setError('Failed to load bookings')
            } finally {
                setLoading(false)
            }
        }
        fetchBookings()
    }, [session?.user?.email])

    // Get unique pools for filter
    const pools = [...new Set(bookings.map(booking => booking.poolId?.name || booking.poolName))]

    // Filter bookings
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            (booking.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (booking.customerEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (booking.poolId?.name?.toLowerCase() || booking.poolName?.toLowerCase() || '').includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || booking.status === statusFilter
        const matchesPool = poolFilter === "all" || (booking.poolId?.name || booking.poolName) === poolFilter

        return matchesSearch && matchesStatus && matchesPool
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
    const handleStatusChange = (bookingId, newStatus) => {
        // In real app, this would update the backend
        console.log(`Booking ${bookingId} status changed to ${newStatus}`)
        alert(`Booking status updated to ${newStatus}`)
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                        {/* Pool Filter */}
                        <Select value={poolFilter} onValueChange={setPoolFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by pool" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Pools</SelectItem>
                                {pools.map((pool) => (
                                    <SelectItem key={pool} value={pool}>{pool}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Clear Filters */}
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("")
                                setStatusFilter("all")
                                setPoolFilter("all")
                            }}
                        >
                            Clear Filters
                        </Button>
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
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <DollarSign className="h-4 w-4" />
                                            <span>${booking.totalPrice}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pool Info */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800">Pool Details</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span>{booking.poolId?.name || booking.poolName}</span>
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
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => {
                                                // View booking details
                                                console.log("View booking:", booking._id || booking.id)
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>

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