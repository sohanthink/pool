"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Calendar, DollarSign, TrendingUp, Activity, Clock, Home } from "lucide-react"

export default function AdminDashboardPage() {
    // Mock dashboard data
    const dashboardStats = [
        {
            title: "Total Pools",
            value: "24",
            iconType: "Building2",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            change: "+12%",
            changeType: "positive"
        },
        {
            title: "Active Users",
            value: "156",
            iconType: "Users",
            color: "text-green-600",
            bgColor: "bg-green-50",
            change: "+8%",
            changeType: "positive"
        },
        {
            title: "Appointments",
            value: "89",
            iconType: "Calendar",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            change: "+23%",
            changeType: "positive"
        },
        {
            title: "Revenue",
            value: "$12,450",
            iconType: "DollarSign",
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            change: "+18%",
            changeType: "positive"
        },
        {
            title: "Pending Requests",
            value: "7",
            iconType: "Clock",
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            change: "-3%",
            changeType: "negative"
        },
        {
            title: "Pool Bookings",
            value: "45",
            iconType: "Home",
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            change: "+15%",
            changeType: "positive"
        }
    ]

    const recentActivities = [
        { id: 1, action: "New pool added", pool: "Dream Valley Pool", time: "2 hours ago" },
        { id: 2, action: "Booking confirmed", pool: "Sunset Pool", time: "4 hours ago" },
        { id: 3, action: "Payment received", pool: "Ocean View Pool", time: "6 hours ago" },
        { id: 4, action: "User registered", pool: "New user: John Doe", time: "8 hours ago" }
    ]

    const renderIcon = (iconType) => {
        switch (iconType) {
            case "Building2":
                return <Building2 className="h-6 w-6" />
            case "Users":
                return <Users className="h-6 w-6" />
            case "Calendar":
                return <Calendar className="h-6 w-6" />
            case "DollarSign":
                return <DollarSign className="h-6 w-6" />
            case "Clock":
                return <Clock className="h-6 w-6" />
            case "Home":
                return <Home className="h-6 w-6" />
            default:
                return <Building2 className="h-6 w-6" />
        }
    }

    return (
        <div className="pt-6 space-y-6">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome back, Admin!</h1>
                <p className="text-gray-600 mt-2">Here's what's happening with your pools today.</p>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardStats.map((stat, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className={`h-4 w-4 mr-1 ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                                            }`} />
                                        <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {stat.change}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-1">from last month</span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                    <div className={stat.color}>
                                        {renderIcon(stat.iconType)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts and Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                                <Building2 className="h-6 w-6 text-blue-600 mb-2" />
                                <p className="font-medium">Add Pool</p>
                                <p className="text-sm text-gray-600">Create new pool listing</p>
                            </button>
                            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                                <Users className="h-6 w-6 text-green-600 mb-2" />
                                <p className="font-medium">Manage Users</p>
                                <p className="text-sm text-gray-600">View all users</p>
                            </button>
                            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                                <Calendar className="h-6 w-6 text-purple-600 mb-2" />
                                <p className="font-medium">Bookings</p>
                                <p className="text-sm text-gray-600">View appointments</p>
                            </button>
                            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                                <DollarSign className="h-6 w-6 text-orange-600 mb-2" />
                                <p className="font-medium">Revenue</p>
                                <p className="text-sm text-gray-600">View earnings</p>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-800">{activity.action}</p>
                                        <p className="text-sm text-gray-600">{activity.pool}</p>
                                    </div>
                                    <span className="text-sm text-gray-500">{activity.time}</span>
                                </div>
                            ))}
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
                                <p className="text-2xl font-bold">$45,231</p>
                            </div>
                            <DollarSign className="h-8 w-8 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Active Bookings</p>
                                <p className="text-2xl font-bold">23</p>
                            </div>
                            <Calendar className="h-8 w-8 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">New Users</p>
                                <p className="text-2xl font-bold">12</p>
                            </div>
                            <Users className="h-8 w-8 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Avg. Rating</p>
                                <p className="text-2xl font-bold">4.8</p>
                            </div>
                            <TrendingUp className="h-8 w-8 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 