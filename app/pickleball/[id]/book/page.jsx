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

    const [availableSlots, setAvailableSlots] = useState([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [bookingError, setBookingError] = useState('')

    // Fetch pickleball court data
    useEffect(() => {
        const fetchPickleballData = async () => {
            try {
                setLoadingPool(true)
                setErrorPool('')

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

                console.log('Pickleball data received:', {
                    bookingLinkExpiry: data.bookingLinkExpiry,
                    isBookingLinkActive: data.isBookingLinkActive,
                    bookingToken: data.bookingToken,
                    bookingPrice: data.bookingPrice
                })
                setPickleballData(data)
            } catch (err) {
                setErrorPool('Failed to load pickleball court details')
                setIsValidBookingLink(false)
            } finally {
                setLoadingPool(false)
            }
        }

        fetchPickleballData()
    }, [courtId, bookingToken])

    // Update time remaining countdown
    useEffect(() => {
        if (!pickleballData?.bookingLinkExpiry) return

        const updateTimeRemaining = () => {
            const now = new Date()
            const expiry = new Date(pickleballData.bookingLinkExpiry)
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
    }, [pickleballData?.bookingLinkExpiry])

    // Fetch available slots when date is selected
    useEffect(() => {
        if (selectedDate && pickleballData) {
            fetchAvailableSlots()
        }
    }, [selectedDate, pickleballData, bookingToken, pickleballData?.bookingLinkExpiry])

    const fetchAvailableSlots = async () => {
        try {
            setLoadingSlots(true)
            const dateStr = selectedDate.toISOString().split('T')[0]
            const res = await fetch(`/api/pickleball/${courtId}/availability?date=${dateStr}`)

            if (res.ok) {
                const data = await res.json()
                const slots = data.availableSlots || data // Handle different response formats

                // If booking through a booking link, filter slots based on link expiry
                let filteredSlots = slots
                if (bookingToken && pickleballData?.bookingLinkExpiry) {
                    const linkExpiry = new Date(pickleballData.bookingLinkExpiry)
                    const selectedDateObj = new Date(selectedDate)

                    // If the selected date is the same as link expiry date, filter times
                    if (selectedDateObj.toDateString() === linkExpiry.toDateString()) {
                        filteredSlots = slots.filter(slot => {
                            const slotTime = new Date(`${dateStr}T${slot}`)
                            return slotTime <= linkExpiry
                        })
                    }
                    // If selected date is after link expiry, show no slots
                    else if (selectedDateObj > linkExpiry) {
                        filteredSlots = []
                    }
                }

                setAvailableSlots(filteredSlots)
            } else {
                setAvailableSlots([])
            }
        } catch (err) {
            console.error('Error fetching slots:', err)
            setAvailableSlots([])
        } finally {
            setLoadingSlots(false)
        }
    }

    const calculatePrice = () => {
        if (!pickleballData) return 0
        // Prioritize booking price if available (from booking link)
        const price = pickleballData.bookingPrice !== undefined ? pickleballData.bookingPrice : pickleballData.price
        return price * parseInt(duration)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setBookingError('')

        try {
            const bookingPayload = {
                pickleballCourtId: courtId,
                customerName: formData.name,
                customerEmail: formData.email,
                customerPhone: formData.phone,
                date: selectedDate.toISOString().split('T')[0],
                time: selectedTime,
                duration: parseInt(duration),
                players: parseInt(formData.players),
                notes: formData.notes,
                price: pickleballData.bookingPrice !== undefined ? pickleballData.bookingPrice : pickleballData.price,
                totalPrice: calculatePrice(),
                fromBookingLink: !!bookingToken
            }

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingPayload)
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to create booking')
            }

            const booking = await res.json()
            alert('Booking created successfully!')
            // Redirect to a success page or reset form
            window.location.href = '/'
        } catch (err) {
            setBookingError(err.message || 'Failed to create booking')
        } finally {
            setSubmitting(false)
        }
    }

    if (loadingPool) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading pickleball court...</p>
                </div>
            </div>
        )
    }

    if (errorPool || !pickleballData || !isValidBookingLink) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Available</h1>
                    <p className="text-gray-600 mb-4">{errorPool}</p>
                    <Button onClick={() => window.location.href = '/'}>
                        Go Back Home
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Court Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Court Header */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Target className="h-6 w-6 text-green-600" />
                                            <h1 className="text-2xl font-bold text-gray-900">{pickleballData.name}</h1>
                                            <Badge variant="outline" className="text-green-700 border-green-300">
                                                {pickleballData.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-600 mb-4">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{pickleballData.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                <span>{pickleballData.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{pickleballData.description}</p>
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
                                            ${pickleballData.bookingPrice !== undefined ? pickleballData.bookingPrice : pickleballData.price}
                                        </div>
                                        <div className="text-sm text-gray-600">per hour</div>
                                        {pickleballData.bookingPrice !== undefined && pickleballData.bookingPrice !== pickleballData.price && (
                                            <div className="text-xs text-orange-600 mt-1">
                                                Special booking price
                                            </div>
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
                                    {pickleballData.images && pickleballData.images.length > 0 ? (
                                        pickleballData.images.map((image, index) => (
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
                                        <span className="text-sm text-gray-600">Surface: {pickleballData.surface}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Type: {pickleballData.type}</span>
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
                                    {pickleballData.amenities.map((amenity, index) => (
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
                                                if (bookingToken && pickleballData?.bookingLinkExpiry) {
                                                    const linkExpiry = new Date(pickleballData.bookingLinkExpiry)
                                                    const linkExpiryDate = new Date(linkExpiry.getFullYear(), linkExpiry.getMonth(), linkExpiry.getDate())
                                                    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

                                                    console.log('Calendar check:', {
                                                        date: date.toDateString(),
                                                        linkExpiry: linkExpiry.toDateString(),
                                                        linkExpiryDate: linkExpiryDate.toDateString(),
                                                        checkDate: checkDate.toDateString(),
                                                        shouldDisable: checkDate > linkExpiryDate
                                                    })
                                                    return checkDate > linkExpiryDate
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
                                                <div className="text-sm text-gray-500 mt-2">Loading available times...</div>
                                            ) : availableSlots.length > 0 ? (
                                                <Select value={selectedTime} onValueChange={setSelectedTime}>
                                                    <SelectTrigger className="mt-2">
                                                        <SelectValue placeholder="Choose a time" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableSlots.map((slot) => (
                                                            <SelectItem key={slot} value={slot}>
                                                                {slot}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="text-sm text-gray-500 mt-2">No available times for this date</div>
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

                                    {/* Player Count */}
                                    <div>
                                        <Label htmlFor="players" className="text-sm font-medium">Number of Players</Label>
                                        <Input
                                            id="players"
                                            type="number"
                                            min="2"
                                            max="8"
                                            value={formData.players}
                                            onChange={(e) => setFormData(prev => ({ ...prev, players: e.target.value }))}
                                            className="mt-2"
                                            required
                                        />
                                    </div>

                                    {/* Customer Information */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900">Your Information</h4>

                                        <div>
                                            <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                className="mt-2"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                className="mt-2"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                className="mt-2"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
                                            <Textarea
                                                id="notes"
                                                value={formData.notes}
                                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                                rows={3}
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    {/* Price Summary */}
                                    {selectedDate && selectedTime && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <h4 className="font-medium text-green-900 mb-2">Booking Summary</h4>
                                            <div className="space-y-1 text-sm text-green-800">
                                                <p>Court: {pickleballData.name}</p>
                                                <p>Date: {selectedDate.toLocaleDateString()}</p>
                                                <p>Time: {new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}</p>
                                                <p>Duration: {duration} hour(s)</p>
                                                <p>Players: {formData.players}</p>
                                                <p className="font-semibold">Total: ${calculatePrice()}</p>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={submitting || !selectedDate || !selectedTime || !formData.name || !formData.email || !formData.phone || !formData.players}
                                        className="w-full"
                                    >
                                        {submitting ? 'Creating Booking...' : 'Book Court'}
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