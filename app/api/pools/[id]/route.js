import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pool from "@/models/Pool";
import Booking from "@/models/Booking";

// GET /api/pools/[id] - Get pool by ID
export async function GET(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const { id } = params;

    const pool = await Pool.findById(id);

    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    // Get booking statistics for this pool
    const bookings = await Booking.find({ poolId: id });
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(
      (b) => b.status === "Confirmed"
    ).length;
    // All bookings are now automatically confirmed, no pending bookings
    const cancelledBookings = bookings.filter(
      (b) => b.status === "Cancelled"
    ).length;

    // Get recent bookings (last 10)
    const recentBookings = await Booking.find({ poolId: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "customerName customerEmail date time duration guests status createdAt"
      );

    // Enhance pool data with booking statistics
    const poolObject = pool.toObject();

    const enhancedPool = {
      ...poolObject,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      recentBookings,
      // Include link fields
      linkToken: pool.linkToken,
      linkExpiry: pool.linkExpiry,
      isLinkActive: pool.isLinkActive,
      bookingToken: pool.bookingToken,
      bookingLinkExpiry: pool.bookingLinkExpiry,
      isBookingLinkActive: pool.isBookingLinkActive,
    };

    return NextResponse.json(enhancedPool);
  } catch (error) {
    console.error("Error fetching pool:", error);
    return NextResponse.json(
      { error: "Failed to fetch pool" },
      { status: 500 }
    );
  }
}

// PUT /api/pools/[id] - Update pool
export async function PUT(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    const pool = await Pool.findById(id);

    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    // Update fields
    Object.keys(body).forEach((key) => {
      if (key !== "_id" && key !== "__v") {
        pool[key] = body[key];
      }
    });

    const updatedPool = await pool.save();

    return NextResponse.json(updatedPool);
  } catch (error) {
    console.error("Error updating pool:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update pool" },
      { status: 500 }
    );
  }
}

// DELETE /api/pools/[id] - Delete pool
export async function DELETE(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const { id } = params;
    const pool = await Pool.findById(id);

    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    await Pool.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Pool deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting pool:", error);
    return NextResponse.json(
      { error: "Failed to delete pool" },
      { status: 500 }
    );
  }
}

// PATCH /api/pools/[id] - Partial update pool
export async function PATCH(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const pool = await Pool.findById(id);
    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }
    // Only update allowed fields
    const editableFields = [
      "name",
      "description",
      "location",
      "size",
      "capacity",

      "owner",
      "amenities",
      "images",
      "status",
    ];
    editableFields.forEach((field) => {
      if (body[field] !== undefined) {
        pool[field] = body[field];
      }
    });
    const updatedPool = await pool.save();
    return NextResponse.json(updatedPool);
  } catch (error) {
    console.error("Error patching pool:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update pool" },
      { status: 500 }
    );
  }
}
