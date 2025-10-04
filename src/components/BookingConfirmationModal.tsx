import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Fuel, Settings, CreditCard } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { bookingsApi } from '../services/api';
import PaymentModal from './PaymentModal';

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  images: string[];
  fuelType: string;
  transmission: string;
  seats: number;
  doors: number;
  features: string[];
  description?: string;
  category: string;
  licensePlate: string;
  vin: string;
  mileage: number;
  color: string;
  available: boolean;
  rating: {
    average: number;
    count: number;
  };
  owner: string;
}

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  onBookingSuccess: () => void;
}

const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  car,
  startDate,
  endDate,
  totalDays,
  totalPrice,
  onBookingSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Debug logging
  React.useEffect(() => {
    if (isOpen) {
      console.log('BookingConfirmationModal opened with props:', {
        car,
        startDate,
        endDate,
        totalDays,
        totalPrice,
        carPricePerDay: car?.pricePerDay
      });
    }
  }, [isOpen, car, startDate, endDate, totalDays, totalPrice]);

  if (!isOpen) return null;

  const handleConfirmBooking = async () => {
    try {
      setIsLoading(true);
      setError('');

      const bookingData = {
        carId: car._id,
        startDate,
        endDate
      };

      console.log('Booking data being sent:', {
        ...bookingData,
        carPricePerDay: car.pricePerDay,
        calculatedDays: totalDays,
        calculatedTotal: totalPrice
      });

      const response = await bookingsApi.create(bookingData);
      
      // Store booking ID and show payment modal
      setBookingId(response.data._id);
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error('Booking error:', error);
      setError(error.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    alert('Booking and payment completed successfully!');
    onBookingSuccess();
    onClose();
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  const handleSkipPayment = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Create the booking in the backend
      const bookingData = {
        carId: car._id,
        startDate,
        endDate,
        paymentStatus: 'skipped', // Mark as test/skipped payment
        status: 'confirmed'
      };

      const response = await bookingsApi.create(bookingData);
      
      // Show success popup
      alert(`🎉 Booking Successful! 
      
Booking ID: ${response.data._id}
Car: ${car.make} ${car.model}
Dates: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}
Total: ${formatINR(totalPrice)}

(Test mode - payment skipped)
      
Your booking has been recorded in your dashboard!`);
      
      onBookingSuccess();
      onClose();
    } catch (error: any) {
      console.error('Skip payment booking error:', error);
      setError(error.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Confirm Your Booking
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Car Details */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <img
              src={car.images?.[0] ? `http://localhost:5001${car.images[0]}` : '/placeholder-car.jpg'}
              alt={`${car.make} ${car.model}`}
              className="w-full sm:w-48 h-32 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {car.make} {car.model} ({car.year})
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {car.location?.city}, {car.location?.state}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {car.seats} seats
                </div>
                <div className="flex items-center">
                  <Fuel className="h-4 w-4 mr-1" />
                  {car.fuelType}
                </div>
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-1" />
                  {car.transmission}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Booking Details</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  Pick-up Date:
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  Drop-off Date:
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-medium text-gray-900 dark:text-white">{totalDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Price per day:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatINR(car.pricePerDay)}</span>
              </div>
              <hr className="border-gray-200 dark:border-gray-600" />
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount:</span>
                <span className="text-lg font-bold text-blue-600">{formatINR(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Payment Information</h4>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              After confirming your booking, you'll be prompted to complete payment securely using your credit/debit card or other payment methods.
            </p>
          </div>

          {/* Terms */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Terms & Conditions</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Free cancellation up to 24 hours before pickup</li>
              <li>• Valid driver's license required</li>
              <li>• Fuel tank should be returned at the same level</li>
              <li>• Late return charges may apply</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Debug Info for Invalid Amount */}
          {totalPrice <= 0 && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Invalid total amount calculation</p>
              <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                Debug: Days={totalDays}, Price per day={formatINR(car.pricePerDay)}, Total={formatINR(totalPrice)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSkipPayment}
              disabled={totalPrice <= 0}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Skip Payment (Test)
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={isLoading || totalPrice <= 0}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirming...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && bookingId && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentCancel}
          bookingId={bookingId}
          amount={totalPrice}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default BookingConfirmationModal;