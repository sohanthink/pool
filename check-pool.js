import mongoose from "mongoose";
import Pool from "./models/Pool.js";

async function checkPool() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/pool-booking"
    );
    const pool = await Pool.findOne({ name: "DD Pool" });
    if (pool) {
      console.log("Pool found:", {
        name: pool.name,
        images: pool.images,
        imagesLength: pool.images ? pool.images.length : 0,
      });
    } else {
      console.log("Pool not found");
    }
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkPool();
