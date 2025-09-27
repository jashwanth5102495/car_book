import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'skipped'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'],
    default: 'credit_card'
  },
  pickupLocation: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  dropoffLocation: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  pickupTime: {
    type: String,
    default: '10:00'
  },
  dropoffTime: {
    type: String,
    default: '10:00'
  },
  driverDetails: {
    licenseNumber: String,
    licenseExpiry: Date,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  additionalServices: [{
    name: String,
    price: Number,
    description: String
  }],
  specialRequests: {
    type: String,
    trim: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  rating: {
    carRating: {
      type: Number,
      min: 1,
      max: 5
    },
    serviceRating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    reviewDate: Date
  },
  mileageStart: {
    type: Number,
    min: 0
  },
  mileageEnd: {
    type: Number,
    min: 0
  },
  fuelLevelStart: {
    type: String,
    enum: ['empty', 'quarter', 'half', 'three_quarters', 'full']
  },
  fuelLevelEnd: {
    type: String,
    enum: ['empty', 'quarter', 'half', 'three_quarters', 'full']
  },
  damageReport: {
    beforeRental: [{
      description: String,
      images: [String],
      severity: {
        type: String,
        enum: ['minor', 'moderate', 'major']
      }
    }],
    afterRental: [{
      description: String,
      images: [String],
      severity: {
        type: String,
        enum: ['minor', 'moderate', 'major']
      },
      cost: Number
    }]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ car: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Virtual for booking duration in days
bookingSchema.virtual('durationDays').get(function() {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for booking reference number
bookingSchema.virtual('referenceNumber').get(function() {
  return `BK${this._id.toString().slice(-8).toUpperCase()}`;
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const hoursUntilStart = (this.startDate - now) / (1000 * 60 * 60);
  return ['pending', 'confirmed'].includes(this.status) && hoursUntilStart > 24;
};

// Method to check if booking can be modified
bookingSchema.methods.canBeModified = function() {
  const now = new Date();
  const hoursUntilStart = (this.startDate - now) / (1000 * 60 * 60);
  return ['pending', 'confirmed'].includes(this.status) && hoursUntilStart > 48;
};

// Method to calculate cancellation fee
bookingSchema.methods.calculateCancellationFee = function() {
  const now = new Date();
  const hoursUntilStart = (this.startDate - now) / (1000 * 60 * 60);
  
  if (hoursUntilStart > 48) {
    return 0; // No fee
  } else if (hoursUntilStart > 24) {
    return this.totalAmount * 0.25; // 25% fee
  } else {
    return this.totalAmount * 0.50; // 50% fee
  }
};

export default mongoose.model('Booking', bookingSchema);