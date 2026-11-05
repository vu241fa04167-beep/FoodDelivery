// Keep currency formatting in one importable function so every production
// bundle resolves the formatter instead of relying on a browser global.
export const formatPrice = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
};

export default formatPrice;

