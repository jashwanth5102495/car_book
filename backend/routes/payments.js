import express from 'express';
import { body, validationResult } from 'express-validator';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create payment (simulate payment)
router.post('/', authenticateToken, [
  body('booking_id').isMongoId().withMessage('Valid booking ID is required'),
  body('method').isIn(['card', 'cash']).withMessage('Valid payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { booking_id, method } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: booking_id,
      user_id: req.user.id,
      status: 'pending'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not eligible for payment' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ booking_id });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already exists for this booking' });
    }

    // Simulate payment processing
    const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate for simulation

    const payment = new Payment({
      booking_id,
      amount: booking.total_price,
      method,
      status: isPaymentSuccessful ? 'completed' : 'failed',
      transaction_id: isPaymentSuccessful ? `TXN${Date.now()}${Math.floor(Math.random() * 1000)}` : null
    });
    await payment.save();

    if (isPaymentSuccessful) {
      // Update booking status to confirmed
      await Booking.findByIdAndUpdate(booking._id, { status: 'confirmed' });
      
      // Update car availability status
      await Car.findByIdAndUpdate(booking.car_id, { availability_status: 'booked' });
    }

    res.status(201).json({
      message: isPaymentSuccessful ? 'Payment successful' : 'Payment failed',
      payment,
      booking: {
        ...booking.toJSON(),
        status: isPaymentSuccessful ? 'confirmed' : booking.status
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment details
router.get('/:bookingId', authenticateToken, async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking_id: req.params.bookingId })
      .populate('booking_id');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if the booking belongs to the user
    const booking = await Booking.findOne({ 
      _id: req.params.bookingId, 
      user_id: req.user.id 
    });

    if (!booking) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;