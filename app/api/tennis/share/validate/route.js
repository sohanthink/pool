import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tennis from "@/models/Tennis";

export async function POST(request) {
  try {
    const { courtId, token } = await request.json();

    if (!courtId || !token) {
      return NextResponse.json(
        { error: "Court ID and token are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const court = await Tennis.findById(courtId);
    if (!court) {
      return NextResponse.json(
        { error: "Tennis court not found" },
        { status: 404 }
      );
    }

    // Check if link is active and token matches
    if (!court.isLinkActive || court.linkToken !== token) {
      return NextResponse.json(
        { error: "Invalid or inactive link" },
        { status: 400 }
      );
    }

    // Check if link has expired
    if (court.linkExpiry && new Date() > new Date(court.linkExpiry)) {
      return NextResponse.json({ error: "Link has expired" }, { status: 410 });
    }

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
        rating: court.rating,
        amenities: court.amenities,
        images: court.images,
        linkExpiry: court.linkExpiry,
        isLinkActive: court.isLinkActive,
        linkToken: court.linkToken,
      },
    });
  } catch (error) {
    console.error("Error validating tennis court share link:", error);
    return NextResponse.json(
      { error: "Failed to validate link" },
      { status: 500 }
    );
  }
}
