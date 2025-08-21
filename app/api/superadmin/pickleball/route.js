import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Pickleball from "@/models/Pickleball";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const ownerEmail = searchParams.get("ownerEmail");

    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (ownerEmail) {
      query["owner.email"] = ownerEmail;
    }

    const pickleballCourts = await Pickleball.find(query)
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    return NextResponse.json(pickleballCourts);
  } catch (error) {
    console.error("Error fetching pickleball courts:", error);
    return NextResponse.json(
      { error: "Failed to fetch pickleball courts" },
      { status: 500 }
    );
  }
}
