import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Building2, Plus, Eye } from "lucide-react"

// Mock data for pools
const pools = [
    {
        id: 1,
        name: "Dream Vali Poll",
        size: "1256 sqft.",
        location: "3106 Fleming Way, Richmond. USA",
        image: "/pool-image-1.jpg" // You can replace with actual image paths
    },
    {
        id: 2,
        name: "Dream Vali Poll",
        size: "1256 sqft.",
        location: "3106 Fleming Way, Richmond. USA",
        image: "/pool-image-2.jpg"
    },
    {
        id: 3,
        name: "Dream Vali Poll",
        size: "1256 sqft.",
        location: "3106 Fleming Way, Richmond. USA",
        image: "/pool-image-3.jpg"
    }
]

const PoolList = () => {
    return (
        <div className='pt-6'>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h1 className="text-2xl font-semibold text-gray-800">Pool List</h1>
                </div>
                <Link href="/dashboard/admin/pool/create">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Pool
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pools.map((pool) => (
                    <Card key={pool.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-white text-center">
                                    <Building2 className="h-12 w-12 mx-auto mb-2 opacity-80" />
                                    <p className="text-sm opacity-80">Pool Image</p>
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-4">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Pool Name:</span> {pool.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Size:</span> {pool.size}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Location:</span> {pool.location}
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter className="p-4 pt-0">
                            <Link
                                href={`/dashboard/admin/pool/${pool.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                                <Eye className="h-4 w-4" />
                                View Details
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default PoolList