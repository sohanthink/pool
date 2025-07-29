import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
        return this.role === "superadmin"; // Only required for superadmin
      },
    },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
    googleId: {
      type: String,
      sparse: true, // Allow multiple null values
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

// Index for better query performance (only if not already defined)
if (
  !userSchema.indexes().some((index) => Object.keys(index[0]).includes("email"))
) {
  userSchema.index({ email: 1 });
}
if (
  !userSchema.indexes().some((index) => Object.keys(index[0]).includes("role"))
) {
  userSchema.index({ role: 1 });
}
if (
  !userSchema
    .indexes()
    .some((index) => Object.keys(index[0]).includes("googleId"))
) {
  userSchema.index({ googleId: 1 });
}

// Hash password before saving (only for superadmin)
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
