"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Target, Calendar, Clock, MapPin, DollarSign, Users } from "lucide-react"

const BookPickleballPage = ({ params }) => {
    const router = useRouter()
    const courtId = params.id
    const [pickleball, setPickleball] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [availableSlots, setAvailableSlots] = useState([])
    const [selectedDate, setSelectedDate] = useState('')
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
        fetchPickleballCourt()
    }, [courtId])

    const fetchPickleballCourt = async () => {
        try {
            const res = await fetch(`/api/pickleball/${courtId}`)
            if (!res.ok) throw new Error('Failed to fetch pickleball court')
            const data = await res.json()
            setPickleball(data)
        } catch (err) {
            setError('Failed to load pickleball court')
        } finally {
            setLoading(false)
        }
    }

    const fetchAvailability = async (date) => {
        try {
            const res = await fetch(`/api/pickleball/${courtId}/availability?date=${date}`)
            if (!res.ok) throw new Error('Failed to fetch availability')
            const data = await res.json()
            setAvailableSlots(data.availableSlots)
        } catch (err) {
            setError('Failed to load availability')
        }
    }

    const handleDateChange = (date) => {
        setSelectedDate(date)
        setSelectedTime('')
        if (date) {
            fetchAvailability(date)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            const bookingPayload = {
                ...bookingData,
                pickleballCourtId: courtId,
                date: selectedDate,
                time: selectedTime,
                fromShareLink: false
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
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date *</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => handleDateChange(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="time">Time *</Label>
                                        <Select value={selectedTime} onValueChange={setSelectedTime} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSlots.map((slot) => (
                                                    <SelectItem key={slot} value={slot}>
                                                        {slot}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="players">Number of Players *</Label>
                                        <Select
                                            value={bookingData.players.toString()}
                                            onValueChange={(value) => setBookingData(prev => ({ ...prev, players: parseInt(value) }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select players" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 Player</SelectItem>
                                                <SelectItem value="2">2 Players</SelectItem>
                                                <SelectItem value="3">3 Players</SelectItem>
                                                <SelectItem value="4">4 Players</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (hours) *</Label>
                                        <Select
                                            value={bookingData.duration.toString()}
                                            onValueChange={(value) => setBookingData(prev => ({ ...prev, duration: parseInt(value) }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select duration" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 Hour</SelectItem>
                                                <SelectItem value="2">2 Hours</SelectItem>
                                                <SelectItem value="3">3 Hours</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Full Name *</Label>
                                    <Input
                                        id="customerName"
                                        value={bookingData.customerName}
                                        onChange={(e) => setBookingData(prev => ({ ...prev, customerName: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="customerEmail">Email *</Label>
                                    <Input
                                        id="customerEmail"
                                        type="email"
                                        value={bookingData.customerEmail}
                                        onChange={(e) => setBookingData(prev => ({ ...prev, customerEmail: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="customerPhone">Phone *</Label>
                                    <Input
                                        id="customerPhone"
                                        type="tel"
                                        value={bookingData.customerPhone}
                                        onChange={(e) => setBookingData(prev => ({ ...prev, customerPhone: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={bookingData.notes}
                                        onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={3}
                                    />
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">Booking Summary</h4>
                                    <div className="space-y-1 text-sm text-blue-800">
                                        <p>Court: {pickleball.name}</p>
                                        <p>Date: {selectedDate}</p>
                                        <p>Time: {selectedTime}</p>
                                        <p>Duration: {bookingData.duration} hour(s)</p>
                                        <p>Players: {bookingData.players}</p>
                                        <p className="font-semibold">Total: ${pickleball.price * bookingData.duration}</p>
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

export default BookPickleballPage
