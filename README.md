# 🏊‍♂️ Private Pool Management System

A comprehensive pool booking and management system built with Next.js, featuring role-based access control, real-time booking management, and a modern UI.

## ✨ Features

### 🎯 Core Features

- **Pool Booking System**: Users can browse and book private pools
- **Role-Based Access Control**: Separate interfaces for admins and superadmins
- **Real-Time Availability**: Check pool availability and manage bookings
- **Image Management**: Drag-and-drop image uploads with preview
- **Responsive Design**: Modern UI that works on all devices

### 👤 User Roles

#### **🏊‍♂️ End Users (Public)**

- Browse available pools
- View pool details and images
- Book pools with date/time selection
- Receive booking confirmations

#### **👨‍💼 Pool Owners (Admins)**

- Google OAuth authentication
- Create and manage their pools
- Upload pool images with drag-and-drop
- View and manage bookings
- Update booking status (Confirm/Cancel)
- Edit pool details
- Delete pools with associated images

#### **🔧 Super Admins**

- Email/password authentication
- View all pool owners and their statistics
- Monitor system-wide bookings
- Manage admin accounts
- Change password functionality
- System overview dashboard

### 🛠️ Technical Features

- **Next.js 14** with App Router
- **NextAuth.js** for authentication
- **MongoDB** with Mongoose ODM
- **File Upload** with Formidable
- **Image Processing** and storage
- **Role-Based Route Protection**
- **Responsive UI** with shadcn/ui components
- **Real-Time Updates** and notifications

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google OAuth credentials (for admin login)

### 1. Clone and Install

```bash
git clone <repository-url>
cd pool
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/pool-booking

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000

# Superadmin Credentials
SUPERADMIN_EMAIL=superadmin@example.com
SUPERADMIN_PASSWORD=superadminpassword

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Start MongoDB (if local)
mongod

# Create initial superadmin user
node scripts/setup-superadmin.js
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔐 Authentication System

### **Superadmin Login**

- **URL**: `/superadmin/login`
- **Method**: Email/Password
- **Default Credentials**:
  - Email: `superadmin@example.com`
  - Password: `superadminpassword`

### **Admin Login**

- **URL**: `/signin`
- **Method**: Google OAuth
- **Requirements**: Google Developer Console setup

### **Password Management**

- **Change Password**: Available in superadmin dashboard
- **Forgot Password**: Email-based reset system
- **Security**: bcrypt hashing with salt

## 📁 Project Structure

```
pool/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication APIs
│   │   ├── bookings/             # Booking management
│   │   ├── pools/                # Pool management
│   │   └── superadmin/           # Superadmin APIs
│   ├── dashboard/                # Dashboard pages
│   │   ├── admin/                # Admin dashboard
│   │   └── superadmin/           # Superadmin dashboard
│   ├── pool/                     # Public pool pages
│   └── signin/                   # Authentication pages
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   └── *.jsx                     # Custom components
├── models/                       # Mongoose models
├── lib/                          # Utility functions
├── hooks/                        # Custom React hooks
├── public/                       # Static assets
│   └── uploads/                  # Uploaded images
└── scripts/                      # Setup scripts
```

## 🎨 UI Components

### **Built with shadcn/ui**

- **Cards**: Information display
- **Buttons**: Actions and navigation
- **Forms**: Data input and validation
- **Sidebar**: Navigation menu
- **Badges**: Status indicators
- **Inputs**: Text and file inputs
- **Select**: Dropdown selections

### **Custom Components**

- **AppSideBar**: Role-based navigation
- **RouteGuard**: Route protection
- **PoolForm**: Pool creation/editing
- **TopBar**: Header navigation
- **Signin**: Authentication forms

## 📊 Database Models

### **User Model**

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed, superadmin only),
  role: 'admin' | 'superadmin',
  googleId: String,
  image: String,
  phone: String,
  isActive: Boolean,
  lastLogin: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}
```

### **Pool Model**

```javascript
{
  name: String,
  description: String,
  location: String,
  images: [String],
  owner: {
    email: String,
    name: String,
    phone: String
  },
  amenities: [String],
  capacity: Number,
  isActive: Boolean
}
```

### **Booking Model**

```javascript
{
  poolId: ObjectId (ref: Pool),
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  date: Date,
  time: String,
  duration: Number,
  guests: Number,
  status: 'Pending' | 'Confirmed' | 'Cancelled',
  notes: String
}
```

## 🔧 API Endpoints

### **Authentication**

- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password-token` - Reset password
- `POST /api/auth/reset-password` - Change password

### **Pools**

- `GET /api/pools` - List all pools
- `POST /api/pools` - Create new pool
- `GET /api/pools/[id]` - Get pool details
- `PATCH /api/pools/[id]` - Update pool
- `DELETE /api/pools/[id]` - Delete pool
- `DELETE /api/pools/[id]/delete-with-images` - Delete with images

### **Bookings**

- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/[id]` - Update booking status

### **Superadmin**

- `GET /api/superadmin/admins` - List all admins
- `GET /api/superadmin/admins/[email]` - Get admin details

### **File Upload**

- `POST /pages/api/upload` - Upload images

## 🛡️ Security Features

### **Authentication & Authorization**

- **NextAuth.js**: Secure session management
- **Role-Based Access**: Granular permissions
- **Route Protection**: Unauthorized access prevention
- **Password Hashing**: bcrypt with salt
- **Token-Based Reset**: Secure password recovery

### **Data Validation**

- **Input Sanitization**: XSS prevention
- **File Upload Validation**: Type and size checks
- **MongoDB Injection Protection**: Mongoose validation
- **Environment Variables**: Secure configuration

### **File Security**

- **Image Validation**: Type and size restrictions
- **Secure Storage**: Public folder with proper permissions
- **Unique Filenames**: UUID-based naming
- **Cleanup**: Automatic file deletion

## 🚀 Deployment

### **Vercel (Recommended)**

1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### **Other Platforms**

- **Netlify**: Static export with API routes
- **Railway**: Full-stack deployment
- **DigitalOcean**: App Platform deployment

### **Environment Variables for Production**

```bash
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=https://your-domain.com
SUPERADMIN_EMAIL=admin@yourdomain.com
SUPERADMIN_PASSWORD=secure-password
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔄 Development Workflow

### **Adding New Features**

1. Create feature branch
2. Implement functionality
3. Add tests (if applicable)
4. Update documentation
5. Create pull request

### **Database Changes**

1. Update Mongoose models
2. Create migration scripts
3. Test with sample data
4. Update API endpoints

### **UI Updates**

1. Use shadcn/ui components
2. Follow existing design patterns
3. Ensure responsive design
4. Test across devices

## 🐛 Troubleshooting

### **Common Issues**

#### **Authentication Problems**

- Check environment variables
- Verify Google OAuth setup
- Ensure MongoDB connection
- Check NextAuth configuration

#### **Image Upload Issues**

- Verify upload directory permissions
- Check file size limits
- Ensure proper file types
- Validate form data

#### **Database Connection**

- Check MongoDB URI
- Verify network connectivity
- Check authentication credentials
- Monitor connection pool

### **Debug Mode**

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check MongoDB connection
node scripts/test-db.js
```

## 📈 Performance Optimization

### **Frontend**

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Dynamic imports
- **Caching**: Static generation where possible
- **Bundle Analysis**: Monitor bundle size

### **Backend**

- **Database Indexing**: Optimized queries
- **Connection Pooling**: MongoDB connection management
- **File Compression**: Gzip compression
- **CDN**: Static asset delivery

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **NextAuth.js** - Authentication
- **MongoDB** - Database
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Formidable** - File uploads

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review troubleshooting guide

---

**Built with ❤️ using Next.js, MongoDB, and modern web technologies**
