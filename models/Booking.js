import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    poolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pool",
      required: false,
    },
    tennisCourtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tennis",
      required: false,
    },
    pickleballCourtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pickleball",
      required: false,
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

    status: {
      type: String,
      enum: ["Confirmed", "Cancelled", "Completed"],
      default: "Confirmed",
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
    fromShareLink: {
      type: Boolean,
      default: false,
    },
    // Price information
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Custom validation to ensure either poolId, tennisCourtId, or pickleballCourtId is provided
bookingSchema.pre("save", function (next) {
  if (!this.poolId && !this.tennisCourtId && !this.pickleballCourtId) {
    return next(
      new Error(
        "Either poolId, tennisCourtId, or pickleballCourtId must be provided"
      )
    );
  }
  if (
    (this.poolId && this.tennisCourtId) ||
    (this.poolId && this.pickleballCourtId) ||
    (this.tennisCourtId && this.pickleballCourtId)
  ) {
    return next(new Error("Cannot have multiple venue types"));
  }
  next();
});

// Index for better query performance
bookingSchema.index({ poolId: 1 });
bookingSchema.index({ tennisCourtId: 1 });
bookingSchema.index({ pickleballCourtId: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ customerEmail: 1 });
bookingSchema.index({ customerName: "text" });

// Virtual for end time
bookingSchema.virtual("endTime").get(function () {
  if (!this.time || !this.duration) return null;

  // Convert 12-hour format to 24-hour format for calculation
  const convert12To24Hour = (time12h) => {
    const [time, period] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  // Convert 24-hour format to 12-hour format
  const convert24To12Hour = (time24h) => {
    const [hours, minutes] = time24h.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const time24h = convert12To24Hour(this.time);
  const startTime = new Date(`2000-01-01T${time24h}:00`);
  const endTime = new Date(
    startTime.getTime() + this.duration * 60 * 60 * 1000
  );

  const endTime24h = endTime.toTimeString().slice(0, 5);
  return convert24To12Hour(endTime24h);
});

// Ensure virtuals are serialized
bookingSchema.set("toJSON", { virtuals: true });
bookingSchema.set("toObject", { virtuals: true });

// Force model recompilation to ensure schema changes are applied
if (mongoose.models.Booking) {
  delete mongoose.models.Booking;
}

export default mongoose.model("Booking", bookingSchema);
