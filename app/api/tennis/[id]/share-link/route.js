import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tennis from "@/models/Tennis";
import crypto from "crypto";

// POST /api/tennis/[id]/share-link - Generate or update shareable link
export async function POST(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    console.log("Generating share link for tennis court:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Tennis court ID is required" },
        { status: 400 }
      );
    }

    const { expiryHours = 24 } = await request.json();
    console.log("Expiry hours:", expiryHours);

    await dbConnect();

    const court = await Tennis.findById(id);
    if (!court) {
      return NextResponse.json(
        { error: "Tennis court not found" },
        { status: 404 }
      );
    }

    console.log("Found tennis court:", court.name);

    // Generate a unique token for the link
    const linkToken = crypto.randomBytes(32).toString("hex");
    console.log("Generated token:", linkToken);

    // Calculate expiry date
    const linkExpiry = new Date();
    linkExpiry.setHours(linkExpiry.getHours() + parseInt(expiryHours));
    console.log("Expiry date:", linkExpiry);

    // Update court with link information using findOneAndUpdate
    const updatedCourt = await Tennis.findOneAndUpdate(
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

    console.log("Tennis court updated successfully:", updatedCourt.name);
    console.log("Updated court link status:", {
      isLinkActive: updatedCourt.isLinkActive,
      linkToken: updatedCourt.linkToken,
      linkExpiry: updatedCourt.linkExpiry,
    });

    // Generate the shareable URL
    const shareableUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/tennis/${court._id}/share/${linkToken}`;
    console.log("Shareable URL:", shareableUrl);

    return NextResponse.json({
      success: true,
      shareableUrl,
      linkExpiry: updatedCourt.linkExpiry,
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

// DELETE /api/tennis/[id]/share-link - Deactivate shareable link
export async function DELETE(request, context) {
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

    const court = await Tennis.findById(id);
    if (!court) {
      return NextResponse.json(
        { error: "Tennis court not found" },
        { status: 404 }
      );
    }

    // Deactivate the link
    court.isLinkActive = false;
    court.linkToken = null;
    court.linkExpiry = null;

    await court.save();

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
