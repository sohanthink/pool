import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pool from "@/models/Pool";
import Booking from "@/models/Booking";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET /api/superadmin/pools - Get all pools for superadmin
export async function GET(request) {
  try {
    // Check superadmin authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get all pools
    const pools = await Pool.find({}).sort({ createdAt: -1 });

    // Get booking statistics for each pool
    const poolsWithStats = await Promise.all(
      pools.map(async (pool) => {
        const bookings = await Booking.find({ poolId: pool._id });
        const totalBookings = bookings.length;

        return {
          ...pool.toObject(),
          totalBookings,
        };
      })
    );

    return NextResponse.json(poolsWithStats);
  } catch (error) {
    console.error("Error fetching pools for superadmin:", error);
    return NextResponse.json(
      { error: "Failed to fetch pools" },
      { status: 500 }
    );
  }
}
