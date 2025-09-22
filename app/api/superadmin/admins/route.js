import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pool from "@/models/Pool";

export async function GET() {
  try {
    await dbConnect();

    // Get all pools and group by owner email to identify unique admins
    const pools = await Pool.find({});

    // Create a map of unique admins with their pool information
    const adminMap = new Map();

    pools.forEach((pool) => {
      const ownerEmail = pool.owner?.email;

      if (!ownerEmail) return; // Skip pools without owner email

      if (!adminMap.has(ownerEmail)) {
        adminMap.set(ownerEmail, {
          email: ownerEmail,
          name: pool.owner?.name || "Unknown",
          phone: pool.owner?.phone || "N/A",
          totalPools: 0,
          totalBookings: 0,

          pools: [],
          createdAt: pool.createdAt,
          lastActive: pool.updatedAt,
        });
      }

      const admin = adminMap.get(ownerEmail);
      admin.totalPools += 1;
      admin.pools.push({
        id: pool._id,
        name: pool.name,
        location: pool.location,
        status: pool.status || "active",
      });

      // Update last active date
      if (pool.updatedAt > admin.lastActive) {
        admin.lastActive = pool.updatedAt;
      }
    });

    // Convert map to array and sort by creation date
    const admins = Array.from(adminMap.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return NextResponse.json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch admins", details: error.message },
      { status: 500 }
    );
  }
}
