"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Users,
    Building2,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Clock,
    TrendingUp,
    CheckCircle,
    XCircle,
    AlertCircle,
    BarChart3,
    Trash2
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const AdminDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const adminEmail = decodeURIComponent(params.email);

    const fetchAdminDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/superadmin/admins/${encodeURIComponent(adminEmail)}`);
            if (!res.ok) throw new Error('Failed to fetch admin details');
            const data = await res.json();
            setAdmin(data);
        } catch (err) {
            setError('Failed to load admin details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && adminEmail) {
            fetchAdminDetails();
        }
    }, [status, adminEmail]);

    const handleDeleteUser = async () => {
        setDeleting(true);
        setError('');
        try {
            console.log('Starting delete process for email:', adminEmail);
            console.log('Encoded email:', encodeURIComponent(adminEmail));

            const res = await fetch(`/api/superadmin/admins/${encodeURIComponent(adminEmail)}`, {
                method: 'DELETE',
            });

            console.log('Response status:', res.status);
            console.log('Response ok:', res.ok);

            if (!res.ok) {
                const errorData = await res.json();
                console.error('Delete failed with error:', errorData);
                throw new Error(errorData.error || 'Failed to delete user');
            }

            const result = await res.json();
            console.log('User deleted successfully:', result);
            console.log('Deletion result:', result.deletedData);

            // Close dialog and redirect immediately on success
            setShowDeleteDialog(false);
            setDeleting(false);

            // Redirect to admins list after successful deletion
            console.log('Redirecting to admin list...');
            console.log('Current URL:', window.location.href);
            console.log('Target URL: /dashboard/superadmin/admins');

            // Use window.location for immediate redirect
            window.location.href = '/dashboard/superadmin/admins';

        } catch (err) {
            console.error('Delete error:', err);
            setError(err.message || 'Failed to delete user');
            setDeleting(false);
        }
    };

    if (status === 'loading') return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (loading) return <div className="p-8 text-center text-gray-500">Loading admin details...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!admin) return <div className="p-8 text-center text-gray-500">Admin not found</div>;

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
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
                        <Users className="h-5 w-5 text-blue-600" />
                        <h1 className="text-2xl font-semibold text-gray-800">Admin Details</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Active
                    </Badge>
                    <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                        className="flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete User
                    </Button>
                </div>
            </div>

            {/* Admin Info Card */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {admin.name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Admin Avatar */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="text-center">
                                <h3 className="font-semibold text-lg text-gray-800">{admin.name}</h3>
                                <p className="text-sm text-gray-600">Pool Owner</p>
                            </div>
                        </div>
                        {/* Admin Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">{admin.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">{admin.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">
                                    Joined: {new Date(admin.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">
                                    Last active: {new Date(admin.lastActive).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        {/* Admin Stats */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">{admin.totalPools} pools</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">{admin.totalBookings} bookings</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Pools</p>
                                <p className="text-2xl font-bold text-gray-900">{admin.totalPools}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{admin.totalBookings}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                                <p className="text-2xl font-bold text-gray-900">{admin.bookingStats.confirmed}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>


            </div>

            {/* Pools Section */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Pools ({admin.pools.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {admin.pools.map((pool) => (
                            <div key={pool.id} className="border rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <h4 className="font-medium text-gray-800">{pool.name}</h4>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{pool.location}</span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <div>Free</div>
                                        <div>Bookings: {pool.totalBookings}</div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <div>Created: {new Date(pool.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Badge className={
                                            pool.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }>
                                            {pool.status}
                                        </Badge>
                                        <Link href={`/dashboard/superadmin/pools/${pool.id}`}>
                                            <Button size="sm" variant="outline">
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Recent Bookings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {admin.recentBookings.map((booking) => (
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
                        ))}
                        {admin.recentBookings.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                No recent bookings found
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete User
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Are you sure you want to permanently delete this user? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">This will permanently delete:</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                            <li>• User account: {admin?.email}</li>
                            <li>• All pools: {admin?.totalPools} pools</li>
                            <li>• All bookings: {admin?.totalBookings} bookings</li>
                            <li>• All tennis courts (if any)</li>
                            <li>• All pickleball courts (if any)</li>
                        </ul>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUser}
                            disabled={deleting}
                            className="flex items-center gap-2"
                        >
                            {deleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Delete Permanently
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDetailsPage; 