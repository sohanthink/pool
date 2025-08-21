import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Pickleball from "@/models/Pickleball";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const pickleball = await Pickleball.findById(id).populate(
      "owner",
      "name email phone"
    );
    if (!pickleball) {
      return NextResponse.json(
        { error: "Pickleball court not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pickleball);
  } catch (error) {
    console.error("Error fetching pickleball court:", error);
    return NextResponse.json(
      { error: "Failed to fetch pickleball court" },
      { status: 500 }
    );
  }
}
