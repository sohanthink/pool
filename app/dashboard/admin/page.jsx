"use client"
import React, { useEffect, useState } from 'react'
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Calendar, DollarSign, TrendingUp, Activity, Clock, Home, Eye, Target } from "lucide-react"
import Link from 'next/link'

export default function AdminDashboardPage() {
    const { data: session } = useSession();
    const user = session?.user;

    const [pools, setPools] = useState([])
    const [tennisCourts, setTennisCourts] = useState([])
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            setError('')
            try {
                // Fetch pools owned by this admin
                const poolRes = await fetch(`/api/pools?ownerEmail=${encodeURIComponent(user?.email)}`)
                const poolData = poolRes.ok ? await poolRes.json() : []
                setPools(poolData)

                // Fetch tennis courts owned by this admin
                const tennisRes = await fetch(`/api/tennis?ownerEmail=${encodeURIComponent(user?.email)}`)
                const tennisData = tennisRes.ok ? await tennisRes.json() : []
                setTennisCourts(tennisData)

                // Fetch bookings for pools
                const poolIds = poolData.map(p => p._id)
                let allBookings = []
                for (const poolId of poolIds) {
                    const bookingsRes = await fetch(`/api/bookings?poolId=${poolId}`)
                    if (bookingsRes.ok) {
                        const bookingsData = await bookingsRes.json()
                        allBookings = allBookings.concat(bookingsData)
                    }
                }

                // Fetch bookings for tennis courts
                const tennisIds = tennisData.map(t => t._id)
                for (const tennisId of tennisIds) {
                    const bookingsRes = await fetch(`/api/bookings?tennisCourtId=${tennisId}`)
                    if (bookingsRes.ok) {
                        const bookingsData = await bookingsRes.json()
                        allBookings = allBookings.concat(bookingsData)
                    }
                }
                setBookings(allBookings)
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
    const totalRevenue = pools.reduce((sum, p) => sum + (p.totalRevenue || 0), 0) + tennisCourts.reduce((sum, t) => sum + (t.totalRevenue || 0), 0)
    const totalBookings = bookings.length
    const totalPools = pools.length
    const totalTennisCourts = tennisCourts.length
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length
    const avgRating = (pools.length + tennisCourts.length) ? ((pools.reduce((sum, p) => sum + (p.rating || 0), 0) + tennisCourts.reduce((sum, t) => sum + (t.rating || 0), 0)) / (pools.length + tennisCourts.length)).toFixed(2) : 'N/A'

    return (
        <div className="pt-6 space-y-6">
            {/* Welcome Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name || 'Admin'}!</h1>
                    <p className="text-gray-600 mt-2">Email: {user?.email}</p>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Logout
                </button>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/dashboard/admin/pool">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transition-transform">
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
                </Link>
                <Link href="/dashboard/admin/tennis">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transition-transform">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tennis Courts</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{totalTennisCourts}</p>
                                </div>
                                <div className="p-3 rounded-full bg-green-50 text-green-600">
                                    <Target className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/dashboard/admin/bookings">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transition-transform">
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
                </Link>
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
                        <div className="grid grid-cols-3 gap-4">
                            <Link href="/dashboard/admin/pool/create">
                                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full">
                                    <Building2 className="h-6 w-6 text-blue-600 mb-2" />
                                    <p className="font-medium">Add Pool</p>
                                    <p className="text-sm text-gray-600">Create new pool listing</p>
                                </button>
                            </Link>
                            <Link href="/dashboard/admin/tennis/create">
                                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full">
                                    <Target className="h-6 w-6 text-green-600 mb-2" />
                                    <p className="font-medium">Add Tennis Court</p>
                                    <p className="text-sm text-gray-600">Create new tennis court</p>
                                </button>
                            </Link>
                            <Link href="/dashboard/admin/bookings">
                                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full">
                                    <Calendar className="h-6 w-6 text-purple-600 mb-2" />
                                    <p className="font-medium">Bookings</p>
                                    <p className="text-sm text-gray-600">View and manage bookings</p>
                                </button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Bookings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
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
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Confirmed Bookings</p>
                                <p className="text-2xl font-bold">{confirmedBookings}</p>
                            </div>
                            <Calendar className="h-8 w-8 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Pending Bookings</p>
                                <p className="text-2xl font-bold">{pendingBookings}</p>
                            </div>
                            <Clock className="h-8 w-8 opacity-80" />
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