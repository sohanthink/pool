import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pool from "@/models/Pool";

// GET /api/pools - Get all pools
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

    const pools = await Pool.find(query).sort({ createdAt: -1 });

    return NextResponse.json(pools);
  } catch (error) {
    console.error("Error fetching pools:", error);
    return NextResponse.json(
      { error: "Failed to fetch pools" },
      { status: 500 }
    );
  }
}

// POST /api/pools - Create new pool
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "description",
      "location",
      "size",
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

    // Validate owner fields
    const ownerFields = ["name", "email", "phone"];
    for (const field of ownerFields) {
      if (!body.owner[field]) {
        return NextResponse.json(
          { error: `owner.${field} is required` },
          { status: 400 }
        );
      }
    }

    const pool = new Pool({
      name: body.name,
      description: body.description,
      location: body.location,
      size: body.size,
      capacity: body.capacity,
      price: body.price,
      owner: body.owner,
      amenities: body.amenities || [],
      images: body.images || [],
      availableSlots: body.availableSlots || {},
    });

    const savedPool = await pool.save();

    return NextResponse.json(savedPool, { status: 201 });
  } catch (error) {
    console.error("Error creating pool:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create pool" },
      { status: 500 }
    );
  }
}
