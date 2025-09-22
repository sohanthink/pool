import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tennis from "@/models/Tennis";
import mongoose from "mongoose";

// POST /api/tennis/share/validate - Validate shareable link
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

    // First, let's check if the tennis court exists
    const courtExists = await Tennis.findById(objectId);

    if (!courtExists) {
      return NextResponse.json(
        {
          error: "Tennis court not found",
        },
        { status: 404 }
      );
    }

    // Find the court with the specific token
    const court = await Tennis.findOne({
      _id: objectId,
      linkToken: token,
      isLinkActive: true,
    });

    if (!court) {
      return NextResponse.json(
        {
          error: "Invalid or inactive link",
        },
        { status: 404 }
      );
    }

    // Check if link has expired
    const now = new Date();
    if (court.linkExpiry && now > court.linkExpiry) {
      // Mark link as inactive since it's expired
      court.isLinkActive = false;
      await court.save();

      return NextResponse.json(
        {
          error: "Link has expired",
        },
        { status: 410 }
      );
    }

    // Return tennis court data for the shareable view
    return NextResponse.json({
      success: true,
      court: {
        _id: court._id,
        name: court.name,
        description: court.description,
        location: court.location,
        surface: court.surface,
        type: court.type,
        price: court.price,
        amenities: court.amenities,
        images: court.images,
        rating: court.rating,
        linkExpiry: court.linkExpiry,
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
