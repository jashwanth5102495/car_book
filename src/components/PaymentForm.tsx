import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  Elements
} from '@stripe/react-stripe-js';
import { stripePromise } from '../utils/stripe';
import { CreditCard, Lock } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  loading?: boolean;
}

const CheckoutForm: React.FC<PaymentFormProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  loading = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setCardError('');

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentMethodError) {
        setCardError(paymentMethodError.message || 'An error occurred');
        setIsProcessing(false);
        return;
      }

      // Create payment intent on your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          payment_method_id: paymentMethod.id
        })
      });

      const { client_secret, error } = await response.json();

      if (error) {
        onPaymentError(error);
        setIsProcessing(false);
        return;
      }

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret);

      if (confirmError) {
        onPaymentError(confirmError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error) {
      onPaymentError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center mb-4">
          <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-300">
          <CardElement
            options={cardElementOptions}
            onChange={(event) => {
              if (event.error) {
                setCardError(event.error.message);
              } else {
                setCardError('');
              }
            }}
          />
        </div>
        
        {cardError && (
          <div className="mt-2 text-sm text-red-600">
            {cardError}
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center">
          <Lock className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-blue-900">Secure Payment</p>
            <p className="text-sm text-blue-700">Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          <p className="text-lg font-semibold text-gray-900">
            Total: ${amount.toFixed(2)}
          </p>
        </div>
        <button
          type="submit"
          disabled={!stripe || isProcessing || loading}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            !stripe || isProcessing || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentForm;