"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Building2,
    Search,
    Filter,
    MapPin,
    Users,
    Calendar,
    Eye,
    Plus,
    LogOut,
    ArrowLeft
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const SuperadminPoolsPage = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ownerFilter, setOwnerFilter] = useState('all');

    const fetchPools = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/superadmin/pools');
            if (!res.ok) throw new Error('Failed to fetch pools');
            const data = await res.json();
            setPools(data);
        } catch (err) {
            setError('Failed to load pools');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchPools();
        }
    }, [status]);

    // Get unique owners for filter
    const owners = [...new Set(pools.map(pool => pool.owner?.name || 'Unknown'))];

    // Filter pools
    const filteredPools = pools.filter(pool => {
        const matchesSearch =
            pool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pool.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pool.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && pool.isActive) ||
            (statusFilter === 'inactive' && !pool.isActive);

        const matchesOwner = ownerFilter === 'all' || pool.owner?.name === ownerFilter;

        return matchesSearch && matchesStatus && matchesOwner;
    });

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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading pools...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/dashboard/superadmin')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Button>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                <h1 className="text-xl font-semibold text-gray-800">All Pools</h1>
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
                    {/* Header Stats */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Total Pools: {filteredPools.length}
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
                                        placeholder="Search pools..."
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
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Owner Filter */}
                                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by owner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Owners</SelectItem>
                                        {owners.map((owner) => (
                                            <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Clear Filters */}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setOwnerFilter('all');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPools.map((pool) => (
                            <Card key={pool._id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    {/* Pool Image */}
                                    {pool.images && pool.images.length > 0 && (
                                        <div className="mb-4">
                                            <img
                                                src={pool.images[0].startsWith('/uploads/') ? pool.images[0] : `/uploads/${pool.images[0].replace(/^\/+/, '')}`}
                                                alt={pool.name}
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}

                                    {/* Pool Info */}
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-semibold text-lg text-gray-800">{pool.name}</h3>
                                            <Badge className={
                                                pool.isActive
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                            }>
                                                {pool.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>

                                        <p className="text-gray-600 text-sm line-clamp-2">{pool.description}</p>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>{pool.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>Capacity: {pool.capacity} people</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>Bookings: {pool.totalBookings || 0}</span>
                                            </div>
                                        </div>

                                        {/* Owner Info */}
                                        <div className="pt-3 border-t">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">Owner:</span> {pool.owner?.name}
                                                </div>
                                                <Link href={`/dashboard/superadmin/pools/${pool._id}`}>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredPools.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600 mb-2">No pools found</h3>
                                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuperadminPoolsPage; 