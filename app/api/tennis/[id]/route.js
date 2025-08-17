import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tennis from "@/models/Tennis";
import Booking from "@/models/Booking";

// GET /api/tennis/[id] - Get tennis court by ID
export async function GET(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const { id } = params;
    const tennisCourt = await Tennis.findById(id);

    if (!tennisCourt) {
      return NextResponse.json(
        { error: "Tennis court not found" },
        { status: 404 }
      );
    }

    // Get booking statistics for this tennis court
    const bookings = await Booking.find({ tennisCourtId: id });
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(
      (b) => b.status === "Confirmed"
    ).length;
    const pendingBookings = bookings.filter(
      (b) => b.status === "Pending"
    ).length;
    const cancelledBookings = bookings.filter(
      (b) => b.status === "Cancelled"
    ).length;

    // Get recent bookings (last 10)
    const recentBookings = await Booking.find({ tennisCourtId: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "customerName customerEmail date time duration guests status createdAt"
      );

    // Enhance tennis court data with booking statistics
    const enhancedTennisCourt = {
      ...tennisCourt.toObject(),
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      recentBookings,
      // Include link fields for debugging
      linkToken: tennisCourt.linkToken,
      linkExpiry: tennisCourt.linkExpiry,
      isLinkActive: tennisCourt.isLinkActive,
      bookingToken: tennisCourt.bookingToken,
      bookingLinkExpiry: tennisCourt.bookingLinkExpiry,
      isBookingLinkActive: tennisCourt.isBookingLinkActive,
    };

    return NextResponse.json(enhancedTennisCourt);
  } catch (error) {
    console.error("Error fetching tennis court:", error);
    return NextResponse.json(
      { error: "Failed to fetch tennis court" },
      { status: 500 }
    );
  }
}

// PUT /api/tennis/[id] - Update tennis court
export async function PUT(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    const tennisCourt = await Tennis.findById(id);

    if (!tennisCourt) {
      return NextResponse.json(
        { error: "Tennis court not found" },
        { status: 404 }
      );
    }

    // Update fields
    Object.keys(body).forEach((key) => {
      if (key !== "_id" && key !== "__v") {
        tennisCourt[key] = body[key];
      }
    });

    const updatedTennisCourt = await tennisCourt.save();

    return NextResponse.json(updatedTennisCourt);
  } catch (error) {
    console.error("Error updating tennis court:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update tennis court" },
      { status: 500 }
    );
  }
}

// DELETE /api/tennis/[id] - Delete tennis court
export async function DELETE(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const { id } = params;
    const tennisCourt = await Tennis.findById(id);

    if (!tennisCourt) {
      return NextResponse.json(
        { error: "Tennis court not found" },
        { status: 404 }
      );
    }

    await Tennis.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Tennis court deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting tennis court:", error);
    return NextResponse.json(
      { error: "Failed to delete tennis court" },
      { status: 500 }
    );
  }
}

// PATCH /api/tennis/[id] - Partial update tennis court
export async function PATCH(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const tennisCourt = await Tennis.findById(id);
    if (!tennisCourt) {
      return NextResponse.json(
        { error: "Tennis court not found" },
        { status: 404 }
      );
    }
    // Only update allowed fields
    const editableFields = [
      "name",
      "description",
      "location",
      "surface",
      "type",
      "capacity",
      "price",
      "owner",
      "amenities",
      "images",
      "status",
    ];
    editableFields.forEach((field) => {
      if (body[field] !== undefined) {
        tennisCourt[field] = body[field];
      }
    });
    const updatedTennisCourt = await tennisCourt.save();
    return NextResponse.json(updatedTennisCourt);
  } catch (error) {
    console.error("Error patching tennis court:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update tennis court" },
      { status: 500 }
    );
  }
}
