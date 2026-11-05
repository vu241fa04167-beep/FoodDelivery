import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/restaurants - List only approved restaurants with search, filters & sort
export const getAllRestaurants = async (req, res, next) => {
  try {
    const { search, cuisine, veg, sort } = req.query;
    // QuickBite currently serves one restaurant. Keep the public customer
    // catalog focused on Meghana Foods even if an older database still has
    // demo restaurant records from the original multi-restaurant seed.
    let query = { status: 'approved', name: 'Meghana Foods' };

    // Search by restaurant name, cuisine, OR dish name on its menu
    if (search !== undefined && typeof search !== 'string') {
      return res.status(400).json({ message: 'search must be a string' });
    }
    if (search && search.trim()) {
      const term = escapeRegex(search.trim().slice(0, 80));
      const dishes = await MenuItem.find({ name: { $regex: term, $options: 'i' } }).select('restaurant');
      const restIds = dishes.map((d) => d.restaurant);

      query.$and = [{
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { cuisine: { $regex: term, $options: 'i' } },
          { _id: { $in: restIds } }
        ]
      }];
    }

    // Filter by cuisine
    if (cuisine !== undefined && typeof cuisine !== 'string') {
      return res.status(400).json({ message: 'cuisine must be a string' });
    }
    if (cuisine && cuisine !== 'All') {
      query.cuisine = { $regex: escapeRegex(cuisine.slice(0, 80)), $options: 'i' };
    }

    // Filter by pure veg: only restaurants where ALL menu items are vegetarian
    if (veg === 'true') {
      query.isPureVeg = true;
    }

    // Sorting options: rating | deliveryTime | priceLow (by priceForTwo)
    let sortOptions = { rating: -1 };
    if (sort === 'deliveryTime') sortOptions = { deliveryTime: 1 };
    else if (sort === 'priceLow') sortOptions = { priceForTwo: 1 };

    const restaurants = await Restaurant.find(query).sort(sortOptions).limit(100);
    res.json(restaurants);
  } catch (error) {
    console.error('getAllRestaurants error:', error);
    next(error);
  }
};

// GET /api/restaurants/:id - Get single restaurant details
export const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, status: 'approved' });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error('getRestaurantById error:', error);
    next(error);
  }
};

// GET /api/restaurants/mine - Get the logged-in owner's own restaurant
export const getMyRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'No restaurant found for this owner account' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error('getMyRestaurant error:', error);
    next(error);
  }
};

// POST /api/restaurants - Create a new restaurant (Owner only, starts as 'pending')
export const createRestaurant = async (req, res, next) => {
  try {
    const { name, cuisine, area, address, deliveryTime, deliveryFee, minOrder, description, image } = req.body;

    // Validation
    if ([name, cuisine, area, address].some((value) => typeof value !== 'string' || !value.trim())) {
      return res.status(400).json({ message: 'Name, cuisine, area and address are required' });
    }
    if ((deliveryFee !== undefined && (!Number.isFinite(Number(deliveryFee)) || Number(deliveryFee) < 0)) ||
        (minOrder !== undefined && (!Number.isFinite(Number(minOrder)) || Number(minOrder) < 0))) {
      return res.status(400).json({ message: 'Delivery fee and minimum order must be non-negative numbers' });
    }

    // Check if owner already has a restaurant
    const existing = await Restaurant.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already have registered a restaurant' });
    }

    const restaurant = await Restaurant.create({
      name: name.trim(), cuisine: cuisine.trim(), area: area.trim(), address: address.trim(),
      deliveryTime: deliveryTime || '30-40 mins', deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : 35,
      minOrder: minOrder !== undefined ? Number(minOrder) : 150, description: description || '',
      image: image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      owner: req.user._id, status: 'pending', isApproved: false, isOpen: true
    });

    res.status(201).json({
      message: 'Restaurant created successfully and is pending admin approval',
      restaurant
    });
  } catch (error) {
    console.error('createRestaurant error:', error);
    next(error);
  }
};

// PUT /api/restaurants/:id - Update restaurant (Owner of that restaurant only)
export const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if logged-in user is the owner of this restaurant
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this restaurant' });
    }

    const allowed = ['name', 'cuisine', 'area', 'address', 'deliveryTime', 'description', 'image'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) restaurant[f] = req.body[f]; });
    if (req.body.deliveryFee !== undefined) restaurant.deliveryFee = Number(req.body.deliveryFee);
    if (req.body.minOrder !== undefined) restaurant.minOrder = Number(req.body.minOrder);
    if (req.body.isOpen !== undefined) restaurant.isOpen = Boolean(req.body.isOpen);

    await restaurant.save();
    res.json({ message: 'Restaurant updated successfully', restaurant });
  } catch (error) {
    console.error('updateRestaurant error:', error);
    next(error);
  }
};
