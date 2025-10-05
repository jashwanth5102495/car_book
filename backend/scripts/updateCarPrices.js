import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const carData = {
  'Prius': { pricePerDay: 2905, make: 'Toyota', category: 'economy', fuelType: 'hybrid' },
  'Camry': { pricePerDay: 3735, make: 'Toyota', category: 'midsize', fuelType: 'petrol' },
  'Civic': { pricePerDay: 3320, make: 'Honda', category: 'compact', fuelType: 'petrol' },
  'Model 3': { pricePerDay: 7055, make: 'Tesla', category: 'luxury', fuelType: 'electric' },
  'X5': { pricePerDay: 6225, make: 'BMW', category: 'suv', fuelType: 'petrol' },
  'Mustang': { pricePerDay: 5395, make: 'Ford', category: 'sports', fuelType: 'petrol' }
};

const updateCarPrices = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/car_rental';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get the cars collection directly to avoid schema validation issues
    const db = mongoose.connection.db;
    const carsCollection = db.collection('cars');

    // Get all cars
    const cars = await carsCollection.find({}).toArray();
    console.log(`Found ${cars.length} cars in database`);

    // Update each car with proper fields
    for (const car of cars) {
      const updateData = carData[car.model];
      if (updateData) {
        const updateFields = {
          pricePerDay: updateData.pricePerDay,
          make: updateData.make,
          category: updateData.category,
          fuelType: updateData.fuelType,
          transmission: car.transmission || 'automatic',
          seats: car.seats || 5,
          doors: 4,
          licensePlate: `${updateData.make.substring(0,2).toUpperCase()}${Math.floor(Math.random() * 10000)}`,
          vin: `${updateData.make.substring(0,3).toUpperCase()}${Math.floor(Math.random() * 1000000000000000)}`,
          mileage: Math.floor(Math.random() * 50000),
          color: 'Black',
          location: (() => {
            // Support both string and object location shapes
            const loc = car.location;
            if (loc && typeof loc === 'object') {
              return {
                address: loc.address || '123 Main St',
                city: loc.city || 'Mumbai',
                state: loc.state || 'Maharashtra',
                zipCode: loc.zipCode || '400001'
              };
            }
            const parts = (typeof loc === 'string' ? loc : '').split(',');
            return {
              address: '123 Main St',
              city: (parts[0] || 'Mumbai').trim(),
              state: (parts[1] || 'Maharashtra').trim(),
              zipCode: '400001'
            };
          })()
        };

        await carsCollection.updateOne(
          { _id: car._id },
          { $set: updateFields }
        );
        
        console.log(`Updated ${car.brand} ${car.model} (${car.year}) with price: ₹${updateData.pricePerDay}`);
      } else {
        console.log(`No data found for ${car.brand} ${car.model}`);
      }
    }

    console.log('Car data updated successfully!');
    
    // Verify the updates
    const updatedCars = await carsCollection.find({}).project({ brand: 1, model: 1, year: 1, pricePerDay: 1 }).toArray();
    console.log('\nUpdated cars:');
    updatedCars.forEach(car => {
      console.log(`${car.brand} ${car.model} (${car.year}): ₹${car.pricePerDay}`);
    });

  } catch (error) {
    console.error('Error updating car data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateCarPrices();