import User from '../models/User.js';

// Helper to validate address fields
const validateAddress = ({ fullName, phone, line1, area, pincode }) => {
  if (!fullName || !fullName.trim()) return 'Full name is required';
  if (!phone || !/^\d{10}$/.test(String(phone).trim())) return 'Phone must be a valid 10-digit number';
  if (!line1 || !line1.trim()) return 'Address line is required';
  if (!area || !area.trim()) return 'Area is required';
  if (!pincode || !/^\d{6}$/.test(String(pincode).trim())) return 'Pincode must be a valid 6-digit number';
  return null;
};

// GET /api/auth/addresses - Get logged in user's saved addresses
export const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json(user?.addresses || []);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/addresses - Add new address (max 5)
export const addAddress = async (req, res, next) => {
  try {
    const { label, fullName, phone, line1, area, pincode, isDefault } = req.body;
    const err = validateAddress({ fullName, phone, line1, area, pincode });
    if (err) return res.status(400).json({ message: err });

    const user = await User.findById(req.user._id);
    if ((user.addresses || []).length >= 5) {
      return res.status(400).json({ message: 'Maximum 5 saved addresses allowed' });
    }

    // First address becomes default automatically
    const makeDefault = Boolean(isDefault) || user.addresses.length === 0;
    if (makeDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }

    const newAddr = {
      label: label && ['Home', 'Work', 'Other'].includes(label) ? label : 'Home',
      fullName: fullName.trim(),
      phone: String(phone).trim(),
      line1: line1.trim(),
      area: area.trim(),
      pincode: String(pincode).trim(),
      isDefault: makeDefault
    };

    user.addresses.push(newAddr);
    await user.save();

    res.status(201).json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/addresses/:addressId - Edit address
export const updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { label, fullName, phone, line1, area, pincode } = req.body;
    const err = validateAddress({ fullName, phone, line1, area, pincode });
    if (err) return res.status(400).json({ message: err });

    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(addressId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    if (label) addr.label = label;
    addr.fullName = fullName.trim();
    addr.phone = String(phone).trim();
    addr.line1 = line1.trim();
    addr.area = area.trim();
    addr.pincode = String(pincode).trim();

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/auth/addresses/:addressId - Delete address
export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(addressId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    const wasDefault = addr.isDefault;
    user.addresses.pull(addressId);

    // If deleted was default, make the first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/auth/addresses/:addressId/default - Set address as default
export const setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(addressId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    user.addresses.forEach((a) => {
      a.isDefault = a._id.toString() === addressId;
    });

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

