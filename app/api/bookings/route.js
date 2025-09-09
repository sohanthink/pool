import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Pool from "@/models/Pool";
import Tennis from "@/models/Tennis";
import Pickleball from "@/models/Pickleball";

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
    const tennisCourtId = searchParams.get("tennisCourtId");
    const pickleballCourtId = searchParams.get("pickleballCourtId");
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

    if (tennisCourtId) {
      query.tennisCourtId = tennisCourtId;
    }

    if (pickleballCourtId) {
      query.pickleballCourtId = pickleballCourtId;
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

    // If filtering by ownerEmail, find pools, tennis courts, and pickleball courts for that owner and filter bookings
    if (ownerEmail) {
      const pools = await Pool.find({ "owner.email": ownerEmail }, { _id: 1 });
      const tennisCourts = await Tennis.find(
        { "owner.email": ownerEmail },
        { _id: 1 }
      );
      const pickleballCourts = await Pickleball.find(
        { "owner.email": ownerEmail },
        { _id: 1 }
      );
      const poolIds = pools.map((pool) => pool._id);
      const tennisCourtIds = tennisCourts.map((court) => court._id);
      const pickleballCourtIds = pickleballCourts.map((court) => court._id);

      query.$or = [
        { poolId: { $in: poolIds } },
        { tennisCourtId: { $in: tennisCourtIds } },
        { pickleballCourtId: { $in: pickleballCourtIds } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate("poolId", "name location")
      .populate("tennisCourtId", "name location")
      .populate("pickleballCourtId", "name location")
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
      "customerName",
      "customerEmail",
      "customerPhone",
      "date",
      "time",
      "duration",
    ];

    // Check if either poolId, tennisCourtId, or pickleballCourtId is provided
    if (!body.poolId && !body.tennisCourtId && !body.pickleballCourtId) {
      return NextResponse.json(
        {
          error:
            "Either poolId, tennisCourtId, or pickleballCourtId is required",
        },
        { status: 400 }
      );
    }

    // Ensure only one venue type is provided
    const venueCount = [
      body.poolId,
      body.tennisCourtId,
      body.pickleballCourtId,
    ].filter(Boolean).length;
    if (venueCount > 1) {
      return NextResponse.json(
        { error: "Only one venue type should be provided" },
        { status: 400 }
      );
    }

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if pool or tennis court exists and validate share link
    let pool = null;
    let tennisCourt = null;
    let pickleballCourt = null;
    let linkExpiry = null;

    if (body.poolId) {
      pool = await Pool.findById(body.poolId);
      if (!pool) {
        return NextResponse.json({ error: "Pool not found" }, { status: 404 });
      }
      linkExpiry = pool.linkExpiry;
    } else if (body.tennisCourtId) {
      tennisCourt = await Tennis.findById(body.tennisCourtId);
      if (!tennisCourt) {
        return NextResponse.json(
          { error: "Tennis court not found" },
          { status: 404 }
        );
      }
      linkExpiry = tennisCourt.linkExpiry;
    } else if (body.pickleballCourtId) {
      pickleballCourt = await Pickleball.findById(body.pickleballCourtId);
      if (!pickleballCourt) {
        return NextResponse.json(
          { error: "Pickleball court not found" },
          { status: 404 }
        );
      }
      linkExpiry = pickleballCourt.linkExpiry;
    }

    // Validate booking link if booking is from a booking link
    if (body.fromBookingLink) {
      const venue = pool || tennisCourt || pickleballCourt;
      if (
        !venue.isBookingLinkActive ||
        !venue.bookingToken ||
        !venue.bookingLinkExpiry
      ) {
        return NextResponse.json(
          { error: "Booking link is not active or has expired" },
          { status: 400 }
        );
      }

      // Check if booking link has expired
      const now = new Date();
      const bookingLinkExpiry = new Date(venue.bookingLinkExpiry);
      if (now > bookingLinkExpiry) {
        return NextResponse.json(
          { error: "Booking link has expired" },
          { status: 400 }
        );
      }
    }

    // Validate share link expiry if booking is from share link
    if (body.fromShareLink && linkExpiry) {
      const bookingDate = new Date(body.date);
      const linkExpiryDate = new Date(linkExpiry);

      // Allow booking for the entire day if link expires on that day
      // Compare just the date part (year, month, day) to allow full day booking
      const linkExpiryDateOnly = new Date(
        linkExpiryDate.getFullYear(),
        linkExpiryDate.getMonth(),
        linkExpiryDate.getDate()
      );
      const bookingDateOnly = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate()
      );

      if (bookingDateOnly > linkExpiryDateOnly) {
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
    const conflictQuery = {
      date: {
        $gte: bookingDate,
        $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { $nin: ["Cancelled"] },
    };

    if (body.poolId) {
      conflictQuery.poolId = body.poolId;
    } else if (body.tennisCourtId) {
      conflictQuery.tennisCourtId = body.tennisCourtId;
    } else if (body.pickleballCourtId) {
      conflictQuery.pickleballCourtId = body.pickleballCourtId;
    }

    const conflictingBooking = await Booking.findOne(conflictQuery);

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

    const bookingData = {
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      date: bookingDate,
      time: body.time,
      duration: body.duration,
      guests: body.guests,
      notes: body.notes,
      status: "Confirmed", // All bookings are automatically confirmed
      createdBy: body.createdBy || "customer",
      adminId: body.adminId,
      fromShareLink: body.fromShareLink || false,
      price: body.price || 0,
      totalPrice: body.totalPrice || 0,
    };

    if (body.poolId) {
      bookingData.poolId = body.poolId;
    } else if (body.tennisCourtId) {
      bookingData.tennisCourtId = body.tennisCourtId;
    } else if (body.pickleballCourtId) {
      bookingData.pickleballCourtId = body.pickleballCourtId;
    }

    console.log("Creating booking with data:", bookingData);

    const booking = new Booking(bookingData);

    const savedBooking = await booking.save();

    // Update pool, tennis court, or pickleball court statistics and deactivate booking link
    if (body.poolId) {
      await Pool.findByIdAndUpdate(body.poolId, {
        $inc: {
          totalBookings: 1,
        },
        // Deactivate booking link after successful booking (single-use)
        isBookingLinkActive: false,
        bookingToken: null,
        bookingLinkExpiry: null,
        bookingPrice: 0,
      });
    } else if (body.tennisCourtId) {
      await Tennis.findByIdAndUpdate(body.tennisCourtId, {
        $inc: {
          totalBookings: 1,
        },
        // Deactivate booking link after successful booking (single-use)
        isBookingLinkActive: false,
        bookingToken: null,
        bookingLinkExpiry: null,
        bookingPrice: 0,
      });
    } else if (body.pickleballCourtId) {
      await Pickleball.findByIdAndUpdate(body.pickleballCourtId, {
        $inc: {
          totalBookings: 1,
        },
        // Deactivate booking link after successful booking (single-use)
        isBookingLinkActive: false,
        bookingToken: null,
        bookingLinkExpiry: null,
        bookingPrice: 0,
      });
    }

    // Populate the booking with the appropriate reference
    let populatedBooking;
    if (body.poolId) {
      populatedBooking = await Booking.findById(savedBooking._id).populate(
        "poolId",
        "name location"
      );
    } else if (body.tennisCourtId) {
      populatedBooking = await Booking.findById(savedBooking._id).populate(
        "tennisCourtId",
        "name location"
      );
    } else if (body.pickleballCourtId) {
      populatedBooking = await Booking.findById(savedBooking._id).populate(
        "pickleballCourtId",
        "name location"
      );
    }

    return NextResponse.json(populatedBooking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);

    if (error.name === "ValidationError") {
      console.log("Validation error details:", error.errors);
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
