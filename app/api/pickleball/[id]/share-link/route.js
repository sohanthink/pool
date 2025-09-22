import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pickleball from "@/models/Pickleball";
import crypto from "crypto";

// POST /api/pickleball/[id]/share-link - Generate or update shareable link
export async function POST(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Pickleball court ID is required" },
        { status: 400 }
      );
    }

    const { expiryHours = 24 } = await request.json();

    await dbConnect();

    const pickleball = await Pickleball.findById(id);
    if (!pickleball) {
      return NextResponse.json(
        { error: "Pickleball court not found" },
        { status: 404 }
      );
    }

    // Generate a unique token for the link
    const linkToken = crypto.randomBytes(32).toString("hex");

    // Calculate expiry date
    const linkExpiry = new Date();
    linkExpiry.setHours(linkExpiry.getHours() + parseInt(expiryHours));

    // Update pickleball court with link information using findOneAndUpdate
    const updatedPickleball = await Pickleball.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          linkToken: linkToken,
          linkExpiry: linkExpiry,
          isLinkActive: true,
        },
      },
      { new: true, runValidators: true, upsert: false }
    );

    console.log(
      "Pickleball court updated successfully:",
      updatedPickleball.name
    );

    return NextResponse.json({
      isLinkActive: updatedPickleball.isLinkActive,
      linkToken: updatedPickleball.linkToken,
      linkExpiry: updatedPickleball.linkExpiry,
    });

    // Generate the shareable URL
    const shareableUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/pickleball/${pickleball._id}/share/${linkToken}`;

    return NextResponse.json({
      success: true,
      shareableUrl,
      linkExpiry: updatedPickleball.linkExpiry,
      expiryHours: parseInt(expiryHours),
    });
  } catch (error) {
    console.error("Error generating shareable link:", error);
    return NextResponse.json(
      { error: "Failed to generate shareable link" },
      { status: 500 }
    );
  }
}

// DELETE /api/pickleball/[id]/share-link - Deactivate shareable link
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Pickleball court ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const pickleball = await Pickleball.findById(id);
    if (!pickleball) {
      return NextResponse.json(
        { error: "Pickleball court not found" },
        { status: 404 }
      );
    }

    // Deactivate the link
    pickleball.isLinkActive = false;
    pickleball.linkToken = null;
    pickleball.linkExpiry = null;

    await pickleball.save();

    return NextResponse.json({
      success: true,
      message: "Shareable link deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating shareable link:", error);
    return NextResponse.json(
      { error: "Failed to deactivate shareable link" },
      { status: 500 }
    );
  }
}
