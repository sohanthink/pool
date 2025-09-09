"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Building2,
    MapPin,
    Users,
    Calendar,
    Clock,
    Mail,
    Phone,
    Image as ImageIcon,
    Star,
    CheckCircle,
    XCircle,
    AlertCircle,
    Edit,
    Trash2,
    LogOut
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const SuperadminPoolDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [pool, setPool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const poolId = params.id;

    const fetchPoolDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/superadmin/pools/${poolId}`);
            if (!res.ok) throw new Error('Failed to fetch pool details');
            const data = await res.json();
            setPool(data);
        } catch (err) {
            setError('Failed to load pool details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && poolId) {
            fetchPoolDetails();
        }
    }, [status, poolId]);

    // Check if user is superadmin
    if (status === 'loading') return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (status === 'unauthenticated') {
        router.push('/superadmin/login');
        return null;
    }
    if (session?.user?.role !== 'superadmin') {
        router.push('/unauthorized');
        return null;
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading pool details...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    if (!pool) return <div className="min-h-screen flex items-center justify-center text-gray-500">Pool not found</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                <h1 className="text-xl font-semibold text-gray-800">Pool Details</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                                Welcome, {session.user.name}
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => signOut({ callbackUrl: '/superadmin/login' })}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Pool Images */}
                    {pool.images && pool.images.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5" />
                                    Pool Images ({pool.images.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {pool.images.map((image, index) => (
                                        <div key={index} className="border-2 border-red-500 p-2 rounded">
                                            <p className="text-xs text-red-600 mb-2">Pool Image {index + 1}:</p>
                                            <img
                                                src={image}
                                                alt={`Pool ${index + 1}`}
                                                className="w-full h-48 object-cover rounded border-2 border-green-500"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5" />
                                    Pool Images
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center text-gray-500 py-8">
                                    No images uploaded for this pool
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pool Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Pool Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{pool.name}</h3>
                                    <p className="text-gray-600">{pool.description}</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-700">{pool.location}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-700">Capacity: {pool.capacity} people</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-700">
                                            Created: {new Date(pool.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Amenities */}
                                {pool.amenities && pool.amenities.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-2">Amenities</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {pool.amenities.map((amenity, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {amenity}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Owner Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Pool Owner
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                                        {pool.owner?.name ? pool.owner.name.charAt(0).toUpperCase() : 'O'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-800">{pool.owner?.name}</h3>
                                        <p className="text-sm text-gray-600">Pool Owner</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-700">{pool.owner?.email}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-700">{pool.owner?.phone}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <Link href={`/dashboard/superadmin/admins/${encodeURIComponent(pool.owner?.email)}`}>
                                        <Button variant="outline" className="w-full">
                                            View Owner Details
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                        <p className="text-2xl font-bold text-gray-900">{pool.totalBookings || 0}</p>
                                    </div>
                                    <Calendar className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Confirmed</p>
                                        <p className="text-2xl font-bold text-gray-900">{pool.confirmedBookings || 0}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Confirmed</p>
                                        <p className="text-2xl font-bold text-gray-900">{pool.confirmedBookings || 0}</p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Bookings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Recent Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pool.recentBookings && pool.recentBookings.length > 0 ? (
                                    pool.recentBookings.map((booking) => (
                                        <div key={booking._id} className="border rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-800">
                                                        Booking #{booking._id?.slice(-6)}
                                                    </h4>
                                                    <div className="text-sm text-gray-600">
                                                        {booking.customerName} • {booking.customerEmail}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <div>Date: {new Date(booking.date).toLocaleDateString()}</div>
                                                    <div>Time: {booking.time}</div>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <div>Duration: {booking.duration} hours</div>
                                                    <div>Guests: {booking.guests}</div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Badge className={
                                                        booking.status === 'Confirmed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }>
                                                        {booking.status}
                                                    </Badge>
                                                    <div className="text-sm font-medium">
                                                        Free
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        No bookings found for this pool
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SuperadminPoolDetailsPage; 