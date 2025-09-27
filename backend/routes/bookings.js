import express from 'express';
import { body, validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create a new booking
router.post('/', auth, [
  body('carId').notEmpty().withMessage('Car ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { carId, startDate, endDate, paymentStatus, status } = req.body;
    const userId = req.user.userId;

    // Check if car exists and is available
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    console.log('Found car:', {
      id: car._id,
      make: car.make,
      model: car.model,
      pricePerDay: car.pricePerDay,
      available: car.available
    });

    if (!car.available) {
      return res.status(400).json({ message: 'Car is not available' });
    }

    // Check for date conflicts
    const conflictingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Car is not available for the selected dates' });
    }

    // Calculate total amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAmount = days * car.pricePerDay;

    // Debug logging
    console.log('Booking calculation:', {
      startDate: start,
      endDate: end,
      days,
      pricePerDay: car.pricePerDay,
      totalAmount,
      userId,
      carId
    });

    // Validate dates and amount
    if (isNaN(days) || days <= 0) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total amount calculation' });
    }

    // Create booking with required fields and optional status/payment fields
    const bookingData = {
      user: userId,
      car: carId,
      startDate: start,
      endDate: end,
      totalAmount,
      status: status || 'pending',
      paymentStatus: paymentStatus || 'pending',
      paymentMethod: 'credit_card'
    };

    console.log('Creating booking with data:', bookingData);
    const booking = new Booking(bookingData);

    await booking.save();
    await booking.populate(['user', 'car']);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookings = await Booking.find({ user: userId })
      .populate('car')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bookings for cars owned by the current user (for car owners)
router.get('/owner-bookings', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find all cars owned by the user
    const ownedCars = await Car.find({ owner: userId }).select('_id');
    const carIds = ownedCars.map(car => car._id);
    
    // Find all bookings for those cars
    const bookings = await Booking.find({ car: { $in: carIds } })
      .populate({
        path: 'car',
        select: 'make model year images location'
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .sort({ createdAt: -1 });

    // Transform the response to match the expected format
    const transformedBookings = bookings.map(booking => ({
      _id: booking._id,
      car: booking.car,
      customer: {
        _id: booking.user._id,
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone
      },
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalPrice: booking.totalAmount,
      status: booking.status,
      createdAt: booking.createdAt
    }));

    res.json(transformedBookings);
  } catch (error) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings (admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bookings = await Booking.find()
      .populate(['user', 'car'])
      .sort({ createdAt: -1 });

    res.json({ data: bookings });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.patch('/:id/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    booking.status = status;
    await booking.save();
    await booking.populate(['user', 'car']);

    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow cancellation if booking is pending or confirmed
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;