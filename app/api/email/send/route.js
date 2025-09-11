import { NextResponse } from "next/server";
import {
  sendBookingConfirmationToUser,
  sendBookingNotificationToAdmin,
} from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, bookingData } = body;

    let result;

    switch (type) {
      case "user_confirmation":
        result = await sendBookingConfirmationToUser(bookingData);
        break;
      case "admin_notification":
        result = await sendBookingNotificationToAdmin(bookingData);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in email API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
