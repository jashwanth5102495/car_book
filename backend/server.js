import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import carRoutes from './routes/cars.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// Allow any localhost port in development and specific FRONTEND_URL if provided
app.use(cors({
  origin: (origin, callback) => {
    const allowedEnv = process.env.FRONTEND_URL;
    const isLocalhost = !origin || /http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    if (isLocalhost || (allowedEnv && origin === allowedEnv)) {
      callback(null, true);
    } else {
      // Fallback: allow other origins (use stricter rules in production as needed)
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
// Ensure uploads directories exist to prevent Multer crashes
const uploadsDir = path.join(__dirname, 'uploads');
const carUploadsDir = path.join(uploadsDir, 'cars');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(carUploadsDir)) {
    fs.mkdirSync(carUploadsDir, { recursive: true });
  }
} catch (e) {
  console.error('Failed to ensure uploads directories:', e);
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Car Rental API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/car_rental';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();