"use client"
import React, { useEffect, useState } from 'react'
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
    AlertCircle
} from "lucide-react"
import { useRouter } from 'next/navigation';
import BookingLinkModal from '@/components/BookingLinkModal';

const PoolDetails = ({ params }) => {
    const poolId = params.id
    const [pool, setPool] = useState(null)
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deleting, setDeleting] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingLink, setBookingLink] = useState("");
    const [isBookingLinkActive, setIsBookingLinkActive] = useState(false);
    const [bookingLinkExpiry, setBookingLinkExpiry] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            setError('')
            try {
                const poolRes = await fetch(`/api/pools/${poolId}`)
                if (!poolRes.ok) throw new Error('Pool not found')
                const poolData = await poolRes.json()
                setPool(poolData)

                // Check if there's an active booking link
                if (poolData.isBookingLinkActive && poolData.bookingToken && poolData.bookingLinkExpiry) {
                    const expiryDate = new Date(poolData.bookingLinkExpiry);
                    const now = new Date();

                    if (expiryDate > now) {
                        // Link is still active
                        setIsBookingLinkActive(true);
                        setBookingLinkExpiry(expiryDate);
                        setBookingLink(`${window.location.origin}/pool/${poolId}/book?token=${poolData.bookingToken}`);
                    } else {
                        // Link has expired
                        setIsBookingLinkActive(false);
                        setBookingLinkExpiry(null);
                        setBookingLink("");
                    }
                } else {
                    // No active booking link
                    setIsBookingLinkActive(false);
                    setBookingLinkExpiry(null);
                    setBookingLink("");
                }


                // Fetch bookings for this pool
                const bookingsRes = await fetch(`/api/bookings?poolId=${poolId}`)
                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json()
                    setBookings(bookingsData)
                } else {
                    setBookings([])
                }
            } catch (err) {
                setError(err.message || 'Failed to load pool')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [poolId])

    // Check for booking link expiry every minute
    useEffect(() => {
        if (!isBookingLinkActive || !bookingLinkExpiry) return;

        const checkExpiry = () => {
            const now = new Date();
            if (now >= bookingLinkExpiry) {
                setIsBookingLinkActive(false);
                setBookingLinkExpiry(null);
                setBookingLink("");
            }
        };

        const interval = setInterval(checkExpiry, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [isBookingLinkActive, bookingLinkExpiry])

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>
    }
    if (error || !pool) {
        return <div className="p-8 text-center text-red-600 flex flex-col items-center"><AlertCircle className="h-8 w-8 mb-2" />{error || 'Pool not found'}</div>
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this pool and all its images? This action cannot be undone.')) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/pools/${poolId}/delete-with-images`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete pool');
            }
            alert('Pool and images deleted successfully!');
            router.push('/dashboard/admin/pool');
        } catch (err) {
            alert(`Failed to delete pool: ${err.message}`);
        } finally {
            setDeleting(false);
        }
    };


    // Booking link generation functions
    const handleGenerateBookingLink = () => {
        setIsBookingModalOpen(true);
    };

    const handleModalGenerateBookingLink = async (expiryHours, price) => {
        try {
            const res = await fetch(`/api/pools/${poolId}/booking-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    price: parseFloat(price) || 0,
                    expiryHours: parseInt(expiryHours) || 24
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to generate booking link');
            }

            const data = await res.json();
            const generatedLink = data.bookingUrl || `${window.location.origin}/pool/${poolId}/book?token=${data.bookingToken}`;
            const expiryDate = new Date(data.bookingLinkExpiry);

            setBookingLink(generatedLink);
            setIsBookingLinkActive(true);
            setBookingLinkExpiry(expiryDate);
            navigator.clipboard.writeText(generatedLink);
            alert(`Booking link generated and copied to clipboard!\nPrice: $${data.price}\nExpires: ${expiryDate.toLocaleString()}`);
        } catch (err) {
            alert(`Failed to generate booking link: ${err.message}`);
            throw err;
        }
    };

    const handleDeactivateLink = async () => {
        if (!window.confirm('Are you sure you want to deactivate this booking link? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/pools/${poolId}/booking-link`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to deactivate booking link');
            }

            // Clear the booking link state
            setBookingLink("");
            setIsBookingLinkActive(false);
            setBookingLinkExpiry(null);
            alert('Booking link deactivated successfully!');
        } catch (err) {
            alert(`Failed to deactivate booking link: ${err.message}`);
        }
    };

    return (
        <div className="pt-4 md:pt-6 space-y-4 md:space-y-6 px-4 md:px-0">
            {/* Header */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="flex flex-col space-y-3 md:flex-row md:items-center md:gap-4 md:space-y-0">
                    <Link href="/dashboard/admin/pool">
                        <Button variant="outline" size="sm" className="w-fit">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Pools
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 break-words">{pool.name}</h1>
                        <Badge variant={pool.status === 'Active' ? 'default' : 'secondary'} className="flex-shrink-0">
                            {pool.status}
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-col space-y-2 md:flex-row md:gap-2 md:space-y-0">
                    <Button variant="default" onClick={handleGenerateBookingLink} className="bg-green-600 hover:bg-green-700 text-sm md:text-base">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Generate Booking Link</span>
                        <span className="sm:hidden">Generate Link</span>
                    </Button>

                    <Button variant="outline" asChild className="text-sm md:text-base">
                        <Link href={`/dashboard/admin/pool/${poolId}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Pool
                        </Link>
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="text-sm md:text-base">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>

            {isBookingLinkActive && bookingLink && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
                            <LinkIcon className="h-5 w-5" />
                            Active Booking Link
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-2 sm:space-y-0">
                            <Badge variant="outline" className="text-green-700 border-green-300 w-fit">
                                Active
                            </Badge>
                            {bookingLinkExpiry && (
                                <span className="text-sm text-blue-700">
                                    Expires: {bookingLinkExpiry.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-2 sm:space-y-0">
                            <input
                                type="text"
                                value={bookingLink}
                                readOnly
                                className="flex-1 px-3 py-2 border border-blue-300 rounded-md bg-white text-sm min-w-0"
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => navigator.clipboard.writeText(bookingLink)} className="flex-1 sm:flex-none">
                                    Copy Link
                                </Button>
                                <Button size="sm" variant="destructive" onClick={handleDeactivateLink} className="flex-1 sm:flex-none">
                                    Deactivate
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* Pool Images */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ImageIcon className="h-5 w-5" />
                                Pool Images
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                {(pool.images && pool.images.length > 0 ? pool.images : [null, null, null]).map((image, index) => (
                                    <div key={index} className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg relative flex items-center justify-center overflow-hidden">
                                        {image ? (
                                            <img
                                                src={image.startsWith('/uploads/') ? image : `/uploads/${image?.replace(/^\/+/, '')}`}
                                                alt={`Pool Image ${index + 1}`}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-white text-center">
                                                    <Building2 className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 opacity-80" />
                                                    <p className="text-xs opacity-80">No Image</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pool Details */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Pool Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-600">Location</p>
                                        <p className="text-gray-800 break-words">{pool.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Building2 className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-600">Size</p>
                                        <p className="text-gray-800 break-words">{pool.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Users className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-600">Capacity</p>
                                        <p className="text-gray-800">{pool.capacity}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <DollarSign className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-600">Price</p>
                                        <p className="text-gray-800">${pool.price}/hour</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                                <p className="text-gray-800 text-sm leading-relaxed">{pool.description}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Bookings */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5" />
                                Recent Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {bookings.length === 0 && (
                                    <div className="text-gray-500 text-sm py-4 text-center">No bookings found for this pool.</div>
                                )}
                                {bookings.map((booking) => (
                                    <div key={booking._id} className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 bg-gray-50 rounded-lg">
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-800 truncate">{booking.customerName}</p>
                                            <p className="text-sm text-gray-600">{booking.date?.slice(0, 10)} • {booking.time}</p>
                                        </div>
                                        <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'} className="w-fit">
                                            {booking.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4 md:space-y-6">
                    {/* Owner Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Owner Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-600">Name</p>
                                    <p className="text-gray-800 break-words">{pool.owner?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-600">Phone</p>
                                    <p className="text-gray-800 break-all">{pool.owner?.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-600">Email</p>
                                    <p className="text-gray-800 break-all text-sm">{pool.owner?.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Rating</span>
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="font-medium">{pool.rating ?? 0}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Bookings</span>
                                <span className="font-medium">{pool.totalBookings ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Revenue</span>
                                <span className="font-medium">${pool.totalRevenue ?? 0}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Amenities */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Amenities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {(pool.amenities && pool.amenities.length > 0 ? pool.amenities : ['No amenities']).map((amenity, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        {amenity}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Booking Link Modal */}
            <BookingLinkModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onGenerate={handleModalGenerateBookingLink}
                title="Generate Pool Booking Link"
                defaultExpiryHours={24}
                defaultPrice={0}
                expiryUnit="hours"
            />
        </div>
    );
}

export default PoolDetails; 