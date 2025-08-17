import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tennis from "@/models/Tennis";

export async function GET(request) {
  try {
    await dbConnect();

    // Get all tennis courts with owner information
    const courts = await Tennis.find({})
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    return NextResponse.json(courts);
  } catch (error) {
    console.error("Error fetching tennis courts:", error);
    return NextResponse.json(
      { error: "Failed to fetch tennis courts" },
      { status: 500 }
    );
  }
}
