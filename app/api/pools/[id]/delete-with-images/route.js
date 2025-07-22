import { promises as fs } from "fs";
import path from "path";
import dbConnect from "@/lib/mongodb";
import Pool from "@/models/Pool";

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    await dbConnect();
    const pool = await Pool.findById(id);
    if (!pool) {
      return new Response(JSON.stringify({ error: "Pool not found" }), {
        status: 404,
      });
    }
    // Delete images from public/uploads
    if (Array.isArray(pool.images)) {
      for (const image of pool.images) {
        if (image && typeof image === "string") {
          const imagePath = path.join(
            process.cwd(),
            "public",
            image.startsWith("/uploads/")
              ? image.slice(1)
              : `uploads/${image.replace(/^\/+/, "")}`
          );
          try {
            await fs.unlink(imagePath);
          } catch (err) {
            // Ignore if file does not exist
          }
        }
      }
    }
    await Pool.findByIdAndDelete(id);
    return new Response(
      JSON.stringify({ message: "Pool and images deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete pool with images error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete pool and images" }),
      { status: 500 }
    );
  }
}
