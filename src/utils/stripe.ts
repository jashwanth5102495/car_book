import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
// For development, you can use a test key that starts with 'pk_test_'
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef';

export const stripePromise = loadStripe(stripePublishableKey);