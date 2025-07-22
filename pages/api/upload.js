import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const form = formidable({
      multiples: false,
      uploadDir: uploadsDir,
      keepExtensions: true,
    });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: "Failed to parse form" });
        return;
      }
      let file = files.file;
      if (Array.isArray(file)) file = file[0];
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
      // Use originalFilename or fallback to newFilename or name
      const filename =
        file.originalFilename || file.newFilename || file.name || "upload";
      const ext = path.extname(filename);
      const newFilename = uuidv4() + ext;
      const newPath = path.join(uploadsDir, newFilename);
      await fs.rename(file.filepath, newPath);
      const filePath = `/uploads/${newFilename}`;
      res.status(200).json({ filePath });
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
}
