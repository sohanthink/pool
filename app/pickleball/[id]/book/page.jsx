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

const BookPickleballPage = () => {
    const params = useParams()
    const courtId = params.id
    const searchParams = useSearchParams()
    const bookingToken = searchParams.get('token')

    const [pickleballData, setPickleballData] = useState(null)
    const [loadingPool, setLoadingPool] = useState(true)
    const [errorPool, setErrorPool] = useState('')
    const [linkExpiry, setLinkExpiry] = useState('')
    const [timeRemaining, setTimeRemaining] = useState('')
    const [isValidBookingLink, setIsValidBookingLink] = useState(true)

    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedTime, setSelectedTime] = useState("")
    const [duration, setDuration] = useState("1")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        players: "",
        notes: ""
    })

    // Availability state
    const [availableSlots, setAvailableSlots] = useState([])
    const [allSlots, setAllSlots] = useState([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [errorSlots, setErrorSlots] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [bookingError, setBookingError] = useState('')
    const [bookingSuccess, setBookingSuccess] = useState(false)

    // Fetch pickleball court details
    useEffect(() => {
        async function fetchPickleball() {
            setLoadingPool(true)
            setErrorPool('')
            try {
                const res = await fetch(`/api/pickleball/${courtId}`)
                if (!res.ok) throw new Error('Failed to fetch pickleball court')
                const data = await res.json()

                // If there's a booking token, validate it
                if (bookingToken) {
                    if (!data.isBookingLinkActive || data.bookingToken !== bookingToken) {
                        setErrorPool('Invalid or inactive booking link')
                        setIsValidBookingLink(false)
                        setLoadingPool(false)
                        return
                    }

                    // Check if booking link has expired
                    if (data.bookingLinkExpiry && new Date() > new Date(data.bookingLinkExpiry)) {
                        setErrorPool('This booking link has expired')
                        setIsValidBookingLink(false)
                        setLoadingPool(false)
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

                setPickleballData(data)
            } catch (err) {
                setErrorPool('Failed to load pickleball court details')
                setIsValidBookingLink(false)
            } finally {
                setLoadingPool(false)
            }
        }

        fetchPickleball()
    }, [courtId, bookingToken])

    // Fetch available slots when date is selected
    useEffect(() => {
        if (selectedDate && pickleballData) {
            fetchAvailableSlots()

            // If selected date is today, set up interval to refresh slots every minute
            const selectedDateObj = new Date(selectedDate)
            const isToday = selectedDateObj.toDateString() === new Date().toDateString()

            let interval = null
            if (isToday) {
                interval = setInterval(fetchAvailableSlots, 60000) // Refresh every minute
            }

            return () => {
                if (interval) clearInterval(interval)
            }
        }
    }, [selectedDate, pickleballData, bookingToken, pickleballData?.bookingLinkExpiry])

    const fetchAvailableSlots = async () => {
        try {
            setLoadingSlots(true)
            // Use local date instead of UTC to avoid timezone issues
            const year = selectedDate.getFullYear()
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
            const day = String(selectedDate.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`
            const res = await fetch(`/api/pickleball/${courtId}/availability?date=${dateStr}`)

            if (res.ok) {
                const data = await res.json()
                const slots = data.availableSlots || data // Handle different response formats

                // Filter slots based on current time and booking link expiry
                let filteredSlots = slots
                const now = new Date()
                const selectedDateObj = new Date(selectedDate)
                const isToday = selectedDateObj.toDateString() === now.toDateString()

                // If booking for today, filter out past time slots
                if (isToday) {
                    filteredSlots = slots.filter(slot => {
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
                if (bookingToken && pickleballData?.bookingLinkExpiry) {
                    const linkExpiry = new Date(pickleballData.bookingLinkExpiry)

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
                setAllSlots(slots)
            } else {
                setErrorSlots('Failed to load available slots')
                setAvailableSlots([])
                setAllSlots([])
            }
        } catch (err) {
            setErrorSlots('Failed to load available slots')
            setAvailableSlots([])
            setAllSlots([])
        } finally {
            setLoadingSlots(false)
        }
    }

    const calculatePrice = () => {
        if (!pickleballData) return 0

        // If booking through a booking link, use the booking link price
        if (bookingToken && pickleballData.bookingPrice !== undefined) {
            return pickleballData.bookingPrice
        }

        return pickleballData.price || 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedDate || !selectedTime) {
            setBookingError('Please select date and time')
            return
        }

        setSubmitting(true)
        setBookingError('')

        try {
            // Use local date instead of UTC to avoid timezone issues
            const year = selectedDate.getFullYear()
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
            const day = String(selectedDate.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`

            const bookingData = {
                pickleballCourtId: courtId,
                date: dateStr,
                time: selectedTime,
                duration: parseInt(duration),
                guests: parseInt(formData.players) || 1,
                customerName: formData.name,
                customerEmail: formData.email,
                customerPhone: formData.phone,
                notes: formData.notes,
                price: calculatePrice(),
                totalPrice: calculatePrice() * parseInt(duration),
                fromBookingLink: !!bookingToken
            }

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            })

            if (res.ok) {
                const result = await res.json()
                setBookingSuccess(true)
                // Reset form
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    players: "",
                    notes: ""
                })
                setSelectedDate(null)
                setSelectedTime("")
            } else {
                const error = await res.json()
                setBookingError(error.message || 'Failed to create booking')
            }
        } catch (err) {
            setBookingError('Failed to create booking')
        } finally {
            setSubmitting(false)
        }
    }

    if (loadingPool) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading pickleball court details...</p>
                </div>
            </div>
        )
    }

    if (bookingSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
                    <p className="text-gray-600 mb-6">
                        Your pickleball court booking has been successfully created.
                        You will receive a confirmation email shortly with all the details.
                    </p>
                    <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg border">
                            <p className="text-sm text-gray-500">Court</p>
                            <p className="font-semibold">{pickleballData?.name}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <p className="text-sm text-gray-500">Date & Time</p>
                            <p className="font-semibold">
                                {selectedDate?.toLocaleDateString()} at {selectedTime}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-semibold">{duration} hour{duration !== "1" ? "s" : ""}</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => window.location.reload()}
                        className="mt-6 w-full"
                    >
                        Make Another Booking
                    </Button>
                </div>
            </div>
        )
    }

    if (errorPool || !isValidBookingLink) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Available</h1>
                    <p className="text-gray-600 mb-4">{errorPool}</p>
                    <Button onClick={() => window.history.back()}>Go Back</Button>
                </div>
            </div>
        )
    }

    if (!pickleballData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Pickleball Court Not Found</h1>
                    <p className="text-gray-600">The requested pickleball court could not be found.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Court Information */}
                    <div className="space-y-6">
                        {/* Court Header */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <Target className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">{pickleballData.name}</h1>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    Active
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        <span>{pickleballData.location}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Star className="w-4 h-4 mr-2" />
                                        <span>{pickleballData.rating || 0} stars</span>
                                    </div>
                                    <p className="text-gray-600">{pickleballData.description}</p>

                                    {/* Booking Link Info */}
                                    {bookingToken && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                            <div className="flex items-center text-orange-800">
                                                <Clock className="w-4 h-4 mr-2" />
                                                <span className="font-medium">{timeRemaining}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
                                        <p className="text-2xl font-bold text-green-600">
                                            ${calculatePrice()} per hour
                                        </p>
                                        {bookingToken && pickleballData.bookingPrice !== undefined && (
                                            <Badge variant="outline" className="mt-2 border-orange-200 text-orange-800">
                                                Special booking price
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Court Photos */}
                        {pickleballData.images && pickleballData.images.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Court Photos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {pickleballData.images.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={image}
                                                    alt={`Court photo ${index + 1}`}
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Court Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Court Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center text-gray-600">
                                    <Target className="w-4 h-4 mr-2" />
                                    <span>Surface: {pickleballData.surface}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span>Type: {pickleballData.type}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Amenities */}
                        {pickleballData.amenities && pickleballData.amenities.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Amenities</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {pickleballData.amenities.map((amenity, index) => (
                                            <Badge key={index} variant="outline">
                                                {amenity}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Booking Form */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-2" />
                                    Book This Court
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
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
                                                if (bookingToken && pickleballData?.bookingLinkExpiry) {
                                                    const linkExpiry = new Date(pickleballData.bookingLinkExpiry)
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
                                                <div className="flex items-center justify-center py-4">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                    <span className="ml-2 text-gray-600">Loading available times...</span>
                                                </div>
                                            ) : errorSlots ? (
                                                <p className="text-red-600 text-sm mt-2">{errorSlots}</p>
                                            ) : availableSlots.length === 0 ? (
                                                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    No available slots for this date
                                                </p>
                                            ) : (
                                                <Select value={selectedTime} onValueChange={setSelectedTime}>
                                                    <SelectTrigger className="mt-2">
                                                        <SelectValue placeholder="Select a time" />
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

                                    {/* Number of Players */}
                                    <div>
                                        <Label className="text-sm font-medium">Number of Players</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="4"
                                            value={formData.players}
                                            onChange={(e) => setFormData({ ...formData, players: e.target.value })}
                                            className="mt-2"
                                            placeholder="Enter number of players"
                                        />
                                    </div>

                                    {/* Your Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Your Information</h3>

                                        <div>
                                            <Label className="text-sm font-medium">Full Name</Label>
                                            <Input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="mt-2"
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Email</Label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="mt-2"
                                                placeholder="Enter your email"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Phone</Label>
                                            <Input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="mt-2"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Notes (Optional)</Label>
                                            <Textarea
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                className="mt-2"
                                                placeholder="Any special requests or notes"
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    {/* Total Price */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-medium">Total Price:</span>
                                            <span className="text-2xl font-bold text-green-600">
                                                ${calculatePrice() * parseInt(duration)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={submitting || !selectedDate || !selectedTime}
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Creating Booking...
                                            </>
                                        ) : (
                                            'Book Now'
                                        )}
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

export default BookPickleballPage