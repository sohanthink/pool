"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Building2, Plus, Eye, Copy } from "lucide-react";
import { useSession } from "next-auth/react";

export default function PoolList() {
    const { data: session, status } = useSession();
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedPoolId, setCopiedPoolId] = useState(null);

    useEffect(() => {
        if (!session?.user?.email) return;
        async function fetchPools() {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`/api/pools?ownerEmail=${encodeURIComponent(session.user.email)}`);
                if (!res.ok) throw new Error('Failed to fetch pools');
                const data = await res.json();
                setPools(data);
            } catch (err) {
                setError('Failed to load pools');
            } finally {
                setLoading(false);
            }
        }
        fetchPools();
    }, [session?.user?.email]);

    // Function to copy booking link
    const handleCopyLink = (poolId) => {
        const link = `${window.location.origin}/pool/${poolId}/book`;
        navigator.clipboard.writeText(link);
        setCopiedPoolId(poolId);
        setTimeout(() => setCopiedPoolId(null), 1500);
    };

    if (status === 'loading' || !session?.user?.email) return <div className="p-8 text-center text-gray-500">Loading user...</div>;
    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

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
                {pools.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-12">
                        No pools found.
                    </div>
                )}
                {pools.map((pool) => (
                    <Card key={pool._id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
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

                        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                            <Link
                                href={`/dashboard/admin/pool/${pool._id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                                <Eye className="h-4 w-4" />
                                View Details
                            </Link>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 mt-2"
                                onClick={() => handleCopyLink(pool._id)}
                            >
                                <Copy className="h-4 w-4" />
                                {copiedPoolId === pool._id ? "Link Copied!" : "Share Link"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}