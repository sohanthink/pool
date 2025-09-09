import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";

// PATCH endpoint removed - bookings are automatically confirmed and cannot be changed
