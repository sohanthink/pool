# Deployment Guide - Pool Booking System

## 🚀 Deploy to Render

### 1. Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**

   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Free tier is sufficient)

2. **Configure Database**

   - Create a database user with read/write permissions
   - Get your connection string
   - Add your IP address to the IP whitelist (or use 0.0.0.0/0 for all IPs)

3. **Connection String Format**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/pool-booking?retryWrites=true&w=majority
   ```

### 2. Render Setup

1. **Create Render Account**

   - Go to [Render](https://render.com)
   - Sign up with your GitHub account

2. **Deploy Web Service**

   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `pool-booking-system`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free (or paid for better performance)

3. **Environment Variables**
   Add these in Render dashboard:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pool-booking?retryWrites=true&w=majority
   NODE_ENV=production
   ```

### 3. Local Development Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**
   Create `.env.local` file:

   ```env
   MONGODB_URI=mongodb://localhost:27017/pool-booking
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

### 4. API Endpoints

#### Pools

- `GET /api/pools` - Get all pools
- `POST /api/pools` - Create new pool
- `GET /api/pools/[id]` - Get pool by ID
- `PUT /api/pools/[id]` - Update pool
- `DELETE /api/pools/[id]` - Delete pool

#### Bookings

- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get booking by ID
- `PUT /api/bookings/[id]` - Update booking status

#### Availability

- `GET /api/pools/[id]/availability?date=YYYY-MM-DD` - Get available time slots

### 5. Database Models

#### Pool Schema

```javascript
{
  name: String,
  description: String,
  location: String,
  size: String,
  capacity: Number,
  price: Number,
  status: String,
  owner: {
    name: String,
    email: String,
    phone: String
  },
  amenities: [String],
  images: [String],
  rating: Number,
  totalBookings: Number,
  totalRevenue: Number
}
```

#### Booking Schema

```javascript
{
  poolId: ObjectId,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  date: Date,
  time: String,
  duration: Number,
  guests: Number,
  totalPrice: Number,
  status: String,
  notes: String,
  createdBy: String
}
```

### 6. Features

✅ **Pool Management**

- Create, read, update, delete pools
- Pool images and amenities
- Owner information

✅ **Booking System**

- Public booking page via shared links
- Admin booking creation
- Availability checking
- Conflict prevention

✅ **Admin Dashboard**

- Pool management
- Booking management
- Status updates
- Search and filtering

### 7. Next Steps

1. **Add Authentication**

   - Install NextAuth.js
   - Configure providers (Google, Email, etc.)
   - Add role-based access control

2. **Add Payment Processing**

   - Integrate Stripe or PayPal
   - Handle payment confirmations
   - Update booking status

3. **Add Email Notifications**

   - Booking confirmations
   - Reminders
   - Status updates

4. **Add File Upload**
   - Pool images
   - Profile pictures
   - Document uploads

### 8. Troubleshooting

#### Common Issues

1. **MongoDB Connection Error**

   - Check connection string
   - Verify IP whitelist
   - Check database user permissions

2. **Build Errors on Render**

   - Check Node.js version
   - Verify build command
   - Check environment variables

3. **API Errors**
   - Check server logs
   - Verify request format
   - Check database connection

### 9. Performance Optimization

1. **Database Indexing**

   - Already configured in models
   - Monitor query performance

2. **Caching**

   - Add Redis for session storage
   - Cache frequently accessed data

3. **CDN**
   - Use Cloudflare for static assets
   - Optimize images

### 10. Security

1. **Environment Variables**

   - Never commit secrets to Git
   - Use Render's environment variables

2. **Input Validation**

   - All API endpoints validate input
   - Sanitize user data

3. **Rate Limiting**
   - Add rate limiting for API endpoints
   - Prevent abuse

## 🎉 Your Pool Booking System is Ready!

Your application will be available at: `https://your-app-name.onrender.com`
