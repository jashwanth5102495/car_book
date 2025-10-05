import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Car from '../models/Car.js';

dotenv.config();

const imageMap = [
  { make: 'Toyota', model: 'Camry', url: 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { make: 'Honda', model: 'Civic', url: 'https://images.pexels.com/photos/1113952/pexels-photo-1113952.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { make: 'Tesla', model: 'Model 3', url: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { make: 'BMW', model: 'X5', url: 'https://images.pexels.com/photos/261984/pexels-photo-261984.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { make: 'Ford', model: 'Mustang', url: 'https://images.pexels.com/photos/223907/pexels-photo-223907.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { make: 'Toyota', model: 'Prius', url: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { make: 'Maruti', model: 'Swift', url: 'https://images.pexels.com/photos/245035/pexels-photo-245035.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { make: 'Maruti', model: 'Alto', url: 'https://images.pexels.com/photos/244945/pexels-photo-244945.jpeg?auto=compress&cs=tinysrgb&w=800' }
];

async function updateCarImages() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/car_rental';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    let updated = 0;
    for (const { make, model, url } of imageMap) {
      const car = await Car.findOne({ make, model });
      if (!car) {
        console.log(`Skip: ${make} ${model} not found`);
        continue;
      }
      car.images = [url];
      car.image_url = url;
      await car.save();
      updated += 1;
      console.log(`Updated image for ${make} ${model}`);
    }

    console.log(`Done. Updated ${updated} cars.`);
  } catch (err) {
    console.error('Error updating car images:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
}

updateCarImages();