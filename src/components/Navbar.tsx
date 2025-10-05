import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, User, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const { user, logout, loginAsAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleAdminLogin = async () => {
    try {
      setIsAdminLoading(true);
      const success = await loginAsAdmin();
      setIsAdminLoading(false);
      if (success) {
        navigate('/admin-dashboard');
        setIsMenuOpen(false);
      } else {
        alert('Admin login failed. Please ensure the admin user exists by running the backend script: node scripts/createAdmin.js');
      }
    } catch (error) {
      setIsAdminLoading(false);
      console.error('Admin login failed:', error);
      alert('Admin login failed. Please ensure the admin user exists and the backend is running.');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">RentCar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600'
              }`}
            >
              Browse Cars
            </Link>
            
            {user ? (
              <>
                {/* Dashboard Link based on user role */}
                {user.role === 'admin' && (
                  <Link 
                    to="/admin-dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin-dashboard') ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600'
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                {user.role === 'car_owner' && (
                  <Link 
                    to="/owner-dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/owner-dashboard') ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600'
                    }`}
                  >
                    My Cars
                  </Link>
                )}
                
                {user.role === 'customer' && (
                  <Link 
                    to="/customer-dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/customer-dashboard') ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600'
                    }`}
                  >
                    My Bookings
                  </Link>
                )}
                
                <div className="flex items-center space-x-4">
                  {/* Theme Switcher */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>
                  
                  <span className="text-gray-700 dark:text-gray-300">Welcome, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Theme Switcher */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                
                <button
                  onClick={handleAdminLogin}
                  disabled={isAdminLoading}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors text-white ${isAdminLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {isAdminLoading ? 'Logging in…' : 'Admin'}
                </button>
                
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Switcher for Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Cars
              </Link>
              
              {user ? (
                <>
                  {/* Dashboard Links for Mobile based on user role */}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin-dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  
                  {user.role === 'car_owner' && (
                    <Link
                      to="/owner-dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Cars
                    </Link>
                  )}
                  
                  {user.role === 'customer' && (
                    <Link
                      to="/customer-dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Bookings
                    </Link>
                  )}
                  
                  <div className="px-3 py-2 text-gray-700 dark:text-gray-300">Welcome, {user.name}</div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAdminLogin}
                    disabled={isAdminLoading}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white ${isAdminLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                  >
                    {isAdminLoading ? 'Logging in…' : 'Admin'}
                  </button>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;