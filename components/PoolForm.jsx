"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Upload, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react"

const initialState = {
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    poolName: '',
    poolSize: '',
    location: '',
    description: '',
    capacity: '',
    price: '',
    amenities: '', // comma separated
    images: ['', '', '', '', ''], // up to 5 image URLs
}

const PoolForm = () => {
    const [form, setForm] = useState(initialState)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        const { id, value } = e.target
        setForm((prev) => ({ ...prev, [id]: value }))
    }

    const handleImageChange = (index, value) => {
        setForm((prev) => {
            const images = [...prev.images]
            images[index] = value
            return { ...prev, images }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)
        try {
            // Validate required fields
            if (!form.ownerName || !form.ownerEmail || !form.ownerPhone || !form.poolName || !form.poolSize || !form.location || !form.description || !form.capacity || !form.price) {
                setError('Please fill in all required fields.')
                setLoading(false)
                return
            }
            const res = await fetch('/api/pools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.poolName,
                    description: form.description,
                    location: form.location,
                    size: form.poolSize,
                    capacity: Number(form.capacity),
                    price: Number(form.price),
                    owner: {
                        name: form.ownerName,
                        email: form.ownerEmail,
                        phone: form.ownerPhone
                    },
                    amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
                    images: form.images.filter(Boolean)
                })
            })
            if (!res.ok) {
                const data = await res.json()
                setError(data.error || 'Failed to create pool')
                setLoading(false)
                return
            }
            setSuccess(true)
            setForm(initialState)
        } catch (err) {
            setError('Something went wrong!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl pt-6">
            <div className="flex items-center gap-2 mb-6">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h1 className="text-2xl font-semibold text-gray-800">Add your pool details:</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="ownerName" className="text-sm font-medium text-gray-700">
                                Your Name
                            </Label>
                            <Input
                                id="ownerName"
                                type="text"
                                placeholder="Enter your name"
                                className="mt-1"
                                value={form.ownerName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="ownerEmail" className="text-sm font-medium text-gray-700">
                                Email
                            </Label>
                            <Input
                                id="ownerEmail"
                                type="email"
                                placeholder="Enter your email"
                                className="mt-1"
                                value={form.ownerEmail}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="ownerPhone" className="text-sm font-medium text-gray-700">
                                Phone Number
                            </Label>
                            <Input
                                id="ownerPhone"
                                type="tel"
                                placeholder="Enter phone number"
                                className="mt-1"
                                value={form.ownerPhone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="poolSize" className="text-sm font-medium text-gray-700">
                                Pool Size
                            </Label>
                            <Input
                                id="poolSize"
                                type="text"
                                placeholder="e.g., 20x40 feet"
                                className="mt-1"
                                value={form.poolSize}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="capacity" className="text-sm font-medium text-gray-700">
                                Capacity
                            </Label>
                            <Input
                                id="capacity"
                                type="number"
                                placeholder="e.g., 20"
                                className="mt-1"
                                value={form.capacity}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                                Price (per hour)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="e.g., 150"
                                className="mt-1"
                                value={form.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="poolName" className="text-sm font-medium text-gray-700">
                                Pool Name
                            </Label>
                            <Input
                                id="poolName"
                                type="text"
                                placeholder="Enter pool name"
                                className="mt-1"
                                value={form.poolName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                                Location
                            </Label>
                            <Input
                                id="location"
                                type="text"
                                placeholder="Enter location"
                                className="mt-1"
                                value={form.location}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                Pool Description
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your pool..."
                                className="mt-1 min-h-[100px]"
                                value={form.description}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="amenities" className="text-sm font-medium text-gray-700">
                                Amenities (comma separated)
                            </Label>
                            <Input
                                id="amenities"
                                type="text"
                                placeholder="e.g., Diving Board, Heating, Parking"
                                className="mt-1"
                                value={form.amenities}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
                <div className="border-t pt-6">
                    <Label className="text-sm font-medium text-gray-700 mb-4 block">
                        Pool Images (URLs)
                    </Label>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-3">
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Image URL"
                                        className="mt-1 text-xs px-1 py-0.5"
                                        value={form.images[index]}
                                        onChange={e => handleImageChange(index, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <span className="text-sm text-gray-500">Paste up to 5 image URLs</span>
                    </div>
                </div>
                {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded px-4 py-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded px-4 py-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Pool created successfully!</span>
                    </div>
                )}
                <div className="flex justify-end pt-4">
                    <Button type="submit" className="px-8" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default PoolForm 