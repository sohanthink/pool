"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Target } from "lucide-react"
import { useSession } from "next-auth/react"

const PickleballForm = ({ pickleball = null }) => {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [formData, setFormData] = useState({
        ownerName: pickleball?.owner?.name || session?.user?.name || '',
        ownerEmail: pickleball?.owner?.email || session?.user?.email || '',
        ownerPhone: pickleball?.owner?.phone || session?.user?.phone || '',
        name: pickleball?.name || '',
        description: pickleball?.description || '',
        location: pickleball?.location || '',
        surface: pickleball?.surface || 'Outdoor',
        type: pickleball?.type || 'Doubles',
        price: pickleball?.price || '',
        status: pickleball?.status || 'Active',
        amenities: pickleball?.amenities || [],
        images: pickleball?.images || []
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [newAmenity, setNewAmenity] = useState('')
    const [uploading, setUploading] = useState(false)

    // Update owner fields if session changes
    React.useEffect(() => {
        setFormData(prev => ({
            ...prev,
            ownerName: session?.user?.name || '',
            ownerEmail: session?.user?.email || '',
            ownerPhone: session?.user?.phone || '',
        }))
    }, [session?.user?.name, session?.user?.email, session?.user?.phone])

    if (status === 'loading' || !session?.user?.email) {
        return <div className="p-8 text-center text-gray-500">Loading user...</div>
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const addAmenity = () => {
        if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
            setFormData(prev => ({
                ...prev,
                amenities: [...prev.amenities, newAmenity.trim()]
            }))
            setNewAmenity('')
        }
    }

    const removeAmenity = (index) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.filter((_, i) => i !== index)
        }))
    }

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files)
        setUploading(true)
        setError('')

        try {
            const uploadedUrls = []
            for (const file of files) {
                const formData = new FormData()
                formData.append('file', file)

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    throw new Error('Failed to upload image')
                }

                const data = await response.json()
                uploadedUrls.push(data.url)
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }))
        } catch (err) {
            setError('Failed to upload images')
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const url = pickleball ? `/api/pickleball/${pickleball._id}` : '/api/pickleball'
            const method = pickleball ? 'PUT' : 'POST'

            // Prepare the data with owner information
            const submitData = {
                ...formData,
                owner: {
                    name: formData.ownerName,
                    email: formData.ownerEmail,
                    phone: formData.ownerPhone || '',
                }
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save pickleball court')
            }

            router.push('/dashboard/admin/pickleball')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-6 w-6" />
                        {pickleball ? 'Edit Pickleball Court' : 'Add New Pickleball Court'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {/* Owner Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Owner Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ownerName">Owner Name *</Label>
                                    <Input
                                        id="ownerName"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleInputChange}
                                        placeholder="Enter owner name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ownerEmail">Owner Email *</Label>
                                    <Input
                                        id="ownerEmail"
                                        name="ownerEmail"
                                        type="email"
                                        value={formData.ownerEmail}
                                        onChange={handleInputChange}
                                        placeholder="Enter owner email"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ownerPhone">Owner Phone</Label>
                                    <Input
                                        id="ownerPhone"
                                        name="ownerPhone"
                                        type="tel"
                                        value={formData.ownerPhone}
                                        onChange={handleInputChange}
                                        placeholder="Enter owner phone"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Court Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter court name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Enter location"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the pickleball court"
                                rows={3}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="surface">Surface Type *</Label>
                                <Select value={formData.surface} onValueChange={(value) => handleSelectChange('surface', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select surface type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Indoor">Indoor</SelectItem>
                                        <SelectItem value="Outdoor">Outdoor</SelectItem>
                                        <SelectItem value="Both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Court Type *</Label>
                                <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select court type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Singles">Singles</SelectItem>
                                        <SelectItem value="Doubles">Doubles</SelectItem>
                                        <SelectItem value="Both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Price per Hour ($) *</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="Enter price"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <Label>Amenities</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newAmenity}
                                    onChange={(e) => setNewAmenity(e.target.value)}
                                    placeholder="Add amenity"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                                />
                                <Button type="button" onClick={addAmenity} variant="outline">
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.amenities.map((amenity, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {amenity}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeAmenity(index)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Images</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 mb-2">
                                    Click to upload or drag and drop
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                    disabled={uploading}
                                />
                                <label htmlFor="image-upload">
                                    <Button type="button" variant="outline" disabled={uploading}>
                                        {uploading ? 'Uploading...' : 'Choose Images'}
                                    </Button>
                                </label>
                            </div>
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image}
                                                alt={`Pickleball court ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                                onClick={() => removeImage(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? 'Saving...' : (pickleball ? 'Update Court' : 'Create Court')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/dashboard/admin/pickleball')}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default PickleballForm
