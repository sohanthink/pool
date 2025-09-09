import mongoose from "mongoose";

const pickleballSchema = new mongoose.Schema(
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
    surface: {
      type: String,
      required: true,
      enum: ["Indoor", "Outdoor", "Both"],
    },
    type: {
      type: String,
      required: true,
      enum: ["Singles", "Doubles", "Both"],
    },
    price: {
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
        required: false,
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
    // Link sharing and expiry fields
    linkExpiry: {
      type: Date,
      default: null,
      required: false,
    },
    isLinkActive: {
      type: Boolean,
      default: false,
      required: false,
    },
    linkToken: {
      type: String,
      default: null,
      required: false,
    },
    // Booking link fields
    bookingLinkExpiry: {
      type: Date,
      default: null,
      required: false,
    },
    isBookingLinkActive: {
      type: Boolean,
      default: false,
      required: false,
    },
    bookingToken: {
      type: String,
      default: null,
      required: false,
    },
    // Price for booking link (optional)
    bookingPrice: {
      type: Number,
      default: 0,
      min: 0,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
pickleballSchema.index({ name: 1 });
pickleballSchema.index({ status: 1 });
pickleballSchema.index({ "owner.email": 1 });
pickleballSchema.index({ linkToken: 1 });
pickleballSchema.index({ bookingToken: 1 });

export default mongoose.models.Pickleball ||
  mongoose.model("Pickleball", pickleballSchema);
