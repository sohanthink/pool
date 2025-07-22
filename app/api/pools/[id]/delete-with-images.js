import { promises as fs } from "fs";
import path from "path";
import dbConnect from "@/lib/mongodb";
import Pool from "@/models/Pool";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { id } = req.query;
  try {
    await dbConnect();
    const pool = await Pool.findById(id);
    if (!pool) {
      res.status(404).json({ error: "Pool not found" });
      return;
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
    res.status(200).json({ message: "Pool and images deleted successfully" });
  } catch (error) {
    console.error("Delete pool with images error:", error);
    res.status(500).json({ error: "Failed to delete pool and images" });
  }
}
