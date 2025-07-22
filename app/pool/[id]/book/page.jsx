"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Building2,
    MapPin,
    Users,
    DollarSign,
    Star,
    Calendar as CalendarIcon,
    Clock,
    User,
    Phone,
    Mail,
    CheckCircle,
    AlertCircle
} from "lucide-react"

const BookingPage = ({ params }) => {
    // Fix params usage for Next.js 15+
    let poolId
    try {
        // If params is a promise (Next.js 15+), unwrap it
        poolId = typeof params.then === 'function' ? React.use(params).id : params.id
    } catch {
        poolId = params.id
    }
    const [poolData, setPoolData] = useState(null)
    const [loadingPool, setLoadingPool] = useState(true)
    const [errorPool, setErrorPool] = useState('')

    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedTime, setSelectedTime] = useState("")
    const [duration, setDuration] = useState("2")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        guests: "",
        notes: ""
    })
    const [isBooking, setIsBooking] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [bookingError, setBookingError] = useState("")

    // Availability state
    const [availableSlots, setAvailableSlots] = useState([])
    const [allSlots, setAllSlots] = useState([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [errorSlots, setErrorSlots] = useState('')

    // Fetch pool details
    useEffect(() => {
        async function fetchPool() {
            setLoadingPool(true)
            setErrorPool('')
            try {
                const res = await fetch(`/api/pools/${poolId}`)
                if (!res.ok) throw new Error('Failed to fetch pool')
                const data = await res.json()
                setPoolData(data)
            } catch (err) {
                setErrorPool('Failed to load pool details')
            } finally {
                setLoadingPool(false)
            }
        }
        fetchPool()
    }, [poolId])

    // Fetch available slots when date changes
    useEffect(() => {
        if (!selectedDate) return
        async function fetchSlots() {
            setLoadingSlots(true)
            setErrorSlots('')
            try {
                const dateStr = selectedDate.toISOString().split('T')[0]
                const res = await fetch(`/api/pools/${poolId}/availability?date=${dateStr}`)
                if (!res.ok) throw new Error('Failed to fetch availability')
                const data = await res.json()
                setAvailableSlots(data.availableSlots)
                setAllSlots(data.allSlots)
            } catch (err) {
                setErrorSlots('Failed to load available slots')
                setAvailableSlots([])
                setAllSlots([])
            } finally {
                setLoadingSlots(false)
            }
        }
        fetchSlots()
    }, [poolId, selectedDate])

    // Fix calculatePrice to handle both string and number price types
    const calculatePrice = () => {
        if (!poolData) return 0
        let hourlyRate = 0
        if (typeof poolData.price === 'string') {
            hourlyRate = parseInt(poolData.price.replace('$', ''))
        } else if (typeof poolData.price === 'number') {
            hourlyRate = poolData.price
        }
        return hourlyRate * parseInt(duration)
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        setBookingError("")
        if (!selectedDate || !selectedTime) {
            setBookingError("Please select a date and time")
            return
        }
        if (!formData.name || !formData.email || !formData.phone) {
            setBookingError("Please fill in all required fields")
            return
        }
        setIsBooking(true)
        try {
            const dateStr = selectedDate.toISOString().split('T')[0]
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    poolId,
                    customerName: formData.name,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    date: dateStr,
                    time: selectedTime,
                    duration: parseInt(duration),
                    totalPrice: calculatePrice(),
                    guests: formData.guests,
                    notes: formData.notes,
                })
            })
            if (!res.ok) {
                const data = await res.json()
                setBookingError(data.error || "Failed to create booking")
                setIsBooking(false)
                return
            }
            setIsBooking(false)
            setBookingSuccess(true)
            // Reset form
            setSelectedDate(null)
            setSelectedTime("")
            setDuration("2")
            setFormData({
                name: "",
                email: "",
                phone: "",
                guests: "",
                notes: ""
            })
        } catch (err) {
            setBookingError("Failed to create booking. Please try again.")
            setIsBooking(false)
        }
    }

    if (loadingPool) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading pool details...</div>
    if (errorPool) return <div className="min-h-screen flex items-center justify-center text-red-600">{errorPool}</div>
    if (!poolData) return null

    if (bookingSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-600 mb-6">
                            Your pool booking has been successfully confirmed. You will receive a confirmation email shortly.
                        </p>
                        <Button
                            onClick={() => setBookingSuccess(false)}
                            className="w-full"
                        >
                            Book Another Time
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Pool Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Pool Header */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{poolData.name}</h1>
                                        <div className="flex items-center gap-4 text-gray-600 mb-4">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{poolData.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                <span>{poolData.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{poolData.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600">{poolData.price}</div>
                                        <div className="text-sm text-gray-600">per hour</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pool Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pool Photos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    {poolData.images.map((image, index) => (
                                        <div key={index} className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg relative">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-white text-center">
                                                    <Building2 className="h-8 w-8 mx-auto mb-1 opacity-80" />
                                                    <p className="text-xs opacity-80">Photo {index + 1}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                                    {poolData.amenities.map((amenity, index) => (
                                        <Badge key={index} variant="outline">
                                            {amenity}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Booking Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5" />
                                    Book This Pool
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {bookingError && (
                                        <div className="text-red-600 text-sm mb-2">{bookingError}</div>
                                    )}
                                    {/* Date Selection */}
                                    <div>
                                        <Label className="text-sm font-medium">Select Date</Label>
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            className="rounded-md border mt-2"
                                            disabled={(date) => {
                                                const today = new Date()
                                                today.setHours(0, 0, 0, 0)
                                                return date < today
                                            }}
                                        />
                                    </div>

                                    {/* Time Selection */}
                                    {selectedDate && (
                                        <div>
                                            <Label className="text-sm font-medium">Select Time</Label>
                                            {loadingSlots ? (
                                                <div className="text-gray-500 mt-2">Loading slots...</div>
                                            ) : errorSlots ? (
                                                <div className="text-red-600 mt-2">{errorSlots}</div>
                                            ) : (
                                                <Select value={selectedTime} onValueChange={setSelectedTime}>
                                                    <SelectTrigger className="mt-2">
                                                        <SelectValue placeholder="Choose a time slot" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableSlots.map((slot) => (
                                                            <SelectItem key={slot} value={slot}>
                                                                {slot}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            {selectedDate && !loadingSlots && availableSlots.length === 0 && (
                                                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    No available slots for this date
                                                </p>
                                            )}
                                        </div>
                                    )}

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
                                    {selectedDate && selectedTime && (
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Total Price:</span>
                                                <span className="text-xl font-bold text-blue-600">
                                                    ${calculatePrice()}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contact Information */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Contact Information</h3>

                                        <div>
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="guests">Number of Guests</Label>
                                            <Input
                                                id="guests"
                                                type="number"
                                                min="1"
                                                max={poolData.capacity}
                                                value={formData.guests}
                                                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="notes">Special Requests</Label>
                                            <Textarea
                                                id="notes"
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                placeholder="Any special requests or notes..."
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={!selectedDate || !selectedTime || isBooking}
                                    >
                                        {isBooking ? "Processing..." : "Confirm Booking"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingPage 