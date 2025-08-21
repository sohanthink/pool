import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pickleball from "@/models/Pickleball";
import Booking from "@/models/Booking";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const pickleball = await Pickleball.findById(id);
    if (!pickleball) {
      return NextResponse.json(
        { error: "Pickleball court not found" },
        { status: 404 }
      );
    }

    // Get all time slots (9 AM to 9 PM in 12-hour format)
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
      "7:00 PM",
      "8:00 PM",
    ];

    // Get existing bookings for this date
    const existingBookings = await Booking.find({
      pickleballCourtId: id,
      date: date,
      status: { $ne: "Cancelled" },
    });

    // Get booked time slots
    const bookedSlots = existingBookings.map((booking) => booking.time);

    // Filter out booked slots
    const availableSlots = allSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    return NextResponse.json({
      availableSlots,
      bookedSlots,
      allSlots,
    });
  } catch (error) {
    console.error("Error fetching pickleball court availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
