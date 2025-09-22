import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pool from "@/models/Pool";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

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

// DELETE /api/superadmin/admins/[email] - Delete user and all associated data
export async function DELETE(request, context) {
  try {
    console.log("DELETE request received");

    // Check superadmin authentication
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user);

    if (!session?.user?.id || session.user.role !== "superadmin") {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { email } = params;
    const decodedEmail = decodeURIComponent(email);
    console.log("Raw email from params:", email);
    console.log("Decoded email:", decodedEmail);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    console.log("Database connected");

    // Find the user in the User collection - try both admin and without role filter
    let user = await User.findOne({ email: decodedEmail, role: "admin" });
    console.log("User found with admin role:", user ? "Yes" : "No");

    if (!user) {
      // Try finding user without role filter
      user = await User.findOne({ email: decodedEmail });
      console.log("User found without role filter:", user ? "Yes" : "No");
      if (user) {
        console.log("User role:", user.role);
      }
    }

    // Check if user has any pools/venues even if not in User collection
    const pools = await Pool.find({ "owner.email": decodedEmail });
    console.log("Found pools for this email:", pools.length);

    if (!user && pools.length === 0) {
      console.log("User not found in database and no pools found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user doesn't exist in User collection but has pools, create a virtual user object
    if (!user && pools.length > 0) {
      console.log(
        "User not in User collection but has pools - proceeding with deletion"
      );
      user = {
        _id: null, // No User collection ID
        email: decodedEmail,
        name: pools[0]?.owner?.name || "Unknown",
        role: "admin",
      };
    }

    // Get pool IDs for deletion
    const poolIds = pools.map((pool) => pool._id);
    console.log("Pool IDs for deletion:", poolIds);

    // Count bookings before deletion for response
    const totalBookings = await Booking.countDocuments({
      poolId: { $in: poolIds },
    });
    console.log("Found bookings:", totalBookings);

    // Delete all bookings for these pools
    const deletedBookings = await Booking.deleteMany({
      poolId: { $in: poolIds },
    });
    console.log("Deleted bookings:", deletedBookings.deletedCount);

    // Delete all pools owned by this user
    const deletedPools = await Pool.deleteMany({ "owner.email": decodedEmail });
    console.log("Deleted pools:", deletedPools.deletedCount);

    // Delete tennis courts owned by this user (if any)
    const Tennis = (await import("@/models/Tennis")).default;
    const deletedTennis = await Tennis.deleteMany({
      "owner.email": decodedEmail,
    });
    console.log("Deleted tennis courts:", deletedTennis.deletedCount);

    // Delete pickleball courts owned by this user (if any)
    const Pickleball = (await import("@/models/Pickleball")).default;
    const deletedPickleball = await Pickleball.deleteMany({
      "owner.email": decodedEmail,
    });
    console.log("Deleted pickleball courts:", deletedPickleball.deletedCount);

    // Finally, delete the user (only if they exist in User collection)
    let deletedUser = null;
    if (user._id) {
      deletedUser = await User.findByIdAndDelete(user._id);
      console.log(
        "Deleted user from User collection:",
        deletedUser ? "Success" : "Failed"
      );
    } else {
      console.log("User not in User collection - skipping user deletion");
      deletedUser = { _id: null }; // Mark as "deleted" for response
    }

    return NextResponse.json({
      message: "User and all associated data deleted successfully",
      deletedData: {
        user: user.email,
        pools: pools.length,
        bookings: totalBookings,
        actualDeletions: {
          pools: deletedPools.deletedCount,
          bookings: deletedBookings.deletedCount,
          tennis: deletedTennis.deletedCount,
          pickleball: deletedPickleball.deletedCount,
          user: user._id ? (deletedUser ? 1 : 0) : 0, // Only count if user was in User collection
        },
        userInUserCollection: !!user._id,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
