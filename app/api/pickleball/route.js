import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Pickleball from "@/models/Pickleball";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const ownerEmail = searchParams.get("ownerEmail");

    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (ownerEmail) {
      query["owner.email"] = ownerEmail;
    }

    const pickleballCourts = await Pickleball.find(query).sort({
      createdAt: -1,
    });

    return NextResponse.json(pickleballCourts);
  } catch (error) {
    console.error("Error fetching pickleball courts:", error);
    return NextResponse.json(
      { error: "Failed to fetch pickleball courts" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

            // Use owner information from form or fallback to session
        const pickleballData = {
            ...body,
            owner: {
                name: body.owner?.name || session.user.name,
                email: body.owner?.email || session.user.email,
                phone: body.owner?.phone || session.user.phone || "",
            },
        };

    const pickleball = new Pickleball(pickleballData);
    await pickleball.save();

    return NextResponse.json(pickleball, { status: 201 });
  } catch (error) {
    console.error("Error creating pickleball court:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create pickleball court" },
      { status: 500 }
    );
  }
}
