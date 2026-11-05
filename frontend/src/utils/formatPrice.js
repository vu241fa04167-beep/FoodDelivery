// Format number into Indian Rupee currency format (e.g. ₹250)
export const formatPrice = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
};

export default formatPrice;

