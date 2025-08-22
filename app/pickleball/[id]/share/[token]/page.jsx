"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Target, Calendar as CalendarIcon, Clock, MapPin, DollarSign, Users, AlertCircle, ArrowLeft, CheckCircle, User, Phone, Mail } from "lucide-react"

const ShareablePickleballPage = () => {
    const params = useParams()
    const router = useRouter()
    const courtId = params.id
    const token = params.token
    const [pickleball, setPickleball] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [timeRemaining, setTimeRemaining] = useState('')
    const [availableSlots, setAvailableSlots] = useState([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [errorSlots, setErrorSlots] = useState('')
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedTime, setSelectedTime] = useState('')
    const [bookingData, setBookingData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        players: 2,
        duration: 1,
        notes: ''
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        validateShareLink()
    }, [courtId, token])

    useEffect(() => {
        if (pickleball?.linkExpiry) {
            const updateTimeRemaining = () => {
                const now = new Date();
                const expiry = new Date(pickleball.linkExpiry);
                const diff = expiry - now;

                if (diff <= 0) {
                    setTimeRemaining('Expired');
                    setError('This link has expired');
                    return;
                }

                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeRemaining(`${hours}h ${minutes}m remaining`);
            };

            updateTimeRemaining();
            const interval = setInterval(updateTimeRemaining, 60000);
            return () => clearInterval(interval);
        }
    }, [pickleball?.linkExpiry]);

    const validateShareLink = async () => {
        try {
            const res = await fetch('/api/pickleball/share/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courtId, token }),
            });

            if (!res.ok) {
                const data = await res.json();
                if (res.status === 410) {
                    setError('This link has expired');
                } else {
                    setError(data.error || 'Invalid or inactive link');
                }
                return;
            }

            const data = await res.json();
            setPickleball(data.pickleball);
        } catch (err) {
            setError('Failed to load pickleball court information');
        } finally {
            setLoading(false);
        }
    }

    // Fetch available slots when date changes
    useEffect(() => {
        if (!selectedDate || !courtId) return;

        async function fetchSlots() {
            setLoadingSlots(true);
            setErrorSlots('');
            try {
                const dateStr = selectedDate.toISOString().split('T')[0];
                const res = await fetch(`/api/pickleball/${courtId}/availability?date=${dateStr}`);
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
    }, [courtId, selectedDate]);

    // Check if date is within link validity period
    const isDateWithinValidity = (date) => {
        if (!pickleball?.linkExpiry) return true;
        const linkExpiry = new Date(pickleball.linkExpiry);
        const selectedDate = new Date(date);
        const linkExpiryDate = new Date(linkExpiry.getFullYear(), linkExpiry.getMonth(), linkExpiry.getDate());
        const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        return selectedDateOnly <= linkExpiryDate;
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        if (!selectedDate || !selectedTime) {
            setError("Please select a date and time");
            setSubmitting(false);
            return;
        }

        if (!bookingData.customerName || !bookingData.customerEmail || !bookingData.customerPhone) {
            setError("Please fill in all required fields");
            setSubmitting(false);
            return;
        }

        if (!isDateWithinValidity(selectedDate)) {
            setError("Selected date is outside the link validity period");
            setSubmitting(false);
            return;
        }

        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const bookingPayload = {
                ...bookingData,
                pickleballCourtId: courtId,
                date: dateStr,
                time: selectedTime,
                fromShareLink: true
            }

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingPayload),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to create booking')
            }

            alert('Booking created successfully!')
            router.push('/')
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error || !pickleball) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <Target className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                        <p className="text-gray-600">{error || 'Pickleball court not found'}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pickleball Court Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-6 w-6 text-blue-600" />
                                {pickleball.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-600">{pickleball.description}</p>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span>{pickleball.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Target className="h-4 w-4 text-gray-500" />
                                    <span>{pickleball.surface} • {pickleball.type}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <DollarSign className="h-4 w-4 text-gray-500" />
                                    <span className="font-semibold">${pickleball.price}/hour</span>
                                </div>
                            </div>

                            {pickleball.images && pickleball.images.length > 0 && (
                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={pickleball.images[0]}
                                        alt={pickleball.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {pickleball.amenities && pickleball.amenities.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Amenities</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {pickleball.amenities.map((amenity, index) => (
                                            <Badge key={index} variant="secondary">
                                                {amenity}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}


                        </CardContent>
                    </Card>

                    {/* Booking Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Book This Court</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                        {error}
                                    </div>
                                )}

                                {/* Link Validity Notice */}
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-orange-800">
                                        <Clock className="h-4 w-4" />
                                        <span className="font-medium">Booking Time Restriction</span>
                                    </div>
                                    <p className="text-orange-700 text-sm mt-1">
                                        You can only book dates within the link validity period: until {new Date(pickleball.linkExpiry).toLocaleString()}
                                    </p>
                                </div>

                                {/* Date Selection */}
                                <div>
                                    <Label className="text-sm font-medium">Select Date</Label>
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        className="rounded-md border mt-2"
                                        disabled={(date) => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            return date < today || !isDateWithinValidity(date);
                                        }}
                                    />
                                    {selectedDate && !isDateWithinValidity(selectedDate) && (
                                        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            This date is outside the link validity period
                                        </p>
                                    )}
                                </div>

                                {/* Time Selection */}
                                {selectedDate && isDateWithinValidity(selectedDate) && (
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
                                    <Select value={bookingData.duration.toString()} onValueChange={(value) => setBookingData(prev => ({ ...prev, duration: parseInt(value) }))}>
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
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Total Price:</span>
                                            <span className="text-xl font-bold text-green-600">
                                                ${pickleball.price * bookingData.duration}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="font-medium">Contact Information</h3>

                                    <div>
                                        <Label htmlFor="customerName">Full Name *</Label>
                                        <Input
                                            id="customerName"
                                            value={bookingData.customerName}
                                            onChange={(e) => setBookingData(prev => ({ ...prev, customerName: e.target.value }))}
                                            required
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="customerEmail">Email *</Label>
                                        <Input
                                            id="customerEmail"
                                            type="email"
                                            value={bookingData.customerEmail}
                                            onChange={(e) => setBookingData(prev => ({ ...prev, customerEmail: e.target.value }))}
                                            required
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="customerPhone">Phone Number *</Label>
                                        <Input
                                            id="customerPhone"
                                            type="tel"
                                            value={bookingData.customerPhone}
                                            onChange={(e) => setBookingData(prev => ({ ...prev, customerPhone: e.target.value }))}
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
                                            value={bookingData.players}
                                            onChange={(e) => setBookingData(prev => ({ ...prev, players: parseInt(e.target.value) }))}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="notes">Notes (Optional)</Label>
                                        <Textarea
                                            id="notes"
                                            value={bookingData.notes}
                                            onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                                            rows={3}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={submitting} className="w-full">
                                    {submitting ? 'Creating Booking...' : 'Book Court'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default ShareablePickleballPage
