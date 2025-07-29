const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return this.role === "superadmin";
      },
    },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
    googleId: {
      type: String,
      sparse: true,
    },
    image: {
      type: String,
    },
    phone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function setupSuperadmin() {
  try {
    await connectDB();

    // Check if superadmin already exists
    const existingSuperadmin = await User.findOne({ role: "superadmin" });

    if (existingSuperadmin) {
      console.log("✅ Superadmin already exists:", existingSuperadmin.email);
      process.exit(0);
    }

    // Create superadmin user
    const superadmin = new User({
      name: "Super Admin",
      email: process.env.SUPERADMIN_EMAIL || "superadmin@example.com",
      password: process.env.SUPERADMIN_PASSWORD || "superadminpassword",
      role: "superadmin",
      isActive: true,
    });

    await superadmin.save();

    console.log("✅ Superadmin created successfully:");
    console.log("📧 Email:", superadmin.email);
    console.log("🔑 Role:", superadmin.role);
    console.log("🆔 ID:", superadmin._id);
    console.log("");
    console.log("🎉 You can now login with these credentials!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up superadmin:", error);
    process.exit(1);
  }
}

setupSuperadmin();
