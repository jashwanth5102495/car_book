import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Car from '../models/Car.js';

dotenv.config();

const ensureOwnerUser = async (name, email, phone, password) => {
  let user = await User.findOne({ email });
  if (user) return user;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  user = new User({
    name,
    email,
    password: hashedPassword,
    phone,
    role: 'car_owner',
    isActive: true,
    emailVerified: true,
  });
  await user.save();
  return user;
};

const seedDemoCars = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/car_rental';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const owner1 = await ensureOwnerUser('Demo Owner 1', 'owner1@carrental.com', '+91-9000000001', 'owner123');
    const owner2 = await ensureOwnerUser('Demo Owner 2', 'owner2@carrental.com', '+91-9000000002', 'owner123');

    const pickOwner = (i) => (i % 2 === 0 ? owner1._id : owner2._id);

    const demoCars = [
      {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        category: 'midsize',
        transmission: 'automatic',
        fuelType: 'petrol',
        seats: 5,
        doors: 4,
        pricePerDay: 3735,
        images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80'],
        features: ['Air Conditioning', 'Bluetooth', 'ABS'],
        description: 'Reliable and comfortable sedan ideal for city and highway.',
        licensePlate: 'MH01-CAM-' + Math.floor(Math.random() * 9000 + 1000),
        vin: 'CAM' + Math.floor(Math.random() * 1e15).toString().padStart(15, '0'),
        mileage: 32000,
        color: 'Silver',
        location: { address: '123 Main St', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' },
        available: true,
        owner: pickOwner(0),
      },
      {
        make: 'Honda',
        model: 'Civic',
        year: 2023,
        category: 'compact',
        transmission: 'manual',
        fuelType: 'petrol',
        seats: 5,
        doors: 4,
        pricePerDay: 3320,
        images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80'],
        features: ['Cruise Control', 'Bluetooth', 'Backup Camera'],
        description: 'Sporty compact sedan with excellent fuel efficiency.',
        licensePlate: 'DL05-CIV-' + Math.floor(Math.random() * 9000 + 1000),
        vin: 'CIV' + Math.floor(Math.random() * 1e15).toString().padStart(15, '0'),
        mileage: 21000,
        color: 'Blue',
        location: { address: '55 Connaught Pl', city: 'Delhi', state: 'Delhi', zipCode: '110001' },
        available: true,
        owner: pickOwner(1),
      },
      {
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        category: 'luxury',
        transmission: 'automatic',
        fuelType: 'electric',
        seats: 5,
        doors: 4,
        pricePerDay: 7055,
        images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80'],
        features: ['Autopilot', 'GPS', 'Heated Seats'],
        description: 'Premium EV with cutting-edge technology and performance.',
        licensePlate: 'KA01-TES-' + Math.floor(Math.random() * 9000 + 1000),
        vin: 'TES' + Math.floor(Math.random() * 1e15).toString().padStart(15, '0'),
        mileage: 8000,
        color: 'White',
        location: { address: '77 MG Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001' },
        available: true,
        owner: pickOwner(2),
      },
      {
        make: 'BMW',
        model: 'X5',
        year: 2022,
        category: 'suv',
        transmission: 'automatic',
        fuelType: 'petrol',
        seats: 7,
        doors: 5,
        pricePerDay: 6225,
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'],
        features: ['All-Wheel Drive', 'Leather Seats', 'Sunroof'],
        description: 'Luxury SUV with space, comfort, and performance.',
        licensePlate: 'TN02-BMW-' + Math.floor(Math.random() * 9000 + 1000),
        vin: 'BMW' + Math.floor(Math.random() * 1e15).toString().padStart(15, '0'),
        mileage: 27000,
        color: 'Black',
        location: { address: '200 Marina St', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600001' },
        available: true,
        owner: pickOwner(3),
      },
      {
        make: 'Ford',
        model: 'Mustang',
        year: 2023,
        category: 'sports',
        transmission: 'manual',
        fuelType: 'petrol',
        seats: 4,
        doors: 2,
        pricePerDay: 5395,
        images: ['https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80'],
        features: ['Sport Mode', 'Premium Audio', 'Keyless Entry'],
        description: 'Iconic sports car with thrilling performance.',
        licensePlate: 'TS07-FOR-' + Math.floor(Math.random() * 9000 + 1000),
        vin: 'FOR' + Math.floor(Math.random() * 1e15).toString().padStart(15, '0'),
        mileage: 12000,
        color: 'Red',
        location: { address: '500 Charminar Rd', city: 'Hyderabad', state: 'Telangana', zipCode: '500001' },
        available: true,
        owner: pickOwner(4),
      },
      {
        make: 'Toyota',
        model: 'Prius',
        year: 2022,
        category: 'economy',
        transmission: 'automatic',
        fuelType: 'hybrid',
        seats: 5,
        doors: 4,
        pricePerDay: 2905,
        images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'],
        features: ['Hybrid Drive', 'Eco Mode', 'Bluetooth'],
        description: 'Economical hybrid perfect for city commutes.',
        licensePlate: 'MH12-PRI-' + Math.floor(Math.random() * 9000 + 1000),
        vin: 'PRI' + Math.floor(Math.random() * 1e15).toString().padStart(15, '0'),
        mileage: 35000,
        color: 'Green',
        location: { address: '45 FC Road', city: 'Pune', state: 'Maharashtra', zipCode: '411004' },
        available: true,
        owner: pickOwner(5),
      },
      {
        make: 'Maruti',
        model: 'Swift',
        year: 2021,
        category: 'compact',
        transmission: 'manual',
        fuelType: 'petrol',
        seats: 5,
        doors: 4,
        pricePerDay: 1800,
        images: ['https://images.unsplash.com/photo-1601707781779-0e52d4da745b?auto=format&fit=crop&w=800&q=80'],
        features: ['USB', 'AC', 'Power Windows'],
        description: 'Popular compact hatchback, great for daily use.',
        licensePlate: 'GJ01-SWI-' + Math.floor(Math.random() * 9000 + 1000),
        vin: 'SWI' + Math.floor(Math.random() * 1e15).toString().padStart(15, '0'),
        mileage: 42000,
        color: 'White',
        location: { address: '12 CG Road', city: 'Ahmedabad', state: 'Gujarat', zipCode: '380009' },
        available: true,
        owner: pickOwner(6),
      },
      {
        make: 'Maruti',
        model: 'Alto',
        year: 2020,
        category: 'economy',
        transmission: 'cvt',
        fuelType: 'petrol',
        seats: 4,
        doors: 4,
        pricePerDay: 1500,
        images: ['https://images.unsplash.com/photo-1594508355177-3c2c5e0d4b77?auto=format&fit=crop&w=800&q=80'],
        features: ['AC', 'FM Radio'],
        description: 'Basic and reliable city car.',
        licensePlate: 'RJ14-ALT-' + Math.floor(Math.random() * 9000 + 1000),
        vin: 'ALT' + Math.floor(Math.random() * 1e15).toString().padStart(15, '0'),
        mileage: 60000,
        color: 'Gray',
        location: { address: '8 MI Road', city: 'Jaipur', state: 'Rajasthan', zipCode: '302001' },
        available: true,
        owner: pickOwner(7),
      },
    ];

    let created = 0;
    let skipped = 0;
    for (const spec of demoCars) {
      const exists = await Car.findOne({ make: spec.make, model: spec.model });
      if (exists) {
        skipped += 1;
        continue;
      }
      await Car.create(spec);
      created += 1;
    }

    console.log(`✅ Seed complete. Created: ${created}, Skipped: ${skipped}`);
  } catch (error) {
    console.error('❌ Error seeding demo cars:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
};

seedDemoCars();