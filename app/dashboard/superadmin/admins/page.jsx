"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Users,
    Search,
    Filter,
    Eye,
    Mail,
    Phone,
    Building2,
    Calendar,
    TrendingUp,
    UserPlus,
    MoreHorizontal
} from "lucide-react";
import { useSession } from "next-auth/react";

const AdminsPage = () => {
    const { data: session, status } = useSession();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");

    const fetchAdmins = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/superadmin/admins');
            if (!res.ok) throw new Error('Failed to fetch admins');
            const data = await res.json();
            setAdmins(data);
        } catch (err) {
            setError('Failed to load admins');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchAdmins();
        }
    }, [status]);

    // Filter and sort admins
    const filteredAdmins = admins
        .filter(admin => {
            const matchesSearch =
                admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admin.phone?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name?.localeCompare(b.name);
                case "pools":
                    return b.totalPools - a.totalPools;
                case "bookings":
                    return b.totalBookings - a.totalBookings;

                case "createdAt":
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

    // Calculate overall statistics
    const totalAdmins = admins.length;
    const totalPools = admins.reduce((sum, admin) => sum + admin.totalPools, 0);
    const totalBookings = admins.reduce((sum, admin) => sum + admin.totalBookings, 0);

    if (status === 'loading') return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (loading) return <div className="p-8 text-center text-gray-500">Loading admins...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h1 className="text-2xl font-semibold text-gray-800">Admin Management</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Total Admins: {totalAdmins}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Admins</p>
                                <p className="text-2xl font-bold text-gray-900">{totalAdmins}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Pools</p>
                                <p className="text-2xl font-bold text-gray-900">{totalPools}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>


            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search admins..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Sort By */}
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="createdAt">Date Created</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="pools">Number of Pools</SelectItem>
                                <SelectItem value="bookings">Number of Bookings</SelectItem>

                            </SelectContent>
                        </Select>

                        {/* Clear Filters */}
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setSortBy("createdAt");
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Admins List */}
            <div className="space-y-4">
                {filteredAdmins.map((admin) => (
                    <Card key={admin.email} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                {/* Admin Info */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg text-gray-800">
                                            {admin.name}
                                        </h3>
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                            Active
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="h-4 w-4" />
                                            <span>{admin.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="h-4 w-4" />
                                            <span>{admin.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Statistics */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800">Statistics</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Building2 className="h-4 w-4" />
                                            <span>{admin.totalPools} pools</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>{admin.totalBookings} bookings</span>
                                        </div>

                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800">Recent Activity</h4>
                                    <div className="space-y-2">
                                        <div className="text-sm text-gray-600">
                                            Joined: {new Date(admin.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Last active: {new Date(admin.lastActive).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Pool Preview */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800">Pools</h4>
                                    <div className="space-y-1">
                                        {admin.pools.slice(0, 3).map((pool) => (
                                            <div key={pool.id} className="text-sm text-gray-600">
                                                • {pool.name}
                                            </div>
                                        ))}
                                        {admin.pools.length > 3 && (
                                            <div className="text-sm text-gray-500">
                                                +{admin.pools.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800">Actions</h4>
                                    <div className="space-y-2">
                                        <Link href={`/dashboard/superadmin/admins/${encodeURIComponent(admin.email)}`}>
                                            <Button size="sm" className="w-full">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredAdmins.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">No admins found</h3>
                            <p className="text-gray-500">Try adjusting your search criteria.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminsPage; 