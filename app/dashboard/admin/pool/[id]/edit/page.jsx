"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PoolForm from "@/components/PoolForm";
import { AlertCircle, CheckCircle } from "lucide-react";

const EditPoolPage = ({ params }) => {
    const poolId = params.id;
    const [pool, setPool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchPool() {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/pools/${poolId}`);
                if (!res.ok) throw new Error("Failed to fetch pool");
                const data = await res.json();
                setPool(data);
            } catch (err) {
                setError(err.message || "Failed to load pool");
            } finally {
                setLoading(false);
            }
        }
        fetchPool();
    }, [poolId]);

    const handleSubmit = async (form) => {
        setError("");
        setSuccess(false);
        try {
            const res = await fetch(`/api/pools/${poolId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to update pool");
                return;
            }
            setSuccess(true);
            setTimeout(() => router.push(`/dashboard/admin/pool/${poolId}`), 1200);
        } catch (err) {
            setError("Something went wrong!");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-600 flex flex-col items-center"><AlertCircle className="h-8 w-8 mb-2" />{error}</div>;
    if (!pool) return null;

    return (
        <div className="max-w-4xl pt-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Edit Pool</h1>
            <PoolForm
                initialData={pool}
                onSubmit={handleSubmit}
                submitLabel="Update Pool"
            />
            {success && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded px-4 py-2 mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <span>Pool updated successfully!</span>
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded px-4 py-2 mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default EditPoolPage; 