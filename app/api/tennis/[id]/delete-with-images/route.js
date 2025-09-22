import { promises as fs } from "fs";
import path from "path";
import dbConnect from "@/lib/mongodb";
import Tennis from "@/models/Tennis";

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    await dbConnect();
    const court = await Tennis.findById(id);
    if (!court) {
      return new Response(JSON.stringify({ error: "Tennis court not found" }), {
        status: 404,
      });
    }

    // Delete images from public/uploads
    let deletedImages = 0;
    if (Array.isArray(court.images)) {
      for (const image of court.images) {
        if (image && typeof image === "string") {
          try {
            // Normalize image path
            const normalizedImage = image.startsWith("/uploads/")
              ? image.slice(1)
              : `uploads/${image.replace(/^\/+/, "")}`;
            const imagePath = path.join(
              process.cwd(),
              "public",
              normalizedImage
            );

            // Check if file exists before trying to delete
            try {
              await fs.access(imagePath);
              await fs.unlink(imagePath);
              deletedImages++;
            } catch (fileErr) {
              if (fileErr.code === "ENOENT") {
                console.log(
                  `Image file not found (already deleted?): ${imagePath}`
                );
              } else {
                console.error(`Error deleting image ${imagePath}:`, fileErr);
              }
            }
          } catch (err) {
            console.error(`Error processing image ${image}:`, err);
          }
        }
      }
    }

    // Delete the court from database
    await Tennis.findByIdAndDelete(id);

    console.log(
      `Tennis court ${id} deleted successfully. Deleted ${deletedImages} images.`
    );
    return new Response(
      JSON.stringify({
        message: "Tennis court and images deleted successfully",
        deletedImages,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete tennis court with images error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to delete tennis court and images",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
