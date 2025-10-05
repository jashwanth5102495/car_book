import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';

dotenv.config();

const resetDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/car_rental';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear collections
    const results = await Promise.all([
      Booking.deleteMany({}),
      Car.deleteMany({}),
      User.deleteMany({})
    ]);

    console.log('Deleted counts:', {
      bookings: results[0].deletedCount,
      cars: results[1].deletedCount,
      users: results[2].deletedCount,
    });

    console.log('✅ Database reset complete. All collections cleared.');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
};

resetDatabase();