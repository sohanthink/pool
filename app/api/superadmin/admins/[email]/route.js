import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pool from "@/models/Pool";
import Booking from "@/models/Booking";

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { email } = params;

    await dbConnect();

    // Get all pools for this admin
    const pools = await Pool.find({ "owner.email": email });

    // Get all bookings for this admin's pools
    const poolIds = pools.map((pool) => pool._id);
    const bookings = await Booking.find({ poolId: { $in: poolIds } });

    // Calculate statistics
    const totalPools = pools.length;
    const totalBookings = bookings.length;

    // Calculate booking status distribution
    const bookingStats = {
      confirmed: bookings.filter((b) => b.status === "Confirmed").length,
      // All bookings are now automatically confirmed, no pending bookings
      cancelled: bookings.filter((b) => b.status === "Cancelled").length,
    };

    // Get recent activity
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Get pool performance
    const poolStats = pools.map((pool) => {
      const poolBookings = bookings.filter(
        (b) => b.poolId.toString() === pool._id.toString()
      );

      return {
        id: pool._id,
        name: pool.name,
        location: pool.location,
        totalBookings: poolBookings.length,
        status: pool.status || "active",
        createdAt: pool.createdAt,
      };
    });

    const adminData = {
      email,
      name: pools[0]?.owner?.name || "Unknown",
      phone: pools[0]?.owner?.phone || "N/A",
      totalPools,
      totalBookings,
      bookingStats,
      pools: poolStats,
      recentBookings,
      createdAt: pools[0]?.createdAt,
      lastActive: pools[0]?.updatedAt,
    };

    return NextResponse.json(adminData);
  } catch (error) {
    console.error("Error fetching admin details:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin details" },
      { status: 500 }
    );
  }
}
