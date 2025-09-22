import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pool from "@/models/Pool";
import mongoose from "mongoose";

// POST /api/pools/share/validate - Validate shareable link
export async function POST(request) {
  try {
    const { poolId, token } = await request.json();

    if (!poolId || !token) {
      return NextResponse.json(
        {
          error: "Pool ID and token are required",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Convert poolId to ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(poolId);
    } catch (error) {
      return NextResponse.json(
        {
          error: "Invalid pool ID format",
        },
        { status: 400 }
      );
    }

    // First, let's check if the pool exists
    const poolExists = await Pool.findById(objectId);

    if (!poolExists) {
      return NextResponse.json(
        {
          error: "Pool not found",
        },
        { status: 404 }
      );
    }

    // Find the pool with the specific token
    const pool = await Pool.findOne({
      _id: objectId,
      linkToken: token,
      isLinkActive: true,
    });

    if (!pool) {
      return NextResponse.json(
        {
          error: "Invalid or inactive link",
        },
        { status: 404 }
      );
    }

    // Check if link has expired
    const now = new Date();
    if (pool.linkExpiry && now > pool.linkExpiry) {
      // Mark link as inactive since it's expired
      pool.isLinkActive = false;
      await pool.save();

      return NextResponse.json(
        {
          error: "Link has expired",
        },
        { status: 410 }
      );
    }

    // Return pool data for the shareable view
    return NextResponse.json({
      success: true,
      pool: {
        _id: pool._id,
        name: pool.name,
        description: pool.description,
        location: pool.location,
        size: pool.size,
        capacity: pool.capacity,
        amenities: pool.amenities,
        images: pool.images,
        rating: pool.rating,
        linkExpiry: pool.linkExpiry,
      },
    });
  } catch (error) {
    console.error("Error validating shareable link:", error);
    return NextResponse.json(
      { error: "Failed to validate link" },
      { status: 500 }
    );
  }
}
