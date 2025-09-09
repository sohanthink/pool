"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Target,
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Star,
    Phone,
    Mail,
    Clock,
    Image as ImageIcon,
    AlertCircle
} from "lucide-react"

const SuperadminPickleballDetails = ({ params }) => {
    const courtId = params.id
    const [pickleball, setPickleball] = useState(null)
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            setError('')
            try {
                const pickleballRes = await fetch(`/api/superadmin/pickleball/${courtId}`)
                if (!pickleballRes.ok) throw new Error('Pickleball court not found')
                const pickleballData = await pickleballRes.json()
                setPickleball(pickleballData)

                // Fetch bookings for this pickleball court
                const bookingsRes = await fetch(`/api/bookings?pickleballCourtId=${courtId}`)
                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json()
                    setBookings(bookingsData)
                } else {
                    setBookings([])
                }
            } catch (err) {
                setError(err.message || 'Failed to load pickleball court')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [courtId])

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>
    }
    if (error || !pickleball) {
        return <div className="p-8 text-center text-red-600 flex flex-col items-center"><AlertCircle className="h-8 w-8 mb-2" />{error || 'Pickleball court not found'}</div>
    }

    return (
        <div className="pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/superadmin/pickleball">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Pickleball Courts
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-orange-600" />
                        <h1 className="text-2xl font-semibold text-gray-800">{pickleball.name}</h1>
                        <Badge variant={pickleball.status === 'Active' ? 'default' : 'secondary'}>
                            {pickleball.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Court Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Court Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Court Name</p>
                                    <p className="text-gray-900">{pickleball.name}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Location</p>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <p className="text-gray-900">{pickleball.location}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Surface Type</p>
                                    <p className="text-gray-900">{pickleball.surface}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Court Type</p>
                                    <p className="text-gray-900">{pickleball.type}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Price per Hour</p>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                        <p className="text-gray-900">${pickleball.price}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <Badge variant={pickleball.status === 'Active' ? 'default' : 'secondary'}>
                                        {pickleball.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500">Description</p>
                                <p className="text-gray-900">{pickleball.description}</p>
                            </div>

                            {pickleball.amenities && pickleball.amenities.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Amenities</p>
                                    <div className="flex flex-wrap gap-2">
                                        {pickleball.amenities.map((amenity, index) => (
                                            <Badge key={index} variant="secondary">
                                                {amenity}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Images */}
                    {pickleball.images && pickleball.images.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5" />
                                    Court Images
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {pickleball.images.map((image, index) => (
                                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                                src={image}
                                                alt={`${pickleball.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Bookings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Recent Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {bookings.length > 0 ? (
                                <div className="space-y-3">
                                    {bookings.slice(0, 5).map((booking) => (
                                        <div key={booking._id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="space-y-1">
                                                <p className="font-medium">{booking.customerName}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(booking.date).toLocaleDateString()} at {booking.time}
                                                </p>
                                            </div>
                                            <Badge variant={booking.status === 'Confirmed' ? 'default' : 'destructive'}>
                                                {booking.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No bookings yet</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Owner Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Owner Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{pickleball.owner.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{pickleball.owner.email}</span>
                            </div>
                            {pickleball.owner.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{pickleball.owner.phone}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Bookings</span>
                                <span className="font-medium">{pickleball.totalBookings || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Rating</span>
                                <span className="font-medium">{pickleball.rating || 0}/5</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Created</span>
                                <span className="font-medium">{new Date(pickleball.createdAt).toLocaleDateString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default SuperadminPickleballDetails
