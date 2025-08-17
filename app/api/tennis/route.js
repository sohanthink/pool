import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tennis from "@/models/Tennis";

// GET /api/tennis - Get all tennis courts
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const ownerEmail = searchParams.get("ownerEmail");

    let query = {};

    if (status) {
      query.status = status;
    }

    if (ownerEmail) {
      query["owner.email"] = ownerEmail;
    }

    const tennisCourts = await Tennis.find(query).sort({ createdAt: -1 });

    return NextResponse.json(tennisCourts);
  } catch (error) {
    console.error("Error fetching tennis courts:", error);
    return NextResponse.json(
      { error: "Failed to fetch tennis courts" },
      { status: 500 }
    );
  }
}

// POST /api/tennis - Create new tennis court
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "description",
      "location",
      "surface",
      "type",
      "capacity",
      "price",
      "owner",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const tennisCourt = new Tennis({
      name: body.name,
      description: body.description,
      location: body.location,
      surface: body.surface,
      type: body.type,
      capacity: body.capacity,
      price: body.price,
      owner: body.owner,
      amenities: body.amenities || [],
      images: body.images || [],
      status: body.status || "Active",
    });

    const savedTennisCourt = await tennisCourt.save();

    return NextResponse.json(savedTennisCourt, { status: 201 });
  } catch (error) {
    console.error("Error creating tennis court:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create tennis court" },
      { status: 500 }
    );
  }
}
