import React, { useState, useEffect } from 'react';
import { Car, Plus, Edit, Trash2, Eye, DollarSign, Calendar, MapPin, Star, Upload, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatINR } from '../utils/currency';

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  pricePerDay: number;
  images: string[];
  features: string[];
  description: string;
  licensePlate: string;
  vin: string;
  mileage: number;
  color: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  available: boolean;
  rating: {
    average: number;
    count: number;
  };
  owner: string;
  createdAt: string;
}

interface Booking {
  _id: string;
  car: Car;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

interface CarFormData {
  make: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  pricePerDay: number;
  features: string[];
  description: string;
  licensePlate: string;
  vin: string;
  mileage: number;
  color: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'cars' | 'bookings' | 'add-car'>('cars');
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const [carFormData, setCarFormData] = useState<CarFormData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    category: 'economy',
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    doors: 4,
    pricePerDay: 0,
    features: [],
    description: '',
    licensePlate: '',
    vin: '',
    mileage: 0,
    color: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const availableFeatures = [
    'Air Conditioning', 'Bluetooth', 'GPS Navigation', 'Backup Camera',
    'Heated Seats', 'Sunroof', 'Leather Seats', 'USB Ports',
    'Wireless Charging', 'Apple CarPlay', 'Android Auto', 'Cruise Control',
    'Parking Sensors', 'Keyless Entry', 'Push Start', 'Premium Audio'
  ];

  const categories = [
    'economy', 'compact', 'midsize', 'fullsize', 'luxury', 'suv', 'convertible', 'sports'
  ];

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchMyCars(), fetchMyBookings()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCars = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/cars/my-cars', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        const carsData = Array.isArray(data) ? data : (data.data || data.cars || []);
        setCars(carsData);
      }
    } catch (error) {
      console.error('Error fetching my cars:', error);
      setCars([]);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/bookings/owner-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        const bookingsData = Array.isArray(data) ? data : (data.data || data.bookings || []);
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
  };

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic client-side validation to avoid common server rejections
    const validationErrors: string[] = [];
    if (!carFormData.make?.trim()) validationErrors.push('Make is required');
    if (!carFormData.model?.trim()) validationErrors.push('Model is required');
    if (!carFormData.category?.trim()) validationErrors.push('Category is required');
    if (!['manual', 'automatic', 'cvt'].includes(carFormData.transmission)) validationErrors.push('Transmission must be manual, automatic, or cvt');
    if (!['petrol', 'diesel', 'electric', 'hybrid', 'gasoline'].includes(carFormData.fuelType)) validationErrors.push('Fuel type must be petrol, diesel, electric, hybrid, or gasoline');
    if (!Number.isFinite(carFormData.year) || carFormData.year < 1900 || carFormData.year > new Date().getFullYear() + 1) validationErrors.push('Valid year is required');
    if (!Number.isFinite(carFormData.seats) || carFormData.seats < 2 || carFormData.seats > 8) validationErrors.push('Seats must be between 2 and 8');
    if (!Number.isFinite(carFormData.doors) || carFormData.doors < 2 || carFormData.doors > 5) validationErrors.push('Doors must be between 2 and 5');
    if (!Number.isFinite(carFormData.pricePerDay) || carFormData.pricePerDay <= 0) validationErrors.push('Price per day must be greater than 0');
    if (!carFormData.licensePlate?.trim()) validationErrors.push('License plate is required');
    if (!carFormData.vin?.trim()) validationErrors.push('VIN is required');
    if (!Number.isFinite(carFormData.mileage) || carFormData.mileage < 0) validationErrors.push('Mileage must be a positive number');
    if (!carFormData.color?.trim()) validationErrors.push('Color is required');
    if (!carFormData.location?.address?.trim()) validationErrors.push('Address is required');
    if (!carFormData.location?.city?.trim()) validationErrors.push('City is required');
    if (!carFormData.location?.state?.trim()) validationErrors.push('State is required');
    if (!carFormData.location?.zipCode?.trim()) validationErrors.push('ZIP Code is required');

    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    if (selectedImages.length === 0) {
      alert('Please select at least one image for your car');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(carFormData).forEach(key => {
        const value = carFormData[key as keyof CarFormData];
        if (key === 'location') {
          // Handle nested location object
          formData.append('location[address]', (value as any).address);
          formData.append('location[city]', (value as any).city);
          formData.append('location[state]', (value as any).state);
          formData.append('location[zipCode]', (value as any).zipCode);
        } else if (key === 'features') {
          // Handle features array
          formData.append('features', (value as string[]).join(','));
        } else {
          formData.append(key, value.toString());
        }
      });
      
      // Add images to FormData
      selectedImages.forEach((image, index) => {
        formData.append('images', image);
      });
      
      const response = await fetch('http://localhost:5001/api/cars', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        await fetchMyCars();
        setShowAddCarModal(false);
        resetForm();
        alert('Car added successfully!');
      } else {
        // Try to surface meaningful backend validation errors
        let message = 'Failed to add car';
        try {
          const error = await response.json();
          if (Array.isArray(error.errors)) {
            // express-validator style: errors: [{ msg, param, ... }]
            const msgs = error.errors.map((e: any) => e.msg || e).filter(Boolean);
            if (msgs.length) message = msgs.join('\n');
          } else if (typeof error.message === 'string' && error.message.trim()) {
            // Mongoose or custom messages
            message = error.message;
            if (Array.isArray(error.errors) && error.errors.length) {
              const extra = error.errors.map((e: any) => (typeof e === 'string' ? e : e.message || e)).filter(Boolean);
              if (extra.length) message += `\n${extra.join('\n')}`;
            }
          }
        } catch (_) {
          // swallow JSON parse errors, keep generic message
        }
        alert(message);
      }
    } catch (error) {
      console.error('Error adding car:', error);
      alert('Failed to add car');
    }
  };

  const handleUpdateCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/cars/${editingCar._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(carFormData)
      });

      if (response.ok) {
        await fetchMyCars();
        setEditingCar(null);
        resetForm();
        alert('Car updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update car');
      }
    } catch (error) {
      console.error('Error updating car:', error);
      alert('Failed to update car');
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/cars/${carId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchMyCars();
        alert('Car deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete car');
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('Failed to delete car');
    }
  };

  const toggleCarAvailability = async (carId: string, available: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/cars/${carId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ available })
      });

      if (response.ok) {
        await fetchMyCars();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability');
    }
  };

  const resetForm = () => {
    setCarFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      category: 'economy',
      transmission: 'automatic',
      fuelType: 'petrol',
      seats: 5,
      doors: 4,
      pricePerDay: 0,
      features: [],
      description: '',
      licensePlate: '',
      vin: '',
      mileage: 0,
      color: '',
      location: {
        address: '',
        city: '',
        state: '',
        zipCode: ''
      }
    });
    setSelectedImages([]);
    setImagePreviewUrls([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Please select only image files (JPEG, PNG, WebP)');
      return;
    }

    // Limit to 5 images total
    const totalImages = selectedImages.length + files.length;
    if (totalImages > 5) {
      alert('You can upload maximum 5 images');
      return;
    }

    // Add new files to selected images
    setSelectedImages(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const startEditing = (car: Car) => {
    setEditingCar(car);
    setCarFormData({
      make: car.make,
      model: car.model,
      year: car.year,
      category: car.category,
      transmission: car.transmission,
      fuelType: car.fuelType,
      seats: car.seats,
      doors: car.doors,
      pricePerDay: car.pricePerDay,
      features: car.features,
      description: car.description,
      licensePlate: car.licensePlate,
      vin: car.vin,
      mileage: car.mileage,
      color: car.color,
      location: car.location
    });
  };

  const handleFeatureToggle = (feature: string) => {
    setCarFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateEarnings = () => {
    return bookings
      .filter(b => b.status === 'completed')
      .reduce((total, booking) => total + booking.totalPrice, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Car Owner Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your car listings and track your earnings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Cars</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{cars.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{bookings.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatINR(calculateEarnings())}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cars.length > 0 
                    ? (cars.reduce((sum, car) => sum + car.rating.average, 0) / cars.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('cars')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cars'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              My Cars
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Bookings
            </button>
          </nav>
        </div>

        {/* My Cars Tab */}
        {activeTab === 'cars' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Cars</h2>
              <button
                onClick={() => setShowAddCarModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Car
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <div key={car._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={car.images[0]
                        ? (car.images[0].startsWith('http')
                            ? car.images[0]
                            : `http://localhost:5001${car.images[0]}`)
                        : '/placeholder-car.jpg'}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        car.available 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {car.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {car.year} {car.make} {car.model}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {car.location.city}, {car.location.state}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                          {car.rating.average.toFixed(1)} ({car.rating.count})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatINR(car.pricePerDay)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">/day</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(car)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => toggleCarAvailability(car._id, !car.available)}
                        className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                          car.available
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {car.available ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteCar(car._id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cars.length === 0 && (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No cars listed yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start earning by listing your first car!
                </p>
                <button
                  onClick={() => setShowAddCarModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  Add Your First Car
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Bookings</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {bookings.map((booking) => (
                  <div key={booking._id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <img
                          src={booking.car.images[0] ? `http://localhost:5001${booking.car.images[0]}` : '/placeholder-car.jpg'}
                          alt={`${booking.car.make} ${booking.car.model}`}
                          className="w-16 h-16 object-cover rounded-lg mr-4"
                        />
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {booking.car.year} {booking.car.make} {booking.car.model}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Customer: {booking.customer.name}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Start Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">End Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Customer Contact</p>
                        <p className="font-medium text-gray-900 dark:text-white">{booking.customer.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Earnings</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatINR(booking.totalPrice)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {bookings.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookings yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your car bookings will appear here once customers start renting.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Car Modal */}
        {(showAddCarModal || editingCar) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {editingCar ? 'Edit Car' : 'Add New Car'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddCarModal(false);
                      setEditingCar(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={editingCar ? handleUpdateCar : handleAddCar} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Make *
                      </label>
                      <input
                        type="text"
                        required
                        value={carFormData.make}
                        onChange={(e) => setCarFormData(prev => ({ ...prev, make: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Model *
                      </label>
                      <input
                        type="text"
                        required
                        value={carFormData.model}
                        onChange={(e) => setCarFormData(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Year *
                      </label>
                      <input
                        type="number"
                        required
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={carFormData.year || ''}
                        onChange={(e) => setCarFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        required
                        value={carFormData.category}
                        onChange={(e) => setCarFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Transmission *
                      </label>
                      <select
                        required
                        value={carFormData.transmission}
                        onChange={(e) => setCarFormData(prev => ({ ...prev, transmission: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      >
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fuel Type *
                      </label>
                      <select
                        required
                        value={carFormData.fuelType}
                        onChange={(e) => setCarFormData(prev => ({ ...prev, fuelType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      >
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="electric">Electric</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Seats *
                      </label>
                      <input
                        type="number"
                        required
                        min="2"
                        max="8"
                        value={carFormData.seats || ''}
                        onChange={(e) => setCarFormData(prev => ({ ...prev, seats: parseInt(e.target.value) || 5 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Doors *
                      </label>
                      <input
                        type="number"
                        required
                        min="2"
                        max="5"
                        value={carFormData.doors || ''}
                        onChange={(e) => setCarFormData(prev => ({ ...prev, doors: parseInt(e.target.value) || 4 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Price per Day ($) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={carFormData.pricePerDay || ''}
                        onChange={(e) => setCarFormData(prev => ({ ...prev, pricePerDay: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Color *
                      </label>
                      <input
                        type="text"
                        required
                        value={carFormData.color}
                        onChange={(e) => setCarFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        License Plate *
                      </label>
                      <input
                        type="text"
                        required
                        value={carFormData.licensePlate}
                        onChange={(e) => setCarFormData(prev => ({ ...prev, licensePlate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        VIN *
                      </label>
                      <input
                        type="text"
                        required
                        value={carFormData.vin}
                        onChange={(e) => setCarFormData(prev => ({ ...prev, vin: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mileage *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={carFormData.mileage || ''}
                        onChange={(e) => setCarFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Location</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={carFormData.location.address}
                          onChange={(e) => setCarFormData(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, address: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={carFormData.location.city}
                          onChange={(e) => setCarFormData(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, city: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={carFormData.location.state}
                          onChange={(e) => setCarFormData(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, state: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={carFormData.location.zipCode}
                          onChange={(e) => setCarFormData(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, zipCode: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Features
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {availableFeatures.map((feature) => (
                        <label key={feature} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={carFormData.features.includes(feature)}
                            onChange={() => handleFeatureToggle(feature)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={carFormData.description}
                      onChange={(e) => setCarFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:text-gray-900"
                      placeholder="Describe your car..."
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Car Images * (Maximum 5 images)
                    </label>
                    <div className="space-y-4">
                      {/* File Input */}
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">Click to upload</span> car images
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, JPEG or WebP (MAX. 5MB each)</p>
                          </div>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Image Previews */}
                      {imagePreviewUrls.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCarModal(false);
                        setEditingCar(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      {editingCar ? 'Update Car' : 'Add Car'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;