import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json();
    if (!body.status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    ).populate("poolId", "name location");
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  }
}
