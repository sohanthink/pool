"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Building2,
    MapPin,
    Users,
    Star,
    Image as ImageIcon,
    AlertCircle,
    Clock,
    Calendar as CalendarIcon,
    ArrowLeft,
    CheckCircle,
    User,
    Phone,
    Mail
} from "lucide-react";

const ShareablePoolPage = () => {
    const params = useParams();
    const router = useRouter();
    const [pool, setPool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRemaining, setTimeRemaining] = useState('');

    // Booking states
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [duration, setDuration] = useState("2");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        guests: "",
        notes: ""
    });
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState("");

    // Availability states
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [errorSlots, setErrorSlots] = useState('');

    const poolId = params.id;
    const token = params.token;



    useEffect(() => {
        const validateAndFetchPool = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch('/api/pools/share/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ poolId, token }),
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
                setPool(data.pool);
            } catch (err) {
                setError('Failed to load pool information');
            } finally {
                setLoading(false);
            }
        };

        if (poolId && token) {
            validateAndFetchPool();
        }
    }, [poolId, token]);

    useEffect(() => {
        if (pool?.linkExpiry) {
            const updateTimeRemaining = () => {
                const now = new Date();
                const expiry = new Date(pool.linkExpiry);
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
            const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

            return () => clearInterval(interval);
        }
    }, [pool?.linkExpiry]);

    // Fetch available slots when date changes
    useEffect(() => {
        if (!selectedDate || !poolId) return;

        async function fetchSlots() {
            setLoadingSlots(true);
            setErrorSlots('');
            try {
                const dateStr = selectedDate.toISOString().split('T')[0];
                const res = await fetch(`/api/pools/${poolId}/availability?date=${dateStr}`);
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
    }, [poolId, selectedDate]);

    // Calculate price
    const calculatePrice = () => {
        if (!pool) return 0;
        let hourlyRate = 0;
        if (typeof pool.price === 'string') {
            hourlyRate = parseInt(pool.price.replace('$', ''));
        } else if (typeof pool.price === 'number') {
            hourlyRate = pool.price;
        }
        return hourlyRate * parseInt(duration);
    };

    // Check if date is within link validity period
    const isDateWithinValidity = (date) => {
        if (!pool?.linkExpiry) return true;
        const linkExpiry = new Date(pool.linkExpiry);
        const selectedDate = new Date(date);

        // Allow booking for the entire day if link expires on that day
        // Compare just the date part (year, month, day) to allow full day booking
        const linkExpiryDate = new Date(linkExpiry.getFullYear(), linkExpiry.getMonth(), linkExpiry.getDate());
        const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

        return selectedDateOnly <= linkExpiryDate;
    };

    // Handle booking submission
    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingError("");

        if (!selectedDate || !selectedTime) {
            setBookingError("Please select a date and time");
            return;
        }

        if (!formData.name || !formData.email || !formData.phone) {
            setBookingError("Please fill in all required fields");
            return;
        }

        // Check if selected date is within link validity
        if (!isDateWithinValidity(selectedDate)) {
            setBookingError("Selected date is outside the link validity period");
            return;
        }

        setIsBooking(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const bookingData = {
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
                fromShareLink: true,
            };



            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData)
            });

            if (!res.ok) {
                const data = await res.json();
                setBookingError(data.error || "Failed to create booking");
                setIsBooking(false);
                return;
            }

            setIsBooking(false);
            setBookingSuccess(true);

            // Reset form
            setSelectedDate(null);
            setSelectedTime("");
            setDuration("2");
            setFormData({
                name: "",
                email: "",
                phone: "",
                guests: "",
                notes: ""
            });
        } catch (err) {
            setBookingError("Failed to create booking. Please try again.");
            setIsBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading pool information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-semibold text-gray-800 mb-2">Link Error</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button onClick={() => router.push('/')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }

    if (!pool) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Pool not found</p>
                </div>
            </div>
        );
    }

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
                        <div className="space-y-2">
                            <Button
                                onClick={() => setBookingSuccess(false)}
                                className="w-full"
                            >
                                Book Another Time
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowBookingForm(false)}
                                className="w-full"
                            >
                                Back to Pool Details
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Home
                            </Button>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                <h1 className="text-xl font-semibold text-gray-800">{pool.name}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-green-700 border-green-300">
                                <Clock className="h-3 w-3 mr-1" />
                                {timeRemaining}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!showBookingForm ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Pool Images */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5" />
                                        Pool Images ({pool.images?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {pool.images && pool.images.length > 0 ? (
                                            pool.images.map((image, index) => (
                                                <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                                    <img
                                                        src={image}
                                                        alt={`Pool ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 text-center py-12 text-gray-500">
                                                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p>No images available</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pool Information */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pool Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{pool.name}</h3>
                                        <p className="text-gray-600">{pool.description}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-700">{pool.location}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-700">Capacity: {pool.capacity} people</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-700">Size: {pool.size}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-700">Rating: {pool.rating}/5</span>
                                        </div>
                                    </div>

                                    {/* Amenities */}
                                    {pool.amenities && pool.amenities.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-800 mb-2">Amenities</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {pool.amenities.map((amenity, index) => (
                                                    <Badge key={index} variant="secondary">
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Booking CTA */}
                            <Card className="border-blue-200 bg-blue-50">
                                <CardContent className="p-6">
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                            Book This Pool Now!
                                        </h3>
                                        <p className="text-blue-600 mb-4">
                                            This link is valid until {new Date(pool.linkExpiry).toLocaleString()}
                                        </p>
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            onClick={() => setShowBookingForm(true)}
                                        >
                                            <CalendarIcon className="h-4 w-4 mr-2" />
                                            Book Now
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    /* Booking Form */
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowBookingForm(false)}
                                className="mb-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Pool Details
                            </Button>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5" />
                                        Book {pool.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleBookingSubmit} className="space-y-6">
                                        {bookingError && (
                                            <div className="text-red-600 text-sm mb-2 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                {bookingError}
                                            </div>
                                        )}

                                        {/* Link Validity Notice */}
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-orange-800">
                                                <Clock className="h-4 w-4" />
                                                <span className="font-medium">Booking Time Restriction</span>
                                            </div>
                                            <p className="text-orange-700 text-sm mt-1">
                                                You can only book dates within the link validity period: until {new Date(pool.linkExpiry).toLocaleString()}
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
                                                    max={pool.capacity}
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
                                            disabled={!selectedDate || !selectedTime || isBooking || !isDateWithinValidity(selectedDate)}
                                        >
                                            {isBooking ? "Processing..." : "Confirm Booking"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareablePoolPage; 