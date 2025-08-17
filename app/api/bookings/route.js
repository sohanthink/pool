import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Pool from "@/models/Pool";

// Utility function to convert 12-hour format to 24-hour format
function convert12To24Hour(time12h) {
  const [time, period] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

// Utility function to convert 24-hour format to 12-hour format
function convert24To12Hour(time24h) {
  const [hours, minutes] = time24h.split(":");
  const hour = parseInt(hours);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
}

// GET /api/bookings - Get all bookings
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const poolId = searchParams.get("poolId");
    const customerEmail = searchParams.get("customerEmail");
    const date = searchParams.get("date");
    const ownerEmail = searchParams.get("ownerEmail");

    let query = {};

    if (status) {
      query.status = status;
    }

    if (poolId) {
      query.poolId = poolId;
    }

    if (customerEmail) {
      query.customerEmail = customerEmail;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    // If filtering by ownerEmail, find pools for that owner and filter bookings by those poolIds
    if (ownerEmail) {
      const pools = await Pool.find({ "owner.email": ownerEmail }, { _id: 1 });
      const poolIds = pools.map((pool) => pool._id);
      query.poolId = { $in: poolIds };
    }

    const bookings = await Booking.find(query)
      .populate("poolId", "name location")
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "poolId",
      "customerName",
      "customerEmail",
      "customerPhone",
      "date",
      "time",
      "duration",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if pool exists
    const pool = await Pool.findById(body.poolId);
    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    // Validate share link expiry if booking is from share link
    if (body.fromShareLink && pool.linkExpiry) {
      const bookingDate = new Date(body.date);
      const linkExpiry = new Date(pool.linkExpiry);

      // Allow booking for the entire day if link expires on that day
      // Compare just the date part (year, month, day) to allow full day booking
      const linkExpiryDate = new Date(
        linkExpiry.getFullYear(),
        linkExpiry.getMonth(),
        linkExpiry.getDate()
      );
      const bookingDateOnly = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate()
      );

      if (bookingDateOnly > linkExpiryDate) {
        return NextResponse.json(
          { error: "Booking date is outside the share link validity period" },
          { status: 400 }
        );
      }
    }

    // Check for booking conflicts
    const bookingDate = new Date(body.date);

    // Convert 12-hour format to 24-hour format for processing
    const time24h = convert12To24Hour(body.time);
    const startTime = new Date(bookingDate);
    startTime.setHours(
      parseInt(time24h.split(":")[0]),
      parseInt(time24h.split(":")[1]),
      0
    );

    const endTime = new Date(
      startTime.getTime() + body.duration * 60 * 60 * 1000
    );

    // For conflict checking, we need to convert existing bookings to 24-hour format for comparison
    const conflictingBooking = await Booking.findOne({
      poolId: body.poolId,
      date: {
        $gte: bookingDate,
        $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { $nin: ["Cancelled"] },
    });

    // Check for conflicts manually since we need to handle 12-hour format conversion
    if (conflictingBooking) {
      const existingTime24h = convert12To24Hour(conflictingBooking.time);
      const newTime24h = convert12To24Hour(body.time);

      const existingStart =
        parseInt(existingTime24h.split(":")[0]) * 60 +
        parseInt(existingTime24h.split(":")[1]);
      const existingEnd = existingStart + conflictingBooking.duration * 60;
      const newStart =
        parseInt(newTime24h.split(":")[0]) * 60 +
        parseInt(newTime24h.split(":")[1]);
      const newEnd = newStart + body.duration * 60;

      // Check if there's an overlap
      if (newStart < existingEnd && newEnd > existingStart) {
        return NextResponse.json(
          { error: "Time slot is already booked" },
          { status: 409 }
        );
      }
    }

    const booking = new Booking({
      poolId: body.poolId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      date: bookingDate,
      time: body.time,
      duration: body.duration,
      guests: body.guests,
      notes: body.notes,
      createdBy: body.createdBy || "customer",
      adminId: body.adminId,
      fromShareLink: body.fromShareLink || false,
    });

    const savedBooking = await booking.save();

    // Update pool statistics
    await Pool.findByIdAndUpdate(body.poolId, {
      $inc: {
        totalBookings: 1,
      },
    });

    const populatedBooking = await Booking.findById(savedBooking._id).populate(
      "poolId",
      "name location"
    );

    return NextResponse.json(populatedBooking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
