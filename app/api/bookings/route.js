import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Pool from "@/models/Pool";

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

    // Check for booking conflicts
    const bookingDate = new Date(body.date);
    const startTime = new Date(bookingDate);
    startTime.setHours(
      parseInt(body.time.split(":")[0]),
      parseInt(body.time.split(":")[1]),
      0
    );

    const endTime = new Date(
      startTime.getTime() + body.duration * 60 * 60 * 1000
    );

    const conflictingBooking = await Booking.findOne({
      poolId: body.poolId,
      date: {
        $gte: bookingDate,
        $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { $nin: ["Cancelled"] },
      $or: [
        {
          time: { $lt: endTime.toTimeString().slice(0, 5) },
          $expr: {
            $gt: [
              {
                $add: [
                  {
                    $multiply: [{ $toInt: { $substr: ["$time", 0, 2] } }, 3600],
                  },
                  { $multiply: [{ $toInt: { $substr: ["$time", 3, 2] } }, 60] },
                  { $multiply: ["$duration", 3600] },
                ],
              },
              {
                $add: [
                  {
                    $multiply: [
                      { $toInt: { $substr: [body.time, 0, 2] } },
                      3600,
                    ],
                  },
                  {
                    $multiply: [{ $toInt: { $substr: [body.time, 3, 2] } }, 60],
                  },
                ],
              },
            ],
          },
        },
        {
          time: { $gte: body.time },
          $expr: {
            $lt: [
              {
                $add: [
                  {
                    $multiply: [{ $toInt: { $substr: ["$time", 0, 2] } }, 3600],
                  },
                  { $multiply: [{ $toInt: { $substr: ["$time", 3, 2] } }, 60] },
                ],
              },
              {
                $add: [
                  {
                    $multiply: [
                      { $toInt: { $substr: [body.time, 0, 2] } },
                      3600,
                    ],
                  },
                  {
                    $multiply: [{ $toInt: { $substr: [body.time, 3, 2] } }, 60],
                  },
                  { $multiply: [body.duration, 3600] },
                ],
              },
            ],
          },
        },
      ],
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "Time slot is already booked" },
        { status: 409 }
      );
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
