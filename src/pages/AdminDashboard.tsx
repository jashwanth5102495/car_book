import React, { useState, useEffect } from 'react';
import { Users, Car, Calendar, DollarSign, Check, X, Eye, Search, Filter, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { bookingsApi, usersApi, carsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../utils/currency';
import CarListingForm from '../components/CarListingForm';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  location: string;
  image_url: string;
  fuel_type: string;
  transmission: string;
  seats: number;
  availability_status: string;
  features?: string;
  owner: {
    name: string;
    email: string;
  };
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
  user_id: User;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bookings' | 'cars'>('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [isAddingCar, setIsAddingCar] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalRenters: 0,
    totalBookings: 0,
    totalCars: 0,
    availableCars: 0,
    rentedCars: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    recentBookings: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [usersRes, bookingsRes, carsRes] = await Promise.all([
        usersApi.getAll(),
        bookingsApi.getAll(),
        carsApi.getAll()
      ]);

      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setCars(carsRes.data);

      // Calculate comprehensive stats
      const allUsers = usersRes.data;
      const regularUsers = allUsers.filter((u: User) => u.role === 'user');
      const renters = allUsers.filter((u: User) => u.role === 'renter');
      const allBookings = bookingsRes.data;
      const allCars = carsRes.data;

      const totalRevenue = allBookings
        .filter((booking: Booking) => booking.status === 'confirmed' || booking.status === 'completed')
        .reduce((sum: number, booking: Booking) => sum + booking.total_price, 0);

      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = allBookings
        .filter((booking: Booking) => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate.getMonth() === currentMonth && 
                 bookingDate.getFullYear() === currentYear &&
                 (booking.status === 'confirmed' || booking.status === 'completed');
        })
        .reduce((sum: number, booking: Booking) => sum + booking.total_price, 0);

      // Recent bookings (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentBookings = allBookings.filter((booking: Booking) => 
        new Date(booking.createdAt) >= sevenDaysAgo
      ).length;

      setStats({
        totalUsers: regularUsers.length,
        activeUsers: regularUsers.filter((u: User) => u.isActive).length,
        blockedUsers: regularUsers.filter((u: User) => !u.isActive).length,
        totalRenters: renters.length,
        totalBookings: allBookings.length,
        totalCars: allCars.length,
        availableCars: allCars.filter((c: Car) => c.availability_status === 'available').length,
        rentedCars: allCars.filter((c: Car) => c.availability_status === 'rented').length,
        totalRevenue,
        monthlyRevenue,
        recentBookings,
        pendingBookings: allBookings.filter((b: Booking) => b.status === 'pending').length,
        confirmedBookings: allBookings.filter((b: Booking) => b.status === 'confirmed').length,
        cancelledBookings: allBookings.filter((b: Booking) => b.status === 'cancelled').length,
        completedBookings: allBookings.filter((b: Booking) => b.status === 'completed').length
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusToggle = async (userId: string) => {
    try {
      await usersApi.toggleStatus(userId);
      fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleBookingStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await bookingsApi.updateStatus(bookingId, status);
      fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleAddCar = async (carData: FormData) => {
    try {
      setIsAddingCar(true);
      await carsApi.create(carData);
      setShowAddCarForm(false);
      fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error adding car:', error);
      throw error;
    } finally {
      setIsAddingCar(false);
    }
  };

  // Filter all users (including renters and admins for comprehensive view)
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user_id?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.car_id?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.car_id?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.pickup_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.dropoff_location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredCars = cars.filter(car =>
    car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive system management and analytics</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: DollarSign },
                { key: 'users', label: 'Users', icon: Users },
                { key: 'bookings', label: 'Bookings', icon: Calendar },
                { key: 'cars', label: 'Cars', icon: Car }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">{stats.activeUsers} active • {stats.blockedUsers} blocked</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                    <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBookings}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">{stats.recentBookings} this week</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                    <Car className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cars</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCars}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">{stats.availableCars} available • {stats.rentedCars} rented</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                    <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatINR(stats.totalRevenue)}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{formatINR(stats.monthlyRevenue)} this month</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booking Status Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Status Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingBookings}</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.confirmedBookings}</p>
                    <p className="text-sm text-green-700 dark:text-green-300">Confirmed</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.completedBookings}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelledBookings}</p>
                    <p className="text-sm text-red-700 dark:text-red-300">Cancelled</p>
                  </div>
                </div>
              </div>

              {/* User & Car Analytics */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Car Renters</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.totalRenters}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Car Utilization</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.totalCars > 0 ? Math.round((stats.rentedCars / stats.totalCars) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">User Activity Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Booking Success Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.totalBookings > 0 ? Math.round(((stats.confirmedBookings + stats.completedBookings) / stats.totalBookings) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">All registered users including customers, renters, and admins</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">User Details</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Contact</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Role</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Joined</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">{user.phone || 'N/A'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : user.role === 'renter'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {user.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleUserStatusToggle(user._id)}
                            className={`flex items-center px-3 py-1 text-xs font-medium rounded transition-colors ${
                              user.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
                                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40'
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="h-3 w-3 mr-1" />
                                Block
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Activate
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No users found matching your search criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Booking Management</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">All bookings across the platform</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Customer</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Car</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Dates</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Location</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Amount</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Booked On</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{booking.user_id?.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{booking.user_id?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {booking.car_id?.brand} {booking.car_id?.model}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{booking.car_id?.year}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">
                            {new Date(booking.start_date).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">to</p>
                          <p className="text-gray-900 dark:text-white">
                            {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">Pickup: {booking.pickup_location}</p>
                          <p className="text-gray-600 dark:text-gray-400">Drop: {booking.dropoff_location}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                        {formatINR(booking.total_price)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        {booking.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleBookingStatusUpdate(booking._id, 'confirmed')}
                              className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              title="Confirm"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleBookingStatusUpdate(booking._id, 'cancelled')}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleBookingStatusUpdate(booking._id, 'completed')}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                            title="Mark as Completed"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No bookings found matching your search criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cars Tab */}
        {activeTab === 'cars' && (
          <div className="space-y-6">
            {/* Add Car Form Modal */}
            {showAddCarForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Car</h3>
                  </div>
                  <div className="p-6">
                    <CarListingForm
                      onSubmit={handleAddCar}
                      onCancel={() => setShowAddCarForm(false)}
                      isLoading={isAddingCar}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Car Management</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">All cars listed on the platform</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search cars..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={() => setShowAddCarForm(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Car
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCars.map((car) => (
                    <div key={car._id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                      <img
                        src={car.image_url 
                          ? `http://localhost:5000${car.image_url}`
                          : 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=300'
                        }
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {car.brand} {car.model} ({car.year})
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <p><strong className="text-gray-900 dark:text-white">Price:</strong> {formatINR(car.price_per_day)}/day</p>
                          <p><strong className="text-gray-900 dark:text-white">Location:</strong> {car.location}</p>
                          <p><strong className="text-gray-900 dark:text-white">Fuel:</strong> {car.fuel_type}</p>
                          <p><strong className="text-gray-900 dark:text-white">Transmission:</strong> {car.transmission}</p>
                          <p><strong className="text-gray-900 dark:text-white">Seats:</strong> {car.seats}</p>
                          <p><strong className="text-gray-900 dark:text-white">Owner:</strong> {car.owner?.name}</p>
                          {car.features && (
                            <p><strong className="text-gray-900 dark:text-white">Features:</strong> {car.features}</p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              car.availability_status === 'available' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {car.availability_status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredCars.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No cars found matching your search criteria.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;