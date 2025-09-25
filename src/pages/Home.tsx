import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Users, Fuel, Settings, Star, Filter } from 'lucide-react';
import { carsApi } from '../services/api';
import { formatINR } from '../utils/currency';

interface Car {
  _id: string;
  model: string;
  brand: string;
  year: number;
  price_per_day: number;
  location: string;
  image_url: string;
  fuel_type: string;
  transmission: string;
  seats: number;
}

const Home: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    fuelType: '',
    transmission: '',
    seats: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async (filterParams?: any) => {
    try {
      setLoading(true);
      console.log('Fetching cars with filters:', filterParams || filters);
      const response = await carsApi.getAll(filterParams || filters);
      console.log('API response:', response);
      console.log('Cars data:', response.data);
      
      // If API returns empty or fails, use sample data
      if (!response.data || response.data.length === 0) {
        console.log('No cars from API, using sample data');
        const sampleCars = [
          {
            _id: '1',
            model: 'Camry',
            brand: 'Toyota',
            year: 2022,
            price_per_day: 3735,
            location: 'Mumbai, Maharashtra',
            image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
            fuel_type: 'petrol',
            transmission: 'automatic',
            seats: 5
          },
          {
            _id: '2',
            model: 'Civic',
            brand: 'Honda',
            year: 2023,
            price_per_day: 3320,
            location: 'Delhi, Delhi',
            image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
            fuel_type: 'petrol',
            transmission: 'manual',
            seats: 5
          },
          {
            _id: '3',
            model: 'Model 3',
            brand: 'Tesla',
            year: 2023,
            price_per_day: 7055,
            location: 'Bangalore, Karnataka',
            image_url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
            fuel_type: 'electric',
            transmission: 'automatic',
            seats: 5
          },
          {
            _id: '4',
            model: 'X5',
            brand: 'BMW',
            year: 2022,
            price_per_day: 6225,
            location: 'Chennai, Tamil Nadu',
            image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
            fuel_type: 'petrol',
            transmission: 'automatic',
            seats: 7
          },
          {
            _id: '5',
            model: 'Mustang',
            brand: 'Ford',
            year: 2023,
            price_per_day: 5395,
            location: 'Hyderabad, Telangana',
            image_url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80',
            fuel_type: 'petrol',
            transmission: 'manual',
            seats: 4
          },
          {
            _id: '6',
            model: 'Prius',
            brand: 'Toyota',
            year: 2022,
            price_per_day: 2905,
            location: 'Pune, Maharashtra',
            image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
            fuel_type: 'hybrid',
            transmission: 'automatic',
            seats: 5
          }
        ];
        setCars(sampleCars);
      } else {
        setCars(response.data);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      // Fallback to sample data on error
      const sampleCars = [
        {
          _id: '1',
          model: 'Camry',
          brand: 'Toyota',
          year: 2022,
          price_per_day: 3735,
          location: 'Mumbai, Maharashtra',
          image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
          fuel_type: 'petrol',
          transmission: 'automatic',
          seats: 5
        },
        {
          _id: '2',
          model: 'Civic',
          brand: 'Honda',
          year: 2023,
          price_per_day: 3320,
          location: 'Delhi, Delhi',
          image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
          fuel_type: 'petrol',
          transmission: 'manual',
          seats: 5
        },
        {
          _id: '3',
          model: 'Model 3',
          brand: 'Tesla',
          year: 2023,
          price_per_day: 7055,
          location: 'Bangalore, Karnataka',
          image_url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
          fuel_type: 'electric',
          transmission: 'automatic',
          seats: 5
        },
        {
          _id: '4',
          model: 'X5',
          brand: 'BMW',
          year: 2022,
          price_per_day: 6225,
          location: 'Chennai, Tamil Nadu',
          image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
          fuel_type: 'petrol',
          transmission: 'automatic',
          seats: 7
        },
        {
          _id: '5',
          model: 'Mustang',
          brand: 'Ford',
          year: 2023,
          price_per_day: 5395,
          location: 'Hyderabad, Telangana',
          image_url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80',
          fuel_type: 'petrol',
          transmission: 'manual',
          seats: 4
        },
        {
          _id: '6',
          model: 'Prius',
          brand: 'Toyota',
          year: 2022,
          price_per_day: 2905,
          location: 'Pune, Maharashtra',
          image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
          fuel_type: 'hybrid',
          transmission: 'automatic',
          seats: 5
        }
      ];
      setCars(sampleCars);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Create clean filter object (remove empty values)
    const cleanFilters = Object.entries(newFilters).reduce((acc, [k, v]) => {
      if (v) acc[k] = v;
      return acc;
    }, {} as any);
    
    fetchCars(cleanFilters);
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      fuelType: '',
      transmission: '',
      seats: ''
    });
    fetchCars();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Car
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Rent premium cars at the best prices
            </p>
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by brand or model..."
                    className="w-full px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fuel Type</label>
                <select
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.fuelType}
                  onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transmission</label>
                <select
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.transmission}
                  onChange={(e) => handleFilterChange('transmission', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cars Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Available Cars ({cars.length})
              </h2>
            </div>
            
            {cars.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-4">
                  <Search className="h-full w-full" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No cars found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cars.map((car) => (
                  <div key={car._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl dark:hover:shadow-2xl transition-shadow group">
                    <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                      <img
                        src={car.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {car.brand} {car.model}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">{car.year}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatINR(car.price_per_day)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">per day</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {car.location}
                        </div>
                        <div className="flex items-center">
                          <Fuel className="h-4 w-4 mr-1" />
                          {car.fuel_type}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {car.seats} seats
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-6">
                        <div className="flex items-center">
                          <Settings className="h-4 w-4 mr-1" />
                          {car.transmission}
                        </div>
                        <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs">
                          Available
                        </div>
                      </div>
                      
                      <Link
                        to={`/cars/${car._id}`}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center block"
                      >
                        View Details & Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;