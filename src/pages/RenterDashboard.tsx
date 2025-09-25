import React, { useState, useEffect } from 'react';
import { Car, Plus, Edit, Trash2, Eye, DollarSign, MapPin, Calendar } from 'lucide-react';
import { carsApi, bookingsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../utils/currency';
import CarListingForm from '../components/CarListingForm';

interface Car {
  _id: string;
  model: string;
  brand: string;
  year: number;
  price_per_day: number;
  location: string;
  availability_status: string;
  image_url: string;
  features: string;
  fuel_type: string;
  transmission: string;
  seats: number;
}

interface Booking {
  _id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  pickup_location: string;
  dropoff_location: string;
  car_id: Car;
  user_id: {
    name: string;
    email: string;
    phone: string;
  };
}

const RenterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cars' | 'bookings'>('cars');
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [showListingForm, setShowListingForm] = useState(false);
  const [isSubmittingCar, setIsSubmittingCar] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyCars();
      fetchMyBookings();
    }
  }, [user]);

  const fetchMyCars = async () => {
    try {
      const response = await carsApi.getMyCars();
      setCars(response.data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  const fetchMyBookings = async () => {
    try {
      // Get all bookings and filter for cars owned by this user
      const response = await bookingsApi.getAll();
      const myCarBookings = response.data.filter((booking: any) => 
        booking.car_id?.owner?._id === user?.id
      );
      setBookings(myCarBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleCarListingSubmit = async (carData: FormData) => {
    setIsSubmittingCar(true);
    try {
      const response = await carsApi.create(carData);
      console.log('Car listed successfully:', response.data);
      setShowListingForm(false);
      await fetchMyCars(); // Refresh the cars list
    } catch (error: any) {
      console.error('Error submitting car listing:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('Error listing car: ' + errorMessage);
    } finally {
      setIsSubmittingCar(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'booked':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showListingForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <CarListingForm
          onSubmit={handleCarListingSubmit}
          onCancel={() => setShowListingForm(false)}
          isLoading={isSubmittingCar}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Car Owner Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your cars and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cars</p>
                <p className="text-2xl font-bold text-gray-900">{cars.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatINR(bookings.reduce((sum, booking) => sum + booking.total_price, 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Cars</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cars.filter(c => c.availability_status === 'available').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('cars')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'cars'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Cars ({cars.length})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bookings ({bookings.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'cars' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">My Cars</h2>
                  <button
                    onClick={() => setShowListingForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Car
                  </button>
                </div>

                {cars.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No cars listed yet</h3>
                    <p className="text-gray-600 mb-4">Start earning by listing your first car!</p>
                    <button
                      onClick={() => setShowListingForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Add Your First Car
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cars.map((car) => (
                      <div key={car._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="aspect-w-16 aspect-h-9 mb-4">
                          <img
                            src={car.image_url || '/placeholder-car.jpg'}
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">
                            {car.brand} {car.model} ({car.year})
                          </h3>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{car.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="text-sm">{formatINR(car.price_per_day)}/day</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(car.availability_status)}`}>
                              {car.availability_status}
                            </span>
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-800">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Car Bookings</h2>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600">Bookings for your cars will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                              {booking.car_id?.brand} {booking.car_id?.model}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <p><strong>Customer:</strong> {booking.user_id?.name}</p>
                                <p><strong>Email:</strong> {booking.user_id?.email}</p>
                                <p><strong>Phone:</strong> {booking.user_id?.phone}</p>
                              </div>
                              <div>
                                <p><strong>Pickup:</strong> {booking.pickup_location}</p>
                                <p><strong>Dropoff:</strong> {booking.dropoff_location}</p>
                                <p><strong>Duration:</strong> {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            <p className="text-lg font-bold text-gray-900 mt-2">
                              {formatINR(booking.total_price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenterDashboard;