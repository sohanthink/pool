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

const TennisCourtDetails = ({ params }) => {
    const courtId = params.id
    const [court, setCourt] = useState(null)
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deleting, setDeleting] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [linkExpiry, setLinkExpiry] = useState('');
    const [isLinkActive, setIsLinkActive] = useState(false);
    const [generatingLink, setGeneratingLink] = useState(false);
    const [deactivatingLink, setDeactivatingLink] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            setError('')
            try {
                const courtRes = await fetch(`/api/tennis/${courtId}`)
                if (!courtRes.ok) throw new Error('Tennis court not found')
                const courtData = await courtRes.json()
                setCourt(courtData)

                // Set share link status if available
                if (courtData.isLinkActive && courtData.linkToken && courtData.linkExpiry) {
                    setShareLink(`${window.location.origin}/tennis/${courtId}/share/${courtData.linkToken}`);
                    setLinkExpiry(new Date(courtData.linkExpiry).toLocaleString());
                    setIsLinkActive(true);
                }

                // Fetch bookings for this court
                const bookingsRes = await fetch(`/api/bookings?tennisCourtId=${courtId}`)
                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json()
                    setBookings(bookingsData)
                } else {
                    setBookings([])
                }
            } catch (err) {
                setError(err.message || 'Failed to load tennis court')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [courtId])

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>
    }
    if (error || !court) {
        return <div className="p-8 text-center text-red-600 flex flex-col items-center"><AlertCircle className="h-8 w-8 mb-2" />{error || 'Tennis court not found'}</div>
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this tennis court and all its images? This action cannot be undone.')) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/tennis/${courtId}/delete-with-images`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete tennis court');
            }
            alert('Tennis court and images deleted successfully!');
            router.push('/dashboard/admin/tennis');
        } catch (err) {
            alert(`Failed to delete tennis court: ${err.message}`);
        } finally {
            setDeleting(false);
        }
    };

    const handleGenerateShareLink = async () => {
        const expiryHours = prompt('Enter link expiry time in hours (default: 24):', '24');
        if (!expiryHours) return;

        setGeneratingLink(true);
        try {
            const res = await fetch(`/api/tennis/${courtId}/share-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expiryHours: parseInt(expiryHours) || 24 }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to generate link');
            }

            const data = await res.json();
            setShareLink(data.shareableUrl);
            setLinkExpiry(new Date(data.linkExpiry).toLocaleString());
            setIsLinkActive(true);
            alert('Shareable link generated successfully!');
        } catch (err) {
            alert(`Failed to generate link: ${err.message}`);
        } finally {
            setGeneratingLink(false);
        }
    };

    const handleDeactivateLink = async () => {
        if (!window.confirm('Are you sure you want to deactivate this shareable link?')) return;

        setDeactivatingLink(true);
        try {
            const res = await fetch(`/api/tennis/${courtId}/share-link`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to deactivate link');
            }

            setShareLink('');
            setLinkExpiry('');
            setIsLinkActive(false);
            alert('Shareable link deactivated successfully!');
        } catch (err) {
            alert(`Failed to deactivate link: ${err.message}`);
        } finally {
            setDeactivatingLink(false);
        }
    };

    const copyShareLink = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            alert('Shareable link copied to clipboard!');
        }
    };

    return (
        <div className="pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin/tennis">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Tennis Courts
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        <h1 className="text-2xl font-semibold text-gray-800">{court.name}</h1>
                        <Badge variant={court.status === 'Active' ? 'default' : 'secondary'}>
                            {court.status}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isLinkActive ? (
                        <>
                            <Button variant="outline" onClick={copyShareLink} disabled={!shareLink}>
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Copy Share Link
                            </Button>
                            <Button variant="destructive" onClick={handleDeactivateLink} disabled={deactivatingLink}>
                                {deactivatingLink ? 'Deactivating...' : 'Deactivate Link'}
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={handleGenerateShareLink} disabled={generatingLink}>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            {generatingLink ? 'Generating...' : 'Generate Share Link'}
                        </Button>
                    )}

                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/admin/tennis/${courtId}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Court
                        </Link>
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>

            {/* Share Link Status */}
            {isLinkActive && (
                <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <LinkIcon className="h-5 w-5" />
                            Active Share Link
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-green-700 border-green-300">
                                Active
                            </Badge>
                            <span className="text-sm text-green-700">
                                Expires: {linkExpiry}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={shareLink}
                                readOnly
                                className="flex-1 px-3 py-2 border border-green-300 rounded-md bg-white text-sm"
                            />
                            <Button size="sm" onClick={copyShareLink}>
                                Copy
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Court Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Court Images
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {(court.images && court.images.length > 0 ? court.images : [null, null, null]).map((image, index) => (
                                    <div key={index} className="aspect-video bg-gradient-to-br from-green-400 to-green-600 rounded-lg relative flex items-center justify-center overflow-hidden">
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={`Court Image ${index + 1}`}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-white text-center">
                                                    <Target className="h-8 w-8 mx-auto mb-1 opacity-80" />
                                                    <p className="text-xs opacity-80">No Image</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Court Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Court Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Location</p>
                                        <p className="text-gray-800">{court.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Target className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Surface</p>
                                        <p className="text-gray-800">{court.surface}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Type</p>
                                        <p className="text-gray-800">{court.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Price</p>
                                        <p className="text-gray-800">${court.price}/hour</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                                <p className="text-gray-800">{court.description}</p>
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
                                {bookings.length === 0 && (
                                    <div className="text-gray-500 text-sm">No bookings found for this court.</div>
                                )}
                                {bookings.map((booking) => (
                                    <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-800">{booking.customerName}</p>
                                            <p className="text-sm text-gray-600">{booking.date?.slice(0, 10)} • {booking.time}</p>
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
                                    <p className="text-gray-800">{court.owner?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Phone</p>
                                    <p className="text-gray-800">{court.owner?.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Email</p>
                                    <p className="text-gray-800">{court.owner?.email}</p>
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
                                    <span className="font-medium">{court.rating ?? 0}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Bookings</span>
                                <span className="font-medium">{court.totalBookings ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Revenue</span>
                                <span className="font-medium">${court.totalRevenue ?? 0}</span>
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
                                {(court.amenities && court.amenities.length > 0 ? court.amenities : ['No amenities']).map((amenity, index) => (
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

export default TennisCourtDetails
