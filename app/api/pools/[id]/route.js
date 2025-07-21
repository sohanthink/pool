import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pool from "@/models/Pool";

// GET /api/pools/[id] - Get pool by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const pool = await Pool.findById(params.id);

    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    return NextResponse.json(pool);
  } catch (error) {
    console.error("Error fetching pool:", error);
    return NextResponse.json(
      { error: "Failed to fetch pool" },
      { status: 500 }
    );
  }
}

// PUT /api/pools/[id] - Update pool
export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const body = await request.json();

    const pool = await Pool.findById(params.id);

    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    // Update fields
    Object.keys(body).forEach((key) => {
      if (key !== "_id" && key !== "__v") {
        pool[key] = body[key];
      }
    });

    const updatedPool = await pool.save();

    return NextResponse.json(updatedPool);
  } catch (error) {
    console.error("Error updating pool:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update pool" },
      { status: 500 }
    );
  }
}

// DELETE /api/pools/[id] - Delete pool
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const pool = await Pool.findById(params.id);

    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    await Pool.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: "Pool deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting pool:", error);
    return NextResponse.json(
      { error: "Failed to delete pool" },
      { status: 500 }
    );
  }
}
