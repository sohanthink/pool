import nodemailer from "nodemailer";

// Create transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// Send booking confirmation to user
export const sendBookingConfirmationToUser = async (bookingData) => {
  const {
    userEmail,
    userName,
    venueName,
    venueType,
    date,
    time,
    duration,
    totalPrice,
    bookingId,
  } = bookingData;

  const subject = `Booking Confirmation - ${venueName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .total { background: #667eea; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .venue-icon { font-size: 24px; margin-right: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
          <p>Your ${venueType} booking has been successfully confirmed</p>
        </div>
        
        <div class="content">
          <p>Dear ${userName},</p>
          <p>Thank you for your booking! We're excited to have you join us.</p>
          
          <div class="booking-details">
            <h3>📋 Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">#${bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Venue:</span>
              <span class="detail-value">${venueName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${venueType}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${new Date(date).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">${duration} hour${
    duration > 1 ? "s" : ""
  }</span>
            </div>
          </div>
          
          <div class="total">
            Total Amount: $${totalPrice}
          </div>
          
          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Please arrive 10 minutes before your scheduled time</li>
            <li>Bring appropriate equipment and attire</li>
            <li>Contact us if you need to make any changes</li>
          </ul>
          
          <p>We look forward to seeing you soon!</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© 2024 PoolBook. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    subject,
    html,
  });
};

// Send booking notification to admin
export const sendBookingNotificationToAdmin = async (bookingData) => {
  const {
    adminEmail,
    adminName,
    userName,
    userEmail,
    userPhone,
    venueName,
    venueType,
    date,
    time,
    duration,
    totalPrice,
    bookingId,
    numberOfGuests,
  } = bookingData;

  const subject = `New Booking - ${venueName} (${venueType})`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Booking Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
        .customer-details { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .total { background: #28a745; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Booking Alert!</h1>
          <p>A new ${venueType} booking has been made</p>
        </div>
        
        <div class="content">
          <p>Dear ${adminName},</p>
          <p>You have received a new booking for your venue. Here are the details:</p>
          
          <div class="booking-details">
            <h3>📋 Booking Information</h3>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">#${bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Venue:</span>
              <span class="detail-value">${venueName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${venueType}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${new Date(date).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">${duration} hour${
    duration > 1 ? "s" : ""
  }</span>
            </div>
            ${
              numberOfGuests
                ? `
            <div class="detail-row">
              <span class="detail-label">Number of Guests:</span>
              <span class="detail-value">${numberOfGuests}</span>
            </div>
            `
                : ""
            }
          </div>
          
          <div class="customer-details">
            <h3>👤 Customer Information</h3>
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${userName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${userEmail}</span>
            </div>
            ${
              userPhone
                ? `
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${userPhone}</span>
            </div>
            `
                : ""
            }
          </div>
          
          <div class="total">
            Total Amount: $${totalPrice}
          </div>
          
          <div class="urgent">
            <p><strong>⚠️ Action Required:</strong></p>
            <p>Please prepare the venue and ensure everything is ready for the customer's arrival.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from PoolBook.</p>
          <p>© 2024 PoolBook. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: adminEmail,
    subject,
    html,
  });
};
