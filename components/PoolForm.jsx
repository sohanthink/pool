"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, X } from "lucide-react"
import { useSession } from "next-auth/react";
import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const initialState = {
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    poolName: '',
    poolSize: '',
    location: '',
    description: '',
    capacity: '',
    amenities: '', // comma separated
    images: ['', '', '', '', ''], // up to 5 image URLs
}

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const PoolForm = ({ initialData, onSubmit, submitLabel }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [form, setForm] = useState(() => {
        if (initialData) {
            return {
                ownerName: initialData.owner?.name || session?.user?.name || '',
                ownerEmail: initialData.owner?.email || session?.user?.email || '',
                ownerPhone: initialData.owner?.phone || session?.user?.phone || '',
                poolName: initialData.name || '',
                poolSize: initialData.size || '',
                location: initialData.location || '',
                description: initialData.description || '',
                capacity: initialData.capacity?.toString() || '',

                amenities: Array.isArray(initialData.amenities) ? initialData.amenities.join(', ') : '',
                images: Array.isArray(initialData.images) ? [...initialData.images, '', '', '', ''].slice(0, 5) : ['', '', '', '', ''],
            }
        }
        return {
            ownerName: session?.user?.name || '',
            ownerEmail: session?.user?.email || '',
            ownerPhone: session?.user?.phone || '',
            poolName: '',
            poolSize: '',
            location: '',
            description: '',
            capacity: '',

            amenities: '',
            images: ['', '', '', '', ''],
        }
    });
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const fileInputRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];
    const [imageErrors, setImageErrors] = useState([null, null, null, null, null]);
    const [uploading, setUploading] = useState([false, false, false, false, false]);
    const [uploaded, setUploaded] = useState([false, false, false, false, false]);

    // Update owner fields if session changes
    React.useEffect(() => {
        setForm((prev) => ({
            ...prev,
            ownerName: session?.user?.name || '',
            ownerEmail: session?.user?.email || '',
            ownerPhone: session?.user?.phone || '',
        }));
    }, [session?.user?.name, session?.user?.email, session?.user?.phone]);

    if (status === 'loading' || !session?.user?.email) return <div className="p-8 text-center text-gray-500">Loading user...</div>;

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
        setUploaded(prev => { const arr = [...prev]; arr[index] = false; return arr; });
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Failed to upload image');
            const data = await res.json();
            setForm((prev) => {
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
        setForm((prev) => {
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
        setForm((prev) => ({
            ...prev,
            images: ['', '', '', '', '']
        }));
        setImageErrors([null, null, null, null, null]);
        setUploaded([false, false, false, false, false]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            // Validate required fields (phone is OPTIONAL)
            if (!form.ownerName || !form.ownerEmail || !form.poolName || !form.poolSize || !form.location || !form.description || !form.capacity) {
                setError('Please fill in all required fields.');
                setLoading(false);
                return;
            }
            const owner = {
                name: form.ownerName,
                email: form.ownerEmail,
            };
            if (form.ownerPhone) {
                owner.phone = form.ownerPhone;
            }
            const payload = {
                name: form.poolName,
                description: form.description,
                location: form.location,
                size: form.poolSize,
                capacity: Number(form.capacity),

                owner,
                amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
                images: form.images.filter(Boolean)
            };
            if (onSubmit) {
                await onSubmit(payload);
                setSuccess(true);
                // Redirect to pool listing page after successful creation
                setTimeout(() => {
                    router.push('/dashboard/admin/pool');
                }, 1000);
            } else {
                const res = await fetch('/api/pools', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    const data = await res.json();
                    setError(data.error || 'Failed to create pool');
                    setLoading(false);
                    return;
                }
                setSuccess(true);
                setForm({
                    ownerName: session?.user?.name || '',
                    ownerEmail: session?.user?.email || '',
                    ownerPhone: session?.user?.phone || '',
                    poolName: '',
                    poolSize: '',
                    location: '',
                    description: '',
                    capacity: '',

                    amenities: '',
                    images: ['', '', '', '', ''],
                });
                // Redirect to pool listing page after successful creation
                setTimeout(() => {
                    router.push('/dashboard/admin/pool');
                }, 1000);
            }
        } catch (err) {
            setError('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl pt-4 md:pt-6 px-4 md:px-0">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Add your pool details:</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-3 md:space-y-4">
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
                                readOnly
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
                                readOnly
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

                    </div>
                    {/* Right Column */}
                    <div className="space-y-3 md:space-y-4">
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
                                className="mt-1 min-h-[80px] md:min-h-[100px] resize-y"
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
                <div className="border-t pt-4 md:pt-6">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
                        <Label className="text-sm font-medium text-gray-700">
                            Pool Images (Drag & drop or click to upload)
                        </Label>
                        {form.images.some(img => img) && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleClearAllImages}
                                className="text-red-600 hover:text-red-700 w-fit"
                            >
                                Clear All
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:gap-4 lg:space-y-0">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                            {[...Array(5)].map((_, index) => (
                                <Card key={index} className="w-full aspect-square max-w-32 border-dashed border-2 flex flex-col items-center justify-center relative group cursor-pointer transition-shadow hover:shadow-lg" onClick={() => fileInputRefs[index].current && fileInputRefs[index].current.click()}>
                                    <CardContent className="p-0 w-full h-full flex flex-col items-center justify-center">
                                        {form.images[index] ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={form.images[index].startsWith('/uploads/') ? form.images[index] : `/uploads/${form.images[index].replace(/^\/+/, '')}`}
                                                    alt={`Pool ${index + 1}`}
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
                        <div className="flex-shrink-0">
                            <span className="text-sm text-gray-500 block lg:inline">Upload up to 5 images (max 2MB each)</span>
                        </div>
                    </div>
                </div>
                {error && (
                    <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded px-3 md:px-4 py-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="flex items-start gap-2 text-green-700 bg-green-50 rounded px-3 md:px-4 py-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Pool created successfully!</span>
                    </div>
                )}
                <div className="flex justify-end pt-4">
                    <Button type="submit" className="w-full sm:w-auto px-6 md:px-8" disabled={loading}>
                        {loading ? (submitLabel ? `Submitting...` : 'Submitting...') : (submitLabel || 'Submit')}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default PoolForm 