export const validateCheckoutInput = ({ address, paymentMethod }) => {
  if (!address || typeof address !== 'object') {
    return 'Delivery address object is required';
  }
  if (!address.line1 || !address.line1.trim() || !address.city || !address.city.trim()) {
    return 'Street address and city are required for delivery';
  }
  if (!['cod', 'online'].includes(paymentMethod)) {
    return 'Valid payment method (cod or online) is required';
  }
  return null;
};

