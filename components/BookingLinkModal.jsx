"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function BookingLinkModal({
    isOpen,
    onClose,
    onGenerate,
    title = "Generate Booking Link",
    defaultExpiryHours = 24,
    defaultExpiryDays = 30,
    defaultPrice = 0,
    expiryUnit = "hours"
}) {
    const [expiryValue, setExpiryValue] = useState(expiryUnit === "days" ? defaultExpiryDays : defaultExpiryHours);
    const [price, setPrice] = useState(defaultPrice);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await onGenerate(expiryValue, price);
            onClose();
        } catch (error) {
            console.error("Error generating booking link:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setExpiryValue(defaultExpiryHours);
        setPrice(defaultPrice);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Set the expiry time and price for the booking link. Users will see this price when booking.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expiryValue" className="text-right">
                            Expiry ({expiryUnit === "hours" ? "Hours" : "Days"})
                        </Label>
                        <Input
                            id="expiryValue"
                            type="number"
                            min="1"
                            max={expiryUnit === "hours" ? "168" : "365"}
                            value={expiryValue}
                            onChange={(e) => setExpiryValue(parseInt(e.target.value) || (expiryUnit === "hours" ? 24 : 30))}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Price (USD)
                        </Label>
                        <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Generating..." : "Generate Link"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
