import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tennis from "@/models/Tennis";

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Tennis court ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const court = await Tennis.findById(id).populate(
      "owner",
      "name email phone"
    );
    if (!court) {
      return NextResponse.json(
        { error: "Tennis court not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(court);
  } catch (error) {
    console.error("Error fetching tennis court details:", error);
    return NextResponse.json(
      { error: "Failed to fetch tennis court details" },
      { status: 500 }
    );
  }
}
