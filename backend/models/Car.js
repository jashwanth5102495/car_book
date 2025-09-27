import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  category: {
    type: String,
    required: true,
    enum: ['economy', 'compact', 'midsize', 'fullsize', 'luxury', 'suv', 'convertible', 'sports']
  },
  transmission: {
    type: String,
    required: true,
    enum: ['manual', 'automatic', 'cvt']
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['petrol', 'diesel', 'electric', 'hybrid']
  },
  seats: {
    type: Number,
    required: true,
    min: 2,
    max: 8
  },
  doors: {
    type: Number,
    required: true,
    min: 2,
    max: 5
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String,
    required: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  vin: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  available: {
    type: Boolean,
    default: true
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  },
  nextMaintenance: {
    type: Date
  },
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
carSchema.index({ category: 1 });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ available: 1 });
carSchema.index({ 'location.city': 1 });
carSchema.index({ make: 1, model: 1 });

// Virtual for car's full name
carSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Method to check availability for specific dates
carSchema.methods.isAvailableForDates = async function(startDate, endDate) {
  const Booking = mongoose.model('Booking');
  const conflictingBooking = await Booking.findOne({
    car: this._id,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      }
    ]
  });
  
  return !conflictingBooking && this.available;
};

// Method to calculate total price for a rental period
carSchema.methods.calculatePrice = function(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return days * this.pricePerDay;
};

export default mongoose.model('Car', carSchema);