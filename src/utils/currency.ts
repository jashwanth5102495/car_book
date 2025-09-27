export const formatINR = (amount: number): string => {
  // Handle NaN, undefined, or null values
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  // Handle NaN, undefined, or null values
  if (isNaN(amount) || amount === null || amount === undefined) {
    return currency === 'INR' ? '₹0' : `${currency} 0`;
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};