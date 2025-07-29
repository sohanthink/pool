import mongoose from "mongoose";

const poolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Maintenance"],
      default: "Active",
    },
    owner: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },

    availableSlots: {
      type: Map,
      of: [String],
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
poolSchema.index({ name: 1 });
poolSchema.index({ status: 1 });
poolSchema.index({ "owner.email": 1 });

export default mongoose.models.Pool || mongoose.model("Pool", poolSchema);
