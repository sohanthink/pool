import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pool from "@/models/Pool";
import Booking from "@/models/Booking";

// GET /api/pools/[id]/availability - Get available time slots
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Check if pool exists
    const pool = await Pool.findById(params.id);
    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    // Get all time slots (9 AM to 6 PM)
    const allSlots = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ];

    // Get booked slots for the date
    const bookingDate = new Date(date);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookedBookings = await Booking.find({
      poolId: params.id,
      date: {
        $gte: bookingDate,
        $lt: nextDay,
      },
      status: { $nin: ["Cancelled"] },
    });

    // Extract booked time slots
    const bookedSlots = bookedBookings.map((booking) => booking.time);

    // Get available slots
    const availableSlots = allSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    return NextResponse.json({
      poolId: params.id,
      date: date,
      availableSlots,
      bookedSlots,
      allSlots,
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
