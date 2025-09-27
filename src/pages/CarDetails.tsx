import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Fuel, Settings, Star, Calendar, ArrowLeft } from 'lucide-react';
import { carsApi } from '../services/api';
import { formatINR } from '../utils/currency';
import { useAuth } from '../contexts/AuthContext';
import BookingConfirmationModal from '../components/BookingConfirmationModal';

interface Car {
  _id: string;
  model: string;
  brand: string;
  year: number;
  pricePerDay: number;
  location: string;
  image_url: string;
  fuel_type: string;
  transmission: string;
  seats: number;
  description?: string;
}

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow.toISOString().split('T')[0];
  });
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCarDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (startDate && endDate && car && car.pricePerDay) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTotalDays(diffDays);
      
      // Add validation to prevent NaN
      const pricePerDay = Number(car.pricePerDay) || 0;
      const calculatedTotal = diffDays * pricePerDay;
      
      console.log('Price calculation:', {
        diffDays,
        pricePerDay,
        calculatedTotal,
        car: car,
        carPricePerDay: car.pricePerDay,
        carPricePerDayType: typeof car.pricePerDay
      });
      
      setTotalPrice(isNaN(calculatedTotal) || calculatedTotal <= 0 ? 0 : calculatedTotal);
    } else if (startDate && endDate && car) {
      console.warn('Car data missing pricePerDay:', car);
      setTotalPrice(0);
    }
  }, [startDate, endDate, car]);

  const fetchCarDetails = async (carId: string) => {
    try {
      setLoading(true);
      const response = await carsApi.getById(carId);
      console.log('API response for car:', response.data);
      setCar(response.data);
    } catch (error) {
      console.error('Error fetching car details:', error);
      // Fallback to sample data if API fails
      const sampleCar = {
        _id: carId,
        model: 'Camry',
        brand: 'Toyota',
        year: 2022,
        pricePerDay: 3735,
        location: 'Mumbai, Maharashtra',
        image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
        fuel_type: 'petrol',
        transmission: 'automatic',
        seats: 5,
        description: 'A reliable and comfortable sedan perfect for city drives and long trips. Features modern amenities and excellent fuel efficiency.'
      };
      console.log('Using fallback car data:', sampleCar);
      setCar(sampleCar);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    console.log('Opening booking modal with:', {
      startDate,
      endDate,
      totalDays,
      totalPrice,
      car: car,
      carPricePerDay: car?.pricePerDay
    });

    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    // Navigate to renter dashboard after successful booking
    navigate('/renter-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Car not found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Cars
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Car Image and Details */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <img
                src={car.image_url}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-64 sm:h-80 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80';
                }}
              />
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {car.brand} {car.model}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">{car.year}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">{formatINR(car.pricePerDay)}</p>
                    <p className="text-gray-600 dark:text-gray-400">per day</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-2" />
                    {typeof car.location === 'string' ? car.location : `${car.location?.city || ''}, ${car.location?.state || ''}`}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Users className="h-5 w-5 mr-2" />
                    {car.seats} seats
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Fuel className="h-5 w-5 mr-2" />
                    {car.fuel_type}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Settings className="h-5 w-5 mr-2" />
                    {car.transmission}
                  </div>
                </div>

                {car.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">{car.description}</p>
                  </div>
                )}

                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">(4.8) 124 reviews</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Book This Car</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pick-up Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-100 dark:text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Drop-off Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-100 dark:text-gray-900"
                  />
                </div>

                {totalDays > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{totalDays} days</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Price per day:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatINR(car.pricePerDay)}</span>
                    </div>
                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                      <span className="text-lg font-bold text-blue-600">{formatINR(totalPrice)}</span>
                    </div>
                  </div>
                )}

                {(!startDate || !endDate || totalDays <= 0) && (
                  <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                      Please select valid pickup and drop-off dates to calculate the total price.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={!startDate || !endDate || totalDays <= 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {user ? 'Book Now' : 'Login to Book'}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Free cancellation up to 24 hours before pickup
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {car && (
        <BookingConfirmationModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          car={car}
          startDate={startDate}
          endDate={endDate}
          totalDays={totalDays}
          totalPrice={totalPrice}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default CarDetails;