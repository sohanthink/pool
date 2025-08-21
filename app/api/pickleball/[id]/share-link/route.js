import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Pickleball from "@/models/Pickleball";
import crypto from "crypto";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { expiryDays = 7 } = body;

    const pickleball = await Pickleball.findById(id);
    if (!pickleball) {
      return NextResponse.json(
        { error: "Pickleball court not found" },
        { status: 404 }
      );
    }

    // Check if the user owns this pickleball court
    if (pickleball.owner.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a unique token
    const linkToken = crypto.randomBytes(32).toString("hex");
    const linkExpiry = new Date();
    linkExpiry.setDate(linkExpiry.getDate() + expiryDays);

    // Update the pickleball court with link information
    const updatedPickleball = await Pickleball.findByIdAndUpdate(
      id,
      {
        linkToken,
        linkExpiry,
        isLinkActive: true,
      },
      { new: true }
    );

    return NextResponse.json({
      linkToken,
      linkExpiry,
      shareUrl: `${process.env.NEXTAUTH_URL}/pickleball/${id}/share/${linkToken}`,
    });
  } catch (error) {
    console.error("Error generating share link:", error);
    return NextResponse.json(
      { error: "Failed to generate share link" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const pickleball = await Pickleball.findById(id);
    if (!pickleball) {
      return NextResponse.json(
        { error: "Pickleball court not found" },
        { status: 404 }
      );
    }

    // Check if the user owns this pickleball court
    if (pickleball.owner.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Deactivate the share link
    const updatedPickleball = await Pickleball.findByIdAndUpdate(
      id,
      {
        linkToken: null,
        linkExpiry: null,
        isLinkActive: false,
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Share link deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating share link:", error);
    return NextResponse.json(
      { error: "Failed to deactivate share link" },
      { status: 500 }
    );
  }
}
