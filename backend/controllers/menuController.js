import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';

// GET /api/restaurants/:id/menu - Get all menu items for a restaurant
export const getMenuByRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, status: 'approved' });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const items = await MenuItem.find({ restaurant: restaurant._id }).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// POST /api/menu - Add a menu item (Owner only)
export const addMenuItem = async (req, res, next) => {
  try {
    // Find the restaurant owned by this user
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'You have not registered a restaurant yet' });
    }

    const { name, price, category, description, image, isVeg } = req.body;

    // Simple if-check validation
    if (typeof name !== 'string' || !name.trim() || typeof category !== 'string' || !category.trim() || price === undefined) {
      return res.status(400).json({ message: 'Name, price and category are required' });
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    const item = await MenuItem.create({
      restaurant: restaurant._id,
      name: name.trim(),
      price: Number(price),
      category: category.trim(),
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
      isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
      isAvailable: true
    });

    res.status(201).json({ message: 'Menu item added successfully', item });
  } catch (error) {
    next(error);
  }
};

// PUT /api/menu/:id - Edit item (Owner of that restaurant only)
export const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Verify ownership of the restaurant
    const restaurant = await Restaurant.findById(item.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this restaurant' });
    }

    const { name, price, category, description, image, isVeg } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ message: 'Name must be a non-empty string' });
      item.name = name.trim();
    }
    if (price !== undefined) {
      if (!Number.isFinite(Number(price)) || Number(price) <= 0) return res.status(400).json({ message: 'Price must be greater than 0' });
      item.price = Number(price);
    }
    if (category !== undefined) {
      if (typeof category !== 'string' || !category.trim()) return res.status(400).json({ message: 'Category must be a non-empty string' });
      item.category = category.trim();
    }
    if (description !== undefined) item.description = description;
    if (image) item.image = image;
    if (isVeg !== undefined) item.isVeg = Boolean(isVeg);

    await item.save();
    res.json({ message: 'Menu item updated successfully', item });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/menu/:id - Delete item (Owner of that restaurant only)
export const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Verify ownership
    const restaurant = await Restaurant.findById(item.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this restaurant' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/menu/:id/availability - Toggle availability (Owner only)
export const toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Verify ownership
    const restaurant = await Restaurant.findById(item.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this restaurant' });
    }

    // Toggle boolean
    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({
      message: `Item marked as ${item.isAvailable ? 'In Stock' : 'Out of Stock'}`,
      item
    });
  } catch (error) {
    next(error);
  }
};

