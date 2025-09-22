import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pickleball from "@/models/Pickleball";
import mongoose from "mongoose";

// POST /api/pickleball/share/validate - Validate shareable link
export async function POST(request) {
  try {
    const { courtId, token } = await request.json();

    if (!courtId || !token) {
      return NextResponse.json(
        {
          error: "Court ID and token are required",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Convert courtId to ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(courtId);
    } catch (error) {
      return NextResponse.json(
        {
          error: "Invalid court ID format",
        },
        { status: 400 }
      );
    }

    // First, let's check if the pickleball court exists
    const courtExists = await Pickleball.findById(objectId);

    if (!courtExists) {
      return NextResponse.json(
        {
          error: "Pickleball court not found",
        },
        { status: 404 }
      );
    }

    // Find the court with the specific token
    const pickleball = await Pickleball.findOne({
      _id: objectId,
      linkToken: token,
      isLinkActive: true,
    });

    if (!pickleball) {
      return NextResponse.json(
        {
          error: "Invalid or inactive link",
        },
        { status: 404 }
      );
    }

    // Check if link has expired
    const now = new Date();
    if (pickleball.linkExpiry && now > pickleball.linkExpiry) {
      // Mark link as inactive since it's expired
      pickleball.isLinkActive = false;
      await pickleball.save();

      return NextResponse.json(
        {
          error: "Link has expired",
        },
        { status: 410 }
      );
    }

    // Return pickleball court data for the shareable view
    return NextResponse.json({
      success: true,
      pickleball: {
        _id: pickleball._id,
        name: pickleball.name,
        description: pickleball.description,
        location: pickleball.location,
        surface: pickleball.surface,
        type: pickleball.type,
        price: pickleball.price,
        amenities: pickleball.amenities,
        images: pickleball.images,
        rating: pickleball.rating,
        linkExpiry: pickleball.linkExpiry,
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
