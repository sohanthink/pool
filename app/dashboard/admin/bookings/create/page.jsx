"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Calendar as CalendarIcon,
    ArrowLeft,
    User,
    Phone,
    Building2,
    Clock,
    CheckCircle,
    AlertCircle,
    Mail
} from "lucide-react"
import Link from 'next/link'
import { useSession } from "next-auth/react"

const CreateBookingPage = () => {
    const { data: session, status } = useSession();
    const [pools, setPools] = useState([])
    const [selectedPool, setSelectedPool] = useState("")
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedTime, setSelectedTime] = useState("")
    const [duration, setDuration] = useState("2")
    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        guests: "",
        notes: ""
    })
    const [isBooking, setIsBooking] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [error, setError] = useState("")

    // Availability states
    const [availableSlots, setAvailableSlots] = useState([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [errorSlots, setErrorSlots] = useState('')

    // Fetch pools for this admin
    useEffect(() => {
        async function fetchPools() {
            if (!session?.user?.email) return;

            try {
                const res = await fetch(`/api/pools?ownerEmail=${encodeURIComponent(session.user.email)}`)
                if (!res.ok) throw new Error('Failed to fetch pools')
                const data = await res.json()
                setPools(data)
            } catch (err) {
                setError('Failed to load pools')
            }
        }
        fetchPools()
    }, [session?.user?.email])

    // Fetch available slots when date changes
    useEffect(() => {
        if (!selectedDate || !selectedPool) return;

        async function fetchSlots() {
            setLoadingSlots(true);
            setErrorSlots('');
            try {
                const dateStr = selectedDate.toISOString().split('T')[0];
                const res = await fetch(`/api/pools/${selectedPool}/availability?date=${dateStr}`);
                if (!res.ok) throw new Error('Failed to fetch availability');
                const data = await res.json();
                setAvailableSlots(data.availableSlots);
            } catch (err) {
                setErrorSlots('Failed to load available slots');
                setAvailableSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        }
        fetchSlots();
    }, [selectedPool, selectedDate]);

    // Get selected pool data
    const poolData = pools.find(pool => pool._id === selectedPool)

    // Calculate total price
    const calculatePrice = () => {
        if (!poolData) return 0;
        let hourlyRate = 0;
        if (typeof poolData.price === 'string') {
            hourlyRate = parseInt(poolData.price.replace('$', ''));
        } else if (typeof poolData.price === 'number') {
            hourlyRate = poolData.price;
        }
        return hourlyRate * parseInt(duration);
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!selectedPool || !selectedDate || !selectedTime || !formData.customerName || !formData.customerEmail || !formData.customerPhone) {
            setError("Please fill in all required fields")
            return
        }

        setIsBooking(true)
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    poolId: selectedPool,
                    customerName: formData.customerName,
                    customerEmail: formData.customerEmail,
                    customerPhone: formData.customerPhone,
                    date: dateStr,
                    time: selectedTime,
                    duration: parseInt(duration),
                    totalPrice: calculatePrice(),
                    guests: formData.guests,
                    notes: formData.notes,
                    createdBy: "admin",
                })
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to create booking");
                setIsBooking(false);
                return;
            }

            setIsBooking(false);
            setBookingSuccess(true);

            // Reset form
            setSelectedPool("");
            setSelectedDate(null);
            setSelectedTime("");
            setDuration("2");
            setFormData({
                customerName: "",
                customerEmail: "",
                customerPhone: "",
                guests: "",
                notes: ""
            });
        } catch (err) {
            setError("Failed to create booking. Please try again.");
            setIsBooking(false);
        }
    }

    if (status === 'loading' || !session?.user?.email) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>
    }

    if (bookingSuccess) {
        return (
            <div className="pt-6">
                <Card className="w-full max-w-md mx-auto">
                    <CardContent className="p-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Booking Created!</h2>
                        <p className="text-gray-600 mb-6">
                            The booking has been successfully created and added to the system.
                        </p>
                        <div className="space-y-2">
                            <Button
                                onClick={() => setBookingSuccess(false)}
                                className="w-full"
                            >
                                Create Another Booking
                            </Button>
                            <Link href="/dashboard/admin/bookings">
                                <Button variant="outline" className="w-full">
                                    View All Bookings
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin/bookings">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Bookings
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                        <h1 className="text-2xl font-semibold text-gray-800">Create New Booking</h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="text-red-600 text-sm mb-2 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {/* Pool Selection */}
                            <div>
                                <Label className="text-sm font-medium">Select Pool *</Label>
                                <Select value={selectedPool} onValueChange={setSelectedPool}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Choose a pool" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pools.map((pool) => (
                                            <SelectItem key={pool._id} value={pool._id}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{pool.name}</span>
                                                    <span className="text-sm text-gray-500">${pool.price}/hour</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Customer Information */}
                            <div className="space-y-4">
                                <h3 className="font-medium">Customer Information</h3>

                                <div>
                                    <Label htmlFor="customerName">Customer Name *</Label>
                                    <Input
                                        id="customerName"
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        required
                                        className="mt-1"
                                        placeholder="Enter customer's full name"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="customerEmail">Email *</Label>
                                    <Input
                                        id="customerEmail"
                                        type="email"
                                        value={formData.customerEmail}
                                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                        required
                                        className="mt-1"
                                        placeholder="Enter customer's email"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="customerPhone">Phone Number *</Label>
                                    <Input
                                        id="customerPhone"
                                        type="tel"
                                        value={formData.customerPhone}
                                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                        required
                                        className="mt-1"
                                        placeholder="Enter customer's phone number"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="guests">Number of Guests</Label>
                                    <Input
                                        id="guests"
                                        type="number"
                                        min="1"
                                        max={poolData?.capacity || 10}
                                        value={formData.guests}
                                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                                        className="mt-1"
                                        placeholder="Number of guests"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Any special requests or notes..."
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <Label className="text-sm font-medium">Duration (hours)</Label>
                                <Select value={duration} onValueChange={setDuration}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 hour</SelectItem>
                                        <SelectItem value="2">2 hours</SelectItem>
                                        <SelectItem value="3">3 hours</SelectItem>
                                        <SelectItem value="4">4 hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Price Display */}
                            {selectedPool && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Total Price:</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            ${calculatePrice()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={!selectedPool || !selectedDate || !selectedTime || !formData.customerName || !formData.customerEmail || !formData.customerPhone || isBooking}
                            >
                                {isBooking ? "Creating Booking..." : "Create Booking"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Calendar and Time Selection */}
                <div className="space-y-6">
                    {/* Calendar */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Date</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border"
                                disabled={(date) => {
                                    const today = new Date()
                                    today.setHours(0, 0, 0, 0)
                                    return date < today
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Time Selection */}
                    {selectedDate && selectedPool && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Select Time</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingSlots ? (
                                    <div className="text-gray-500 text-center py-4">Loading slots...</div>
                                ) : errorSlots ? (
                                    <div className="text-red-600 text-center py-4 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        {errorSlots}
                                    </div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {availableSlots.map((slot) => (
                                            <Button
                                                key={slot}
                                                variant={selectedTime === slot ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSelectedTime(slot)}
                                                className="justify-start"
                                            >
                                                <Clock className="h-4 w-4 mr-2" />
                                                {slot}
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                        <p className="text-sm text-red-600">No available slots for this date</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Pool Information */}
                    {poolData && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Pool Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pool Name</p>
                                    <p className="text-gray-800">{poolData.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Location</p>
                                    <p className="text-gray-800">{poolData.location}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Capacity</p>
                                    <p className="text-gray-800">{poolData.capacity} people</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Price</p>
                                    <p className="text-gray-800">${poolData.price}/hour</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CreateBookingPage 