import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    poolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pool",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    guests: {
      type: Number,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
bookingSchema.index({ poolId: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ customerEmail: 1 });
bookingSchema.index({ customerName: "text" });

// Virtual for end time
bookingSchema.virtual("endTime").get(function () {
  if (!this.time || !this.duration) return null;

  const startTime = new Date(`2000-01-01T${this.time}:00`);
  const endTime = new Date(
    startTime.getTime() + this.duration * 60 * 60 * 1000
  );

  return endTime.toTimeString().slice(0, 5);
});

// Ensure virtuals are serialized
bookingSchema.set("toJSON", { virtuals: true });
bookingSchema.set("toObject", { virtuals: true });

export default mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);
