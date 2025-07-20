"use client"
import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Building2,
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Star,
    Phone,
    Mail,
    Clock,
    Link as LinkIcon,
    Image as ImageIcon,

} from "lucide-react"

// Mock pool data - in real app, fetch by ID
const poolData = {
    id: 1,
    name: "Dream Valley Pool",
    size: "1256 sqft.",
    location: "3106 Fleming Way, Richmond, USA",
    description: "A beautiful outdoor swimming pool with modern amenities, perfect for family gatherings and relaxation. Features include a diving board, shallow end for children, and comfortable seating areas.",
    price: "$150/hour",
    capacity: "25 people",
    status: "Active",
    owner: {
        name: "John Smith",
        phone: "+1 (555) 123-4567",
        email: "john.smith@email.com"
    },
    amenities: ["Diving Board", "Shallow End", "Heating System", "Lighting", "Security Fence", "Parking"],
    images: [
        "/pool-image-1.jpg",
        "/pool-image-2.jpg",
        "/pool-image-3.jpg",
        "/pool-image-4.jpg",
        "/pool-image-5.jpg"
    ],
    bookings: [
        { id: 1, date: "2024-01-15", time: "2:00 PM - 6:00 PM", customer: "Alice Johnson", status: "Confirmed" },
        { id: 2, date: "2024-01-18", time: "10:00 AM - 2:00 PM", customer: "Bob Wilson", status: "Pending" },
        { id: 3, date: "2024-01-20", time: "4:00 PM - 8:00 PM", customer: "Carol Davis", status: "Confirmed" }
    ],
    rating: 4.8,
    totalBookings: 45,
    totalRevenue: "$6,750"
}

const PoolDetails = ({ params }) => {
    const resolvedParams = React.use(params)
    const poolId = resolvedParams.id

    return (
        <div className="pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin/pool">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Pools
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <h1 className="text-2xl font-semibold text-gray-800">{poolData.name}</h1>
                        <Badge variant={poolData.status === 'Active' ? 'default' : 'secondary'}>
                            {poolData.status}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                        const bookingUrl = `${window.location.origin}/pool/${poolId}/book`
                        navigator.clipboard.writeText(bookingUrl)
                        alert('Booking link copied to clipboard!')
                    }}>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Share Booking Link
                    </Button>
                    <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Pool
                    </Button>
                    <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Pool Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Pool Images
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {poolData.images.map((image, index) => (
                                    <div key={index} className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-white text-center">
                                                <Building2 className="h-8 w-8 mx-auto mb-1 opacity-80" />
                                                <p className="text-xs opacity-80">Image {index + 1}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pool Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pool Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Location</p>
                                        <p className="text-gray-800">{poolData.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Size</p>
                                        <p className="text-gray-800">{poolData.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Capacity</p>
                                        <p className="text-gray-800">{poolData.capacity}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Price</p>
                                        <p className="text-gray-800">{poolData.price}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                                <p className="text-gray-800">{poolData.description}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Bookings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Recent Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {poolData.bookings.map((booking) => (
                                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-800">{booking.customer}</p>
                                            <p className="text-sm text-gray-600">{booking.date} • {booking.time}</p>
                                        </div>
                                        <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'}>
                                            {booking.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Owner Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Owner Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Name</p>
                                    <p className="text-gray-800">{poolData.owner.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Phone</p>
                                    <p className="text-gray-800">{poolData.owner.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Email</p>
                                    <p className="text-gray-800">{poolData.owner.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Rating</span>
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="font-medium">{poolData.rating}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Bookings</span>
                                <span className="font-medium">{poolData.totalBookings}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Revenue</span>
                                <span className="font-medium">{poolData.totalRevenue}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Amenities */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Amenities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {poolData.amenities.map((amenity, index) => (
                                    <Badge key={index} variant="outline">
                                        {amenity}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default PoolDetails 