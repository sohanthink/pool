"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Target,
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

const SuperadminTennisCourtDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [court, setCourt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const courtId = params.id;

    const fetchCourtDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/superadmin/tennis/${courtId}`);
            if (!res.ok) throw new Error('Failed to fetch tennis court details');
            const data = await res.json();
            setCourt(data);
        } catch (err) {
            setError('Failed to load tennis court details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && courtId) {
            fetchCourtDetails();
        }
    }, [status, courtId]);

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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading tennis court details...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    if (!court) return <div className="min-h-screen flex items-center justify-center text-gray-500">Tennis court not found</div>;

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
                                <Target className="h-5 w-5 text-green-600" />
                                <h1 className="text-xl font-semibold text-gray-800">Tennis Court Details</h1>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                                                    src={image.startsWith('/uploads/') ? image : `/uploads/${image?.replace(/^\/+/, '')}`}
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
                                        <Calendar className="h-5 w-5 text-gray-500" />
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
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <Badge variant={court.status === 'Active' ? 'default' : 'secondary'}>
                                        {court.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Court
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    View Bookings
                                </Button>
                                <Button variant="destructive" className="w-full justify-start">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Court
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperadminTennisCourtDetailsPage;
