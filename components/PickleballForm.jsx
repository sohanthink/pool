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
import { X, Upload, Target, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRef } from 'react'

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;

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
        images: Array.isArray(pickleball?.images) ? [...pickleball.images, '', '', '', ''].slice(0, 5) : ['', '', '', '', '']
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [newAmenity, setNewAmenity] = useState('')
    const fileInputRefs = [useRef(), useRef(), useRef(), useRef(), useRef()]
    const [imageErrors, setImageErrors] = useState([null, null, null, null, null])
    const [uploading, setUploading] = useState([false, false, false, false, false])
    const [uploaded, setUploaded] = useState([false, false, false, false, false])

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

    const handleImageChange = (index, value) => {
        setFormData((prev) => {
            const images = [...prev.images]
            images[index] = value
            return { ...prev, images }
        })
    }

    const handleDrop = async (index, files) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        if (file.size > MAX_IMAGE_SIZE) {
            setImageErrors(prev => {
                const errs = [...prev];
                errs[index] = `Image must be less than ${MAX_IMAGE_SIZE_MB}MB.`;
                return errs;
            });
            return;
        }
        setImageErrors(prev => {
            const errs = [...prev];
            errs[index] = null;
            return errs;
        });
        setUploading(prev => { const arr = [...prev]; arr[index] = true; return arr; });

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Failed to upload image');
            const data = await res.json();
            setFormData((prev) => {
                const images = [...prev.images];
                images[index] = data.url;
                return { ...prev, images };
            });
            setUploaded(prev => { const arr = [...prev]; arr[index] = true; return arr; });
        } catch (err) {
            setImageErrors(prev => {
                const errs = [...prev];
                errs[index] = 'Image upload failed.';
                return errs;
            });
        } finally {
            setUploading(prev => { const arr = [...prev]; arr[index] = false; return arr; });
        }
    };

    const handleRemoveImage = (index) => {
        setFormData((prev) => {
            const images = [...prev.images];
            images[index] = '';
            return { ...prev, images };
        });
        setImageErrors(prev => {
            const errs = [...prev];
            errs[index] = null;
            return errs;
        });
        setUploaded(prev => {
            const arr = [...prev];
            arr[index] = false;
            return arr;
        });
    };

    const handleClearAllImages = () => {
        setFormData((prev) => ({
            ...prev,
            images: ['', '', '', '', '']
        }));
        setImageErrors([null, null, null, null, null]);
        setUploaded([false, false, false, false, false]);
    };

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
                images: formData.images.filter(Boolean),
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
                            <p className="text-sm text-gray-600 mb-4">Owner name and email are automatically filled from your account information and cannot be changed.</p>
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
                                        disabled
                                        className="bg-gray-100 cursor-not-allowed"
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
                                        disabled
                                        className="bg-gray-100 cursor-not-allowed"
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

                        <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <Label className="text-sm font-medium text-gray-700">
                                    Pickleball Court Images (Drag & drop or click to upload)
                                </Label>
                                {formData.images.some(img => img) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearAllImages}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Clear All
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-4">
                                    {[...Array(5)].map((_, index) => (
                                        <Card key={index} className="w-32 h-32 border-dashed border-2 flex flex-col items-center justify-center relative group cursor-pointer transition-shadow hover:shadow-lg" onClick={() => fileInputRefs[index].current && fileInputRefs[index].current.click()}>
                                            <CardContent className="p-0 w-full h-full flex flex-col items-center justify-center">
                                                {formData.images[index] ? (
                                                    <div className="relative w-full h-full">
                                                        <img
                                                            src={formData.images[index].startsWith('/uploads/') ? formData.images[index] : `/uploads/${formData.images[index].replace(/^\/+/, '')}`}
                                                            alt={`Pickleball Court ${index + 1}`}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveImage(index);
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Drop or click</span>
                                                )}
                                                {uploading[index] && (
                                                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
                                                        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                                                    </div>
                                                )}
                                                {uploaded[index] && !uploading[index] && (
                                                    <CheckCircle className="absolute top-2 right-2 text-green-500 bg-white rounded-full z-30" size={20} />
                                                )}
                                                <Input
                                                    ref={fileInputRefs[index]}
                                                    id={`image-upload-${index}`}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e => handleDrop(index, e.target.files)}
                                                />
                                                {imageErrors[index] && (
                                                    <Badge variant="destructive" className="absolute bottom-0 left-0 right-0 text-xs whitespace-normal">{imageErrors[index]}</Badge>
                                                )}
                                            </CardContent>
                                            <div
                                                className="absolute inset-0 z-10"
                                                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                                                onDrop={e => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDrop(index, e.dataTransfer.files);
                                                }}
                                            />
                                        </Card>
                                    ))}
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">Upload up to 5 images (max 2MB each)</span>
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
