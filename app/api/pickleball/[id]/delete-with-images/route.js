import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Pickleball from "@/models/Pickleball";
import fs from "fs";
import path from "path";

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

    // Delete associated images from the filesystem
    if (pickleball.images && pickleball.images.length > 0) {
      for (const imageUrl of pickleball.images) {
        try {
          // Extract filename from URL
          const filename = imageUrl.split("/").pop();
          const imagePath = path.join(
            process.cwd(),
            "public",
            "uploads",
            filename
          );

          // Check if file exists and delete it
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (error) {
          console.error(`Error deleting image ${imageUrl}:`, error);
          // Continue with deletion even if image deletion fails
        }
      }
    }

    // Delete the pickleball court from database
    await Pickleball.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Pickleball court deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pickleball court:", error);
    return NextResponse.json(
      { error: "Failed to delete pickleball court" },
      { status: 500 }
    );
  }
}
