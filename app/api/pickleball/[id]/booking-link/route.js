import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Pickleball from "@/models/Pickleball";
import crypto from "crypto";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { expiryHours = 24, price = 0 } = body;

    const pickleball = await Pickleball.findById(id);
    if (!pickleball) {
      return NextResponse.json(
        { error: "Pickleball court not found" },
        { status: 404 }
      );
    }

    // Check if the user owns this pickleball court
    if (pickleball.owner.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a unique token
    const bookingToken = crypto.randomBytes(32).toString("hex");
    const bookingLinkExpiry = new Date();
    bookingLinkExpiry.setHours(bookingLinkExpiry.getHours() + expiryHours);

    // Update the pickleball court with booking link information
    const updatedPickleball = await Pickleball.findByIdAndUpdate(
      id,
      {
        bookingToken,
        bookingLinkExpiry,
        isBookingLinkActive: true,
        bookingPrice: parseFloat(price) || 0,
      },
      { new: true }
    );

    return NextResponse.json({
      bookingToken,
      bookingLinkExpiry,
      bookingUrl: `${process.env.NEXTAUTH_URL}/pickleball/${id}/book?token=${bookingToken}`,
      price: parseFloat(price) || 0,
    });
  } catch (error) {
    console.error("Error generating booking link:", error);
    return NextResponse.json(
      { error: "Failed to generate booking link" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const pickleball = await Pickleball.findById(id);
    if (!pickleball) {
      return NextResponse.json(
        { error: "Pickleball court not found" },
        { status: 404 }
      );
    }

    // Check if the user owns this pickleball court
    if (pickleball.owner.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Deactivate the booking link
    const updatedPickleball = await Pickleball.findByIdAndUpdate(
      id,
      {
        bookingToken: null,
        bookingLinkExpiry: null,
        isBookingLinkActive: false,
        bookingPrice: 0,
      },
      { new: true }
    );

    return NextResponse.json({
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
