import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pickleball from "@/models/Pickleball";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");
    const token = searchParams.get("token");

    if (!courtId || !token) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const pickleball = await Pickleball.findById(courtId);
    if (!pickleball) {
      return NextResponse.json(
        { error: "Pickleball court not found" },
        { status: 404 }
      );
    }

    // Check if the share link is active and valid
    if (!pickleball.isLinkActive || pickleball.linkToken !== token) {
      return NextResponse.json(
        { error: "Invalid or inactive share link" },
        { status: 400 }
      );
    }

    // Check if the link has expired
    if (pickleball.linkExpiry && new Date() > new Date(pickleball.linkExpiry)) {
      return NextResponse.json(
        { error: "Share link has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({ pickleball });
  } catch (error) {
    console.error("Error validating share link:", error);
    return NextResponse.json(
      { error: "Failed to validate share link" },
      { status: 500 }
    );
  }
}
