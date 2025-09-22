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
    Target,
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
import { useSearchParams, useParams } from 'next/navigation'

const TennisBookingPage = () => {
    const params = useParams()
    const courtId = params.id
    const searchParams = useSearchParams()
    const bookingToken = searchParams.get('token')

    const [courtData, setCourtData] = useState(null)
    const [loadingCourt, setLoadingCourt] = useState(true)
    const [errorCourt, setErrorCourt] = useState('')
    const [linkExpiry, setLinkExpiry] = useState('')
    const [timeRemaining, setTimeRemaining] = useState('')
    const [isValidBookingLink, setIsValidBookingLink] = useState(true)

    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedTime, setSelectedTime] = useState("")
    const [duration, setDuration] = useState("2")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        players: "",
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

    // Fetch court details
    useEffect(() => {
        async function fetchCourt() {
            setLoadingCourt(true)
            setErrorCourt('')
            try {
                const res = await fetch(`/api/tennis/${courtId}`)
                if (!res.ok) throw new Error('Failed to fetch tennis court')
                const data = await res.json()

                // If there's a booking token, validate it
                if (bookingToken) {
                    if (!data.isBookingLinkActive || data.bookingToken !== bookingToken) {
                        setErrorCourt('Invalid or inactive booking link')
                        setIsValidBookingLink(false)
                        setLoadingCourt(false)
                        return
                    }

                    // Check if booking link has expired
                    if (data.bookingLinkExpiry && new Date() > new Date(data.bookingLinkExpiry)) {
                        setErrorCourt('This booking link has expired')
                        setIsValidBookingLink(false)
                        setLoadingCourt(false)
                        return
                    }

                    // Set booking link expiry information
                    if (data.bookingLinkExpiry) {
                        setLinkExpiry(new Date(data.bookingLinkExpiry).toLocaleString())

                        // Calculate time remaining
                        const now = new Date()
                        const expiry = new Date(data.bookingLinkExpiry)
                        const diff = expiry - now

                        if (diff > 0) {
                            const hours = Math.floor(diff / (1000 * 60 * 60))
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                            setTimeRemaining(`${hours}h ${minutes}m remaining`)
                        } else {
                            setTimeRemaining('Expired')
                        }
                    }
                }

                setCourtData(data)
            } catch (err) {
                setErrorCourt('Failed to load tennis court details')
            } finally {
                setLoadingCourt(false)
            }
        }
        fetchCourt()
    }, [courtId, bookingToken])

    // Update time remaining countdown
    useEffect(() => {
        if (!courtData?.bookingLinkExpiry) return

        const updateTimeRemaining = () => {
            const now = new Date()
            const expiry = new Date(courtData.bookingLinkExpiry)
            const diff = expiry - now

            if (diff <= 0) {
                setTimeRemaining('Expired')
                return
            }

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            setTimeRemaining(`${hours}h ${minutes}m remaining`)
        }

        updateTimeRemaining()
        const interval = setInterval(updateTimeRemaining, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [courtData?.bookingLinkExpiry])

    // Fetch available slots when date changes
    useEffect(() => {
        if (!selectedDate) return
        async function fetchSlots() {
            setLoadingSlots(true)
            setErrorSlots('')
            try {
                // Use local date instead of UTC to avoid timezone issues
                const year = selectedDate.getFullYear()
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
                const day = String(selectedDate.getDate()).padStart(2, '0')
                const dateStr = `${year}-${month}-${day}`
                const res = await fetch(`/api/tennis/${courtId}/availability?date=${dateStr}`)
                if (!res.ok) throw new Error('Failed to fetch availability')
                const data = await res.json()

                // Filter slots based on current time and booking link expiry
                let filteredSlots = data.availableSlots
                const now = new Date()
                const selectedDateObj = new Date(selectedDate)
                const isToday = selectedDateObj.toDateString() === now.toDateString()

                // If booking for today, filter out past time slots
                if (isToday) {
                    filteredSlots = data.availableSlots.filter(slot => {
                        // Convert 12-hour format to 24-hour format for Date parsing
                        const [time, period] = slot.split(' ')
                        const [hours, minutes] = time.split(':')
                        let hour24 = parseInt(hours)
                        if (period === 'PM' && hour24 !== 12) hour24 += 12
                        if (period === 'AM' && hour24 === 12) hour24 = 0

                        const slotTime = new Date(`${dateStr}T${hour24.toString().padStart(2, '0')}:${minutes}:00`)
                        return slotTime >= now // Only show slots at or after current time
                    })
                }

                // If booking through a booking link, also filter based on link expiry
                if (bookingToken && courtData?.bookingLinkExpiry) {
                    const linkExpiry = new Date(courtData.bookingLinkExpiry)

                    // If the selected date is the same as link expiry date, filter times
                    if (selectedDateObj.toDateString() === linkExpiry.toDateString()) {
                        filteredSlots = filteredSlots.filter(slot => {
                            // Convert 12-hour format to 24-hour format for Date parsing
                            const [time, period] = slot.split(' ')
                            const [hours, minutes] = time.split(':')
                            let hour24 = parseInt(hours)
                            if (period === 'PM' && hour24 !== 12) hour24 += 12
                            if (period === 'AM' && hour24 === 12) hour24 = 0

                            const slotTime = new Date(`${dateStr}T${hour24.toString().padStart(2, '0')}:${minutes}:00`)
                            return slotTime <= linkExpiry
                        })
                    }
                    // If selected date is after link expiry, show no slots
                    else if (selectedDateObj > linkExpiry) {
                        filteredSlots = []
                    }
                }

                setAvailableSlots(filteredSlots)
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

        // If selected date is today, set up interval to refresh slots every minute
        const selectedDateObj = new Date(selectedDate)
        const isToday = selectedDateObj.toDateString() === new Date().toDateString()

        let interval = null
        if (isToday) {
            interval = setInterval(fetchSlots, 60000) // Refresh every minute
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [courtId, selectedDate, bookingToken, courtData?.bookingLinkExpiry])

    // Calculate price - prioritize bookingPrice if available, otherwise use regular price
    const calculatePrice = () => {
        if (!courtData) return 0
        let hourlyRate = 0

        // Use bookingPrice if available (from booking link), otherwise use regular price
        if (courtData.bookingPrice !== undefined && courtData.bookingPrice > 0) {
            hourlyRate = courtData.bookingPrice
        } else {
            if (typeof courtData.price === 'string') {
                hourlyRate = parseInt(courtData.price.replace('$', ''))
            } else if (typeof courtData.price === 'number') {
                hourlyRate = courtData.price
            }
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
            // Use local date instead of UTC to avoid timezone issues
            const year = selectedDate.getFullYear()
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
            const day = String(selectedDate.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tennisCourtId: courtId,
                    customerName: formData.name,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    date: dateStr,
                    time: selectedTime,
                    duration: parseInt(duration),
                    price: courtData.bookingPrice !== undefined ? courtData.bookingPrice : courtData.price,
                    totalPrice: calculatePrice(),
                    guests: formData.players,
                    notes: formData.notes,
                    fromBookingLink: !!bookingToken, // True if booking through a booking link
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
                players: "",
                notes: ""
            })
        } catch (err) {
            setBookingError("Failed to create booking. Please try again.")
            setIsBooking(false)
        }
    }

    if (loadingCourt) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading tennis court details...</div>
    if (errorCourt) return <div className="min-h-screen flex items-center justify-center text-red-600">{errorCourt}</div>
    if (!courtData) return null

    if (bookingSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-600 mb-6">
                            Your tennis court booking has been successfully confirmed. You will receive a confirmation email shortly.
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
                    {/* Court Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Court Header */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{courtData.name}</h1>
                                        <div className="flex items-center gap-4 text-gray-600 mb-4">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{courtData.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                <span>{courtData.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{courtData.description}</p>
                                        {timeRemaining && (
                                            <div className="mt-4 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-orange-500" />
                                                <span className="text-sm text-orange-600 font-medium">
                                                    {timeRemaining}
                                                </span>
                                                {linkExpiry && (
                                                    <span className="text-xs text-gray-500">
                                                        (Expires: {linkExpiry})
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">
                                            ${courtData.bookingPrice !== undefined ? courtData.bookingPrice : courtData.price}
                                        </div>
                                        <div className="text-sm text-gray-600">per hour</div>
                                        {courtData.bookingPrice !== undefined && courtData.bookingPrice > 0 && (
                                            <div className="text-xs text-blue-600 font-medium">Special booking price</div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Court Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Court Photos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    {courtData.images && courtData.images.length > 0 ? (
                                        courtData.images.map((image, index) => (
                                            <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                                <img
                                                    src={image}
                                                    alt={`Court photo ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-3 text-sm text-gray-500">No images available.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Court Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Court Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Surface: {courtData.surface}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Type: {courtData.type}</span>
                                    </div>
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
                                    {courtData.amenities.map((amenity, index) => (
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
                                    Book This Court
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

                                                // Disable past dates
                                                if (date < today) return true

                                                // If booking through a booking link, disable dates after link expiry
                                                if (bookingToken && courtData?.bookingLinkExpiry) {
                                                    const linkExpiry = new Date(courtData.bookingLinkExpiry)
                                                    linkExpiry.setHours(23, 59, 59, 999) // End of expiry day
                                                    return date > linkExpiry
                                                }

                                                return false
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
                                            {selectedDate && !loadingSlots && availableSlots.length > 0 &&
                                                new Date(selectedDate).toDateString() === new Date().toDateString() && (
                                                    <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        Showing only current and future time slots
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
                                                <SelectItem value="5">5 hours</SelectItem>
                                                <SelectItem value="6">6 hours</SelectItem>
                                                <SelectItem value="7">7 hours</SelectItem>
                                                <SelectItem value="8">8 hours</SelectItem>
                                                <SelectItem value="9">9 hours</SelectItem>
                                                <SelectItem value="10">10 hours</SelectItem>
                                                <SelectItem value="11">11 hours</SelectItem>
                                                <SelectItem value="12">12 hours</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Price Display */}
                                    {selectedDate && selectedTime && (
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Total Price:</span>
                                                <span className="text-xl font-bold text-green-600">
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
                                            <Label htmlFor="players">Number of Players</Label>
                                            <Input
                                                id="players"
                                                type="number"
                                                min="1"
                                                max="4"
                                                value={formData.players}
                                                onChange={(e) => setFormData({ ...formData, players: e.target.value })}
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

export default TennisBookingPage
