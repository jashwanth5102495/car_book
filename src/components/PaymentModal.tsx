import React, { useState } from 'react';
import { X } from 'lucide-react';
import PaymentForm from './PaymentForm';
import { paymentsApi } from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  totalAmount: number;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  totalAmount,
  onPaymentSuccess
}) => {
  const [error, setError] = useState('');

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Update booking with payment information
      const response = await paymentsApi.create({
        bookingId,
        paymentIntentId,
        amount: totalAmount,
        status: 'completed'
      });
      
      if (response.data.success) {
        onPaymentSuccess();
        onClose();
      } else {
        setError('Failed to confirm payment. Please contact support.');
      }
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      setError('Failed to confirm payment. Please contact support.');
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Complete Payment
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
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Stripe Payment Form */}
          <PaymentForm
            amount={totalAmount}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;