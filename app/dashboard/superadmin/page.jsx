"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Calendar, DollarSign, TrendingUp, Activity, Users, Edit, Eye } from "lucide-react"
import Link from 'next/link'

// Mock current user (replace with real session logic later)
const currentUser = {
    role: 'superadmin',
    email: 'superadmin@example.com',
    name: 'Super Admin'
}

export default function SuperAdminDashboardPage() {
    const [pools, setPools] = useState([])
    const [bookings, setBookings] = useState([])
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            setError('')
            try {
                // Fetch all pools
                const poolRes = await fetch('/api/pools')
                const poolData = poolRes.ok ? await poolRes.json() : []
                setPools(poolData)

                // Fetch all bookings
                const bookingsRes = await fetch('/api/bookings')
                const bookingsData = bookingsRes.ok ? await bookingsRes.json() : []
                setBookings(bookingsData)

                // Extract unique admins (pool owners) from pools
                const adminMap = {}
                poolData.forEach(pool => {
                    if (pool.owner && pool.owner.email) {
                        adminMap[pool.owner.email] = pool.owner
                    }
                })
                setAdmins(Object.values(adminMap))
            } catch (err) {
                setError('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>
    }
    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>
    }

    // Stats
    const totalRevenue = pools.reduce((sum, p) => sum + (p.totalRevenue || 0), 0)
    const totalBookings = bookings.length
    const totalPools = pools.length
    const totalAdmins = admins.length
    const avgRating = pools.length ? (pools.reduce((sum, p) => sum + (p.rating || 0), 0) / pools.length).toFixed(2) : 'N/A'

    return (
        <div className="pt-6 space-y-6">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {currentUser.name}!</h1>
                <p className="text-gray-600 mt-2">Here is your superadmin dashboard.</p>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Pools</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{totalPools}</p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                                <Building2 className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{totalBookings}</p>
                            </div>
                            <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                                <Calendar className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Admins</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{totalAdmins}</p>
                            </div>
                            <div className="p-3 rounded-full bg-green-50 text-green-600">
                                <Users className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">${totalRevenue}</p>
                            </div>
                            <div className="p-3 rounded-full bg-orange-50 text-orange-600">
                                <DollarSign className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/dashboard/superadmin/admins">
                                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full">
                                    <Users className="h-6 w-6 text-green-600 mb-2" />
                                    <p className="font-medium">Manage Admins</p>
                                    <p className="text-sm text-gray-600">View and manage pool owners</p>
                                </button>
                            </Link>
                            <Link href="/dashboard/superadmin/pools">
                                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full">
                                    <Building2 className="h-6 w-6 text-blue-600 mb-2" />
                                    <p className="font-medium">Manage Pools</p>
                                    <p className="text-sm text-gray-600">View and manage all pools</p>
                                </button>
                            </Link>
                            <Link href="/dashboard/superadmin/bookings">
                                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full">
                                    <Calendar className="h-6 w-6 text-purple-600 mb-2" />
                                    <p className="font-medium">All Bookings</p>
                                    <p className="text-sm text-gray-600">View all bookings</p>
                                </button>
                            </Link>
                            <Link href="/dashboard/superadmin/change-password">
                                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full">
                                    <Edit className="h-6 w-6 text-orange-600 mb-2" />
                                    <p className="font-medium">Change Password</p>
                                    <p className="text-sm text-gray-600">Update your password</p>
                                </button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Pools */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Recent Pools
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pools.slice(0, 5).map((pool) => (
                                <div key={pool._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-800">{pool.name}</p>
                                        <p className="text-sm text-gray-600">{pool.location}</p>
                                    </div>
                                    <Link href={`/dashboard/superadmin/pools/${pool._id}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                        <Eye className="h-4 w-4" /> View
                                    </Link>
                                </div>
                            ))}
                            {pools.length === 0 && <div className="text-gray-500 text-sm">No pools yet.</div>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Admins and Bookings List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Admins List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Pool Owners
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {admins.map((admin, idx) => (
                                <div key={admin.email || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-800">{admin.name}</p>
                                        <p className="text-sm text-gray-600">{admin.email}</p>
                                    </div>
                                </div>
                            ))}
                            {admins.length === 0 && <div className="text-gray-500 text-sm">No pool owners yet.</div>}
                        </div>
                    </CardContent>
                </Card>
                {/* Bookings List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Recent Bookings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {bookings.slice(0, 5).map((booking) => (
                                <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-800">{booking.customerName}</p>
                                        <p className="text-sm text-gray-600">{booking.date?.slice(0, 10)} • {booking.time}</p>
                                    </div>
                                    <span className="text-sm text-gray-500 capitalize">{booking.status}</span>
                                </div>
                            ))}
                            {bookings.length === 0 && <div className="text-gray-500 text-sm">No bookings yet.</div>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Revenue</p>
                                <p className="text-2xl font-bold">${totalRevenue}</p>
                            </div>
                            <DollarSign className="h-8 w-8 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Admins</p>
                                <p className="text-2xl font-bold">{totalAdmins}</p>
                            </div>
                            <Users className="h-8 w-8 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Pools</p>
                                <p className="text-2xl font-bold">{totalPools}</p>
                            </div>
                            <Building2 className="h-8 w-8 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Avg. Rating</p>
                                <p className="text-2xl font-bold">{avgRating}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 