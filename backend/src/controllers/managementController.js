import { User, Restaurant, Food, Category, Order, Coupon } from '../models/index.js';

const safeUser = u => ({
  id: u._id,
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  phone: u.phone,
  addresses: u.addresses || [],
  favorites: u.favorites || []
});

export const profile = async (req, res, next) => {
  try {
    const { name, phone, addresses } = req.body;
    const u = await User.findById(req.user._id);
    if (!u) return res.status(404).json({ message: 'User not found' });

    if (name) u.name = String(name).trim();
    if (phone !== undefined) u.phone = String(phone).trim();
    if (addresses !== undefined) u.addresses = addresses;

    await u.save();
    res.json({ user: safeUser(u) });
  } catch (e) {
    next(e);
  }
};

export const getRestaurantProfile = async (req, res, next) => {
  try {
    let r = await Restaurant.findOne({ owner: req.user._id });
    if (!r) {
      r = await Restaurant.create({
        owner: req.user._id,
        name: `${req.user.name}'s Kitchen`,
        description: 'Quality food cooked with passion.',
        cuisines: ['Contemporary'],
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85',
        coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85',
        address: '100 Culinary Way',
        city: 'New York',
        approved: false
      });
    }
    res.json(r);
  } catch (e) {
    next(e);
  }
};

export const restaurantProfile = async (req, res, next) => {
  try {
    let r = await Restaurant.findOne({ owner: req.user._id });
    const fields = [
      'name', 'description', 'cuisines', 'image', 'coverImage',
      'address', 'city', 'phone', 'deliveryTime', 'deliveryFee',
      'minOrder', 'priceRange', 'isOpen'
    ];
    const input = Object.fromEntries(
      fields.filter(k => req.body[k] !== undefined).map(k => [k, req.body[k]])
    );

    if (!r) {
      if (!input.name) return res.status(400).json({ message: 'Restaurant name is required' });
      r = new Restaurant({ owner: req.user._id, ...input });
    } else {
      Object.assign(r, input);
    }

    await r.save();
    res.json(r);
  } catch (e) {
    next(e);
  }
};

export const restaurantStats = async (req, res, next) => {
  try {
    const r = await Restaurant.findOne({ owner: req.user._id });
    if (!r) return res.status(404).json({ message: 'Restaurant profile not found' });

    const orders = await Order.find({ restaurant: r._id });
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const revenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = orders.filter(o => ['placed', 'accepted', 'preparing', 'out_for_delivery'].includes(o.status)).length;
    const foodCount = await Food.countDocuments({ restaurant: r._id });

    res.json({
      restaurant: r,
      totalOrders,
      deliveredOrdersCount: deliveredOrders.length,
      revenue: Number(revenue.toFixed(2)),
      pendingOrders,
      foodCount
    });
  } catch (e) {
    next(e);
  }
};

export const restaurantFoods = async (req, res, next) => {
  try {
    const r = await Restaurant.findOne({ owner: req.user._id });
    if (!r) return res.status(404).json({ message: 'Restaurant profile not found' });

    if (req.method === 'GET') {
      const foods = await Food.find({ restaurant: r._id }).populate('category', 'name image').sort('-createdAt');
      return res.json(foods);
    }

    const fields = ['name', 'description', 'price', 'image', 'category', 'dietary', 'isAvailable', 'isFeatured'];
    const input = Object.fromEntries(
      fields.filter(k => req.body[k] !== undefined).map(k => [k, req.body[k]])
    );

    if (req.method === 'POST') {
      if (!input.name || input.price === undefined) {
        return res.status(400).json({ message: 'Item name and price are required' });
      }
      const food = await Food.create({
        restaurant: r._id,
        ...input,
        price: Number(input.price)
      });
      return res.status(201).json(food);
    }

    if (input.price !== undefined) input.price = Number(input.price);
    const food = await Food.findOneAndUpdate(
      { _id: req.params.id, restaurant: r._id },
      input,
      { new: true, runValidators: true }
    );
    if (!food) return res.status(404).json({ message: 'Menu item not found' });

    res.json(food);
  } catch (e) {
    next(e);
  }
};

export const deleteFood = async (req, res, next) => {
  try {
    const r = await Restaurant.findOne({ owner: req.user._id });
    const food = await Food.findOneAndDelete({ _id: req.params.id, restaurant: r?._id });
    if (!food) return res.status(404).json({ message: 'Menu item not found' });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

export const dashboard = async (req, res, next) => {
  try {
    const [customers, restaurants, pendingRestaurants, orders, revenueResult] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ approved: false }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    const revenue = revenueResult[0]?.total || 0;

    res.json({
      customers,
      restaurants,
      pendingRestaurants,
      orders,
      revenue: Number(revenue.toFixed(2))
    });
  } catch (e) {
    next(e);
  }
};

export const adminList = async (req, res, next) => {
  try {
    const type = req.params.type;
    if (type === 'users') {
      const users = await User.find().select('-password').sort('-createdAt');
      return res.json(users);
    }
    if (type === 'restaurants') {
      const rests = await Restaurant.find().populate('owner', 'name email').sort('-createdAt');
      return res.json(rests);
    }
    if (type === 'orders') {
      const orders = await Order.find()
        .populate('customer', 'name email phone')
        .populate('restaurant', 'name address')
        .sort('-createdAt');
      return res.json(orders);
    }
    if (type === 'categories') {
      const cats = await Category.find().sort('name');
      return res.json(cats);
    }
    if (type === 'coupons') {
      const coupons = await Coupon.find().sort('-createdAt');
      return res.json(coupons);
    }
    res.status(404).json({ message: 'Resource not found' });
  } catch (e) {
    next(e);
  }
};

export const approve = async (req, res, next) => {
  try {
    const { approved } = req.body;
    const r = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { approved: Boolean(approved) },
      { new: true }
    );
    if (!r) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(r);
  } catch (e) {
    next(e);
  }
};

export const adminUpdateOrder = async (req, res, next) => {
  try {
    const allowed = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'rejected'];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = req.body.status;
    if (req.body.status === 'delivered') order.paymentStatus = 'paid';
    order.statusHistory.push({
      status: req.body.status,
      timestamp: new Date(),
      note: req.body.note || 'Status updated by Admin'
    });

    await order.save();
    res.json(order);
  } catch (e) {
    next(e);
  }
};

export const manageCategories = async (req, res, next) => {
  try {
    if (req.method === 'POST') {
      const cat = await Category.create(req.body);
      return res.status(201).json(cat);
    }
    if (req.method === 'PATCH') {
      const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json(cat);
    }
    if (req.method === 'DELETE') {
      await Category.findByIdAndDelete(req.params.id);
      return res.status(204).end();
    }
  } catch (e) {
    next(e);
  }
};

export const manageCoupons = async (req, res, next) => {
  try {
    if (req.method === 'GET') {
      const coupons = await Coupon.find().sort('-createdAt');
      return res.json(coupons);
    }
    if (req.method === 'POST') {
      const { code, discountType, discountValue, minOrder, maxDiscount, description } = req.body;
      if (!code || discountValue === undefined) {
        return res.status(400).json({ message: 'Coupon code and discount value are required' });
      }
      const coupon = await Coupon.create({
        code: String(code).trim().toUpperCase(),
        discountType: discountType || 'fixed',
        discountValue: Number(discountValue),
        minOrder: Number(minOrder || 0),
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        description: description || '',
        active: true
      });
      return res.status(201).json(coupon);
    }
    if (req.method === 'PATCH') {
      const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json(coupon);
    }
    if (req.method === 'DELETE') {
      await Coupon.findByIdAndDelete(req.params.id);
      return res.status(204).end();
    }
  } catch (e) {
    next(e);
  }
};
