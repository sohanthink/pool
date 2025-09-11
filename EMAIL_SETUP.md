# Email Setup Guide

This guide explains how to set up email notifications for the PoolBook system.

## Environment Variables

Add the following environment variables to your `.env.local` file:

### Gmail Configuration (Recommended)

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Outlook/Hotmail Configuration

```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Custom SMTP Configuration

```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

## Email Templates

The system includes two email templates:

### 1. User Confirmation Email

- Sent to customers when they make a booking
- Includes booking details, venue information, and instructions
- Professional design with booking confirmation

### 2. Admin Notification Email

- Sent to venue owners when a new booking is made
- Includes customer information and booking details
- Action-oriented design for admin management

## Features

- ✅ **Automatic Email Sending**: Emails are sent automatically when bookings are created
- ✅ **Professional Templates**: Beautiful HTML email templates
- ✅ **Multi-Venue Support**: Works for Pools, Tennis Courts, and Pickleball Courts
- ✅ **Error Handling**: Email failures don't affect booking creation
- ✅ **Async Processing**: Emails are sent asynchronously for better performance

## Testing

To test email functionality:

1. Set up your email configuration
2. Create a test booking through the system
3. Check both customer and admin email inboxes
4. Verify email content and formatting

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**: Check your email credentials and app password
2. **"Connection timeout"**: Verify your email service settings
3. **Emails not received**: Check spam folder and email service limits

### Debug Mode:

Check the server console for email sending logs and error messages.

## Security Notes

- Never commit email credentials to version control
- Use app passwords instead of regular passwords for Gmail
- Consider using environment-specific email accounts for testing
