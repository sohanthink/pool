import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tennis from "@/models/Tennis";
import crypto from "crypto";

// POST /api/tennis/[id]/booking-link - Generate or update booking link
export async function POST(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Tennis court ID is required" },
        { status: 400 }
      );
    }

    const { expiryHours = 24 } = await request.json();

    await dbConnect();

    const court = await Tennis.findById(id);
    if (!court) {
      return NextResponse.json(
        { error: "Tennis court not found" },
        { status: 404 }
      );
    }

    // Generate a unique token for the booking link
    const bookingToken = crypto.randomBytes(32).toString("hex");

    // Calculate expiry date
    const bookingLinkExpiry = new Date();
    bookingLinkExpiry.setHours(
      bookingLinkExpiry.getHours() + parseInt(expiryHours)
    );

    // Update court with booking link information
    court.bookingToken = bookingToken;
    court.bookingLinkExpiry = bookingLinkExpiry;
    court.isBookingLinkActive = true;

    await court.save();

    // Generate the booking URL
    const bookingUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/tennis/${court._id}/book?token=${bookingToken}`;

    return NextResponse.json({
      success: true,
      bookingUrl,
      bookingLinkExpiry: court.bookingLinkExpiry,
      expiryHours: parseInt(expiryHours),
    });
  } catch (error) {
    console.error("Error generating booking link:", error);
    return NextResponse.json(
      { error: "Failed to generate booking link" },
      { status: 500 }
    );
  }
}

// DELETE /api/tennis/[id]/booking-link - Deactivate booking link
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Tennis court ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const court = await Tennis.findById(id);
    if (!court) {
      return NextResponse.json(
        { error: "Tennis court not found" },
        { status: 404 }
      );
    }

    // Deactivate the booking link
    court.isBookingLinkActive = false;
    court.bookingToken = null;
    court.bookingLinkExpiry = null;

    await court.save();

    return NextResponse.json({
      success: true,
      message: "Booking link deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating booking link:", error);
    return NextResponse.json(
      { error: "Failed to deactivate booking link" },
      { status: 500 }
    );
  }
}
