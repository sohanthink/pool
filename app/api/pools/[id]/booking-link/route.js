import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pool from "@/models/Pool";
import crypto from "crypto";

// POST /api/pools/[id]/booking-link - Generate or update booking link
export async function POST(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Pool ID is required" },
        { status: 400 }
      );
    }

    const { expiryHours = 24 } = await request.json();

    await dbConnect();

    const pool = await Pool.findById(id);
    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    // Generate a unique token for the booking link
    const bookingToken = crypto.randomBytes(32).toString("hex");

    // Calculate expiry date
    const bookingLinkExpiry = new Date();
    bookingLinkExpiry.setHours(
      bookingLinkExpiry.getHours() + parseInt(expiryHours)
    );

    // Update pool with booking link information
    pool.bookingToken = bookingToken;
    pool.bookingLinkExpiry = bookingLinkExpiry;
    pool.isBookingLinkActive = true;

    await pool.save();

    // Generate the booking URL
    const bookingUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/pool/${pool._id}/book?token=${bookingToken}`;

    return NextResponse.json({
      success: true,
      bookingUrl,
      bookingLinkExpiry: pool.bookingLinkExpiry,
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

// DELETE /api/pools/[id]/booking-link - Deactivate booking link
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Pool ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const pool = await Pool.findById(id);
    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    // Deactivate the booking link
    pool.isBookingLinkActive = false;
    pool.bookingToken = null;
    pool.bookingLinkExpiry = null;

    await pool.save();

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
