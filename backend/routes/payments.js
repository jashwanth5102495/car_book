import express from 'express';
import { body, validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create payment (simulate payment)
router.post('/', auth, [
  body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
  body('method').isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer']).withMessage('Valid payment method is required'),
  body('cardDetails').optional().isObject().withMessage('Card details must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, method, cardDetails } = req.body;
    const userId = req.user.userId;

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      status: 'pending'
    }).populate('car');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not eligible for payment' });
    }

    // Check if payment already processed
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment already completed for this booking' });
    }

    // Simulate payment processing
    const isPaymentSuccessful = Math.random() > 0.05; // 95% success rate for simulation

    if (isPaymentSuccessful) {
      // Update booking payment status and status
      booking.paymentStatus = 'paid';
      booking.paymentMethod = method;
      booking.status = 'confirmed';
      await booking.save();

      res.status(200).json({
        message: 'Payment successful',
        booking: {
          id: booking._id,
          referenceNumber: booking.referenceNumber,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          paymentMethod: booking.paymentMethod,
          totalAmount: booking.totalAmount,
          transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
        }
      });
    } else {
      // Update booking payment status to failed
      booking.paymentStatus = 'failed';
      await booking.save();

      res.status(400).json({
        message: 'Payment failed. Please try again.',
        booking: {
          id: booking._id,
          status: booking.status,
          paymentStatus: booking.paymentStatus
        }
      });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment details for a booking
router.get('/booking/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findOne({ 
      _id: bookingId, 
      user: userId 
    }).populate('car');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      totalAmount: booking.totalAmount,
      status: booking.status,
      referenceNumber: booking.referenceNumber
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all payments (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payments = await Booking.find({ paymentStatus: { $ne: 'pending' } })
      .populate(['user', 'car'])
      .select('user car totalAmount paymentStatus paymentMethod createdAt')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refund payment (Admin only)
router.post('/:bookingId/refund', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Cannot refund unpaid booking' });
    }

    // Update booking status
    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Refund processed by admin';
    await booking.save();

    res.json({
      message: 'Refund processed successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        refundAmount: booking.totalAmount
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;