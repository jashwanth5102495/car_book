import express from 'express';
import multer from 'multer';
import path from 'path';
import { body, validationResult } from 'express-validator';
import Car from '../models/Car.js';
import auth, { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/cars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all cars with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      transmission,
      fuelType,
      seats,
      available,
      city,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (transmission) filter.transmission = transmission;
    if (fuelType) filter.fuelType = fuelType;
    if (seats) filter.seats = parseInt(seats);
    if (available !== undefined) filter.available = available === 'true';
    if (city) filter['location.city'] = new RegExp(city, 'i');
    
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { make: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const cars = await Car.find(filter)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .sort(options.sort);

    const total = await Car.countDocuments(filter);

    res.json({
      data: cars,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      total
    });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cars owned by the current user (for renters)
router.get('/my-cars', auth, async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ data: cars });
  } catch (error) {
    console.error('Get my cars error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single car by ID
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new car (Authenticated users)
router.post('/', auth, upload.array('images', 5), [
  body('make').notEmpty().withMessage('Make is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
  body('category').isIn(['economy', 'compact', 'midsize', 'fullsize', 'luxury', 'suv', 'convertible', 'sports']).withMessage('Valid category is required'),
  body('transmission').isIn(['manual', 'automatic', 'cvt']).withMessage('Valid transmission is required'),
  body('fuelType').isIn(['petrol', 'diesel', 'electric', 'hybrid']).withMessage('Valid fuel type is required'),
  body('seats').isInt({ min: 2, max: 8 }).withMessage('Seats must be between 2 and 8'),
  body('doors').isInt({ min: 2, max: 5 }).withMessage('Doors must be between 2 and 5'),
  body('pricePerDay').isFloat({ min: 0 }).withMessage('Price per day must be a positive number'),
  body('licensePlate').notEmpty().withMessage('License plate is required'),
  body('vin').notEmpty().withMessage('VIN is required'),
  body('mileage').isFloat({ min: 0 }).withMessage('Mileage must be a positive number'),
  body('color').notEmpty().withMessage('Color is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const carData = req.body;
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      carData.images = req.files.map(file => `/uploads/cars/${file.filename}`);
    } else {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Parse features if it's a string
    if (typeof carData.features === 'string') {
      carData.features = carData.features.split(',').map(f => f.trim());
    }

    // Handle nested location data from FormData
    if (carData['location[address]']) {
      carData.location = {
        address: carData['location[address]'],
        city: carData['location[city]'],
        state: carData['location[state]'],
        zipCode: carData['location[zipCode]']
      };
      // Clean up the FormData keys
      delete carData['location[address]'];
      delete carData['location[city]'];
      delete carData['location[state]'];
      delete carData['location[zipCode]'];
    }

    // Set the owner to the authenticated user
    carData.owner = req.user.id;

    const car = new Car(carData);
    await car.save();

    res.status(201).json({
      message: 'Car created successfully',
      car
    });
  } catch (error) {
    console.error('Create car error:', error);
    console.error('Error details:', error.message);
    console.error('Car data received:', req.body);
    if (error.code === 11000) {
      res.status(400).json({ message: 'License plate or VIN already exists' });
    } else if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ message: 'Validation error', errors: validationErrors });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// Update car (Car owner or Admin)
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if user is the owner or admin
    if (car.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this car' });
    }

    const updateData = req.body;
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => `/uploads/cars/${file.filename}`);
    }

    // Parse features if it's a string
    if (typeof updateData.features === 'string') {
      updateData.features = updateData.features.split(',').map(f => f.trim());
    }

    Object.assign(car, updateData);
    await car.save();

    res.json({
      message: 'Car updated successfully',
      car
    });
  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete car (Car owner or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if user is the owner or admin
    if (car.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this car' });
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle car availability (Car owner or Admin)
router.patch('/:id/availability', auth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if user is the owner or admin
    if (car.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this car' });
    }

    // Allow setting specific availability value or toggle
    if (req.body.available !== undefined) {
      car.available = req.body.available;
    } else {
      car.available = !car.available;
    }
    
    await car.save();

    res.json({
      message: `Car ${car.available ? 'enabled' : 'disabled'} successfully`,
      car
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;