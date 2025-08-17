import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tennis from "@/models/Tennis";
import Booking from "@/models/Booking";

// GET /api/tennis/[id]/availability - Get available time slots
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

    // Fix params usage for Next.js 15+
    const resolvedParams = await params;
    const tennisCourtId = resolvedParams.id;

    // Check if tennis court exists
    const tennisCourt = await Tennis.findById(tennisCourtId);
    if (!tennisCourt) {
      return NextResponse.json(
        { error: "Tennis court not found" },
        { status: 404 }
      );
    }

    // Get all time slots (9 AM to 6 PM) in 12-hour format
    const allSlots = [
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "1:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM",
      "6:00 PM",
    ];

    // Get booked slots for the date
    const bookingDate = new Date(date);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookedBookings = await Booking.find({
      tennisCourtId: tennisCourtId,
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
      tennisCourtId: tennisCourtId,
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
