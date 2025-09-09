import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pool from "@/models/Pool";
import Booking from "@/models/Booking";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

// GET /api/superadmin/pools/[id] - Get pool details for superadmin
export async function GET(request, context) {
  try {
    // Check superadmin authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const params = await context.params;
    const { id } = params;

    // Validate ID format
    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ error: "Invalid pool ID" }, { status: 400 });
    }

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
    const enhancedPool = {
      ...pool.toObject(),
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      recentBookings,
    };

    return NextResponse.json(enhancedPool);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch pool" },
      { status: 500 }
    );
  }
}
