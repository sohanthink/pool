"use client"
import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Upload, Image as ImageIcon } from "lucide-react"

const PoolForm = () => {
    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle form submission
        console.log('Form submitted')
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
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                Your Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                className="mt-1"
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
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="Enter phone number"
                                className="mt-1"
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
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="poolName" className="text-sm font-medium text-gray-700">
                                Your Pool Name
                            </Label>
                            <Input
                                id="poolName"
                                type="text"
                                placeholder="Enter pool name"
                                className="mt-1"
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
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <Label className="text-sm font-medium text-gray-700 mb-4 block">
                        Pool Image
                    </Label>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-3">
                            {[...Array(5)].map((_, index) => (
                                <div
                                    key={index}
                                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                >
                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                    <Upload className="h-4 w-4 text-gray-400 mt-1" />
                                </div>
                            ))}
                        </div>
                        <span className="text-sm text-gray-500">Upload maximum 5 Image</span>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" className="px-8">
                        Submit
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default PoolForm 