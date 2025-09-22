"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Target,
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

const PickleballDetails = ({ params }) => {
    const courtId = params.id
    const [pickleball, setPickleball] = useState(null)
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
                const pickleballRes = await fetch(`/api/pickleball/${courtId}`)
                if (!pickleballRes.ok) throw new Error('Pickleball court not found')
                const pickleballData = await pickleballRes.json()
                setPickleball(pickleballData)

                // Check if there's an active booking link
                if (pickleballData.isBookingLinkActive && pickleballData.bookingToken && pickleballData.bookingLinkExpiry) {
                    const expiryDate = new Date(pickleballData.bookingLinkExpiry);
                    const now = new Date();

                    if (expiryDate > now) {
                        // Link is still active
                        setIsBookingLinkActive(true);
                        setBookingLinkExpiry(expiryDate);
                        setBookingLink(`${window.location.origin}/pickleball/${courtId}/book?token=${pickleballData.bookingToken}`);
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
    if (error || !pickleball) {
        return <div className="p-8 text-center text-red-600 flex flex-col items-center"><AlertCircle className="h-8 w-8 mb-2" />{error || 'Pickleball court not found'}</div>
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this pickleball court and all its images? This action cannot be undone.')) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/pickleball/${courtId}/delete-with-images`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete pickleball court');
            }
            alert('Pickleball court and images deleted successfully!');
            router.push('/dashboard/admin/pickleball');
        } catch (err) {
            alert(`Failed to delete pickleball court: ${err.message}`);
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
            const res = await fetch(`/api/pickleball/${courtId}/booking-link`, {
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
            const generatedLink = data.bookingUrl || `${window.location.origin}/pickleball/${courtId}/book?token=${data.bookingToken}`;
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
            const res = await fetch(`/api/pickleball/${courtId}/booking-link`, {
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
                    <Link href="/dashboard/admin/pickleball">
                        <Button variant="outline" size="sm" className="w-fit">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Pickleball Courts
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Target className="h-5 w-5 text-orange-600 flex-shrink-0" />
                        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 break-words">{pickleball.name}</h1>
                        <Badge variant={pickleball.status === 'Active' ? 'default' : 'secondary'} className="flex-shrink-0">
                            {pickleball.status}
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
                        <Link href={`/dashboard/admin/pickleball/${courtId}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
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
                {/* Court Details */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Target className="h-5 w-5" />
                                Court Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Court Name</p>
                                    <p className="text-gray-900 break-words">{pickleball.name}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Location</p>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-gray-900 break-words min-w-0">{pickleball.location}</p>
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
                                        <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <p className="text-gray-900">${pickleball.price}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <Badge variant={pickleball.status === 'Active' ? 'default' : 'secondary'} className="w-fit">
                                        {pickleball.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500">Description</p>
                                <p className="text-gray-900 text-sm leading-relaxed">{pickleball.description}</p>
                            </div>

                            {pickleball.amenities && pickleball.amenities.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Amenities</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {pickleball.amenities.map((amenity, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
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
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ImageIcon className="h-5 w-5" />
                                    Court Images
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5" />
                                Recent Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {bookings.length > 0 ? (
                                <div className="space-y-3">
                                    {bookings.slice(0, 5).map((booking) => (
                                        <div key={booking._id} className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 border rounded-lg">
                                            <div className="space-y-1 min-w-0">
                                                <p className="font-medium truncate">{booking.customerName}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(booking.date).toLocaleDateString()} at {booking.time}
                                                </p>
                                            </div>
                                            <Badge variant={booking.status === 'Confirmed' ? 'default' : 'destructive'} className="w-fit">
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
                <div className="space-y-4 md:space-y-6">
                    {/* Owner Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="h-5 w-5" />
                                Owner Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start gap-2">
                                <Users className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm break-words min-w-0">{pickleball.owner.name}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm break-all min-w-0">{pickleball.owner.email}</span>
                            </div>
                            {pickleball.owner.phone && (
                                <div className="flex items-start gap-2">
                                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm break-all">{pickleball.owner.phone}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Star className="h-5 w-5" />
                                Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Bookings</span>
                                <span className="font-medium">{pickleball.totalBookings || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Rating</span>
                                <span className="font-medium">{pickleball.rating || 0}/5</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Created</span>
                                <span className="font-medium text-sm">{new Date(pickleball.createdAt).toLocaleDateString()}</span>
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
                title="Generate Pickleball Court Booking Link"
                defaultExpiryHours={24}
                defaultPrice={0}
                expiryUnit="hours"
            />
        </div>
    )
}

export default PickleballDetails
