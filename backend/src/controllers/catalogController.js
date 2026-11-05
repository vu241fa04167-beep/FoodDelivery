import { Category, Restaurant, Food, Review } from '../models/index.js';

export const categories = async (req, res, next) => {
  try {
    const list = await Category.find({ active: true }).sort('name').lean();
    res.json(list);
  } catch (e) {
    next(e);
  }
};

export const searchSuggestions = async (req, res, next) => {
  try {
    const term = String(req.query.q || '').trim();
    if (!term || term.length < 2) return res.json({ restaurants: [], foods: [], cuisines: [] });

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const [matchedRestaurants, matchedFoods] = await Promise.all([
      Restaurant.find({
        approved: true,
        $or: [{ name: regex }, { cuisines: regex }]
      }).limit(5).select('name cuisines image rating').lean(),
      Food.find({
        name: regex,
        isAvailable: true
      }).populate('restaurant', 'name').limit(5).select('name price image restaurant').lean()
    ]);

    const matchingCuisines = new Set();
    matchedRestaurants.forEach(r => {
      r.cuisines?.forEach(c => {
        if (regex.test(c)) matchingCuisines.add(c);
      });
    });

    res.json({
      restaurants: matchedRestaurants,
      foods: matchedFoods,
      cuisines: Array.from(matchingCuisines).slice(0, 5)
    });
  } catch (e) {
    next(e);
  }
};

export const listRestaurants = async (req, res, next) => {
  try {
    const term = String(req.query.q || '').trim();
    const cuisine = String(req.query.cuisine || '').trim();
    const categoryId = String(req.query.category || '').trim();
    const dietary = String(req.query.dietary || '').trim();
    const sortBy = String(req.query.sort || 'rating');

    const filter = { approved: true };

    if (cuisine) {
      filter.cuisines = new RegExp(`^${cuisine}$`, 'i');
    }

    if (dietary && dietary !== 'All') {
      const foodsWithDietary = await Food.find({
        dietary: new RegExp(`^${dietary}$`, 'i'),
        isAvailable: true
      }).select('restaurant');
      const restaurantIds = foodsWithDietary.map(f => f.restaurant);
      filter._id = { $in: restaurantIds };
    }

    if (term) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ name: regex }, { cuisines: regex }, { description: regex }];
    }

    if (categoryId) {
      const foodsInCat = await Food.find({ category: categoryId, isAvailable: true }).select('restaurant');
      const restaurantIds = foodsInCat.map(f => f.restaurant);
      filter._id = { $in: restaurantIds };
    }

    let query = Restaurant.find(filter);

    if (sortBy === 'rating') {
      query = query.sort('-rating');
    } else if (sortBy === 'deliveryFee') {
      query = query.sort('deliveryFee');
    } else if (sortBy === 'name') {
      query = query.sort('name');
    } else {
      query = query.sort('-createdAt');
    }

    const restaurants = await query.lean().exec();

    if (term && restaurants.length < 5) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const dishMatches = await Food.find({
        name: new RegExp(escaped, 'i'),
        isAvailable: true
      }).select('restaurant').lean();

      const extraIds = dishMatches.map(d => d.restaurant.toString());
      const existingIds = new Set(restaurants.map(r => r._id.toString()));
      const missingIds = extraIds.filter(id => !existingIds.has(id));

      if (missingIds.length > 0) {
        const extraRestaurants = await Restaurant.find({
          _id: { $in: missingIds },
          approved: true
        }).lean();
        restaurants.push(...extraRestaurants);
      }
    }

    res.json(restaurants);
  } catch (e) {
    next(e);
  }
};

export const restaurant = async (req, res, next) => {
  try {
    const r = await Restaurant.findOne({ _id: req.params.id, approved: true }).lean();
    if (!r) return res.status(404).json({ message: 'Restaurant not found or not currently active' });

    const [foods, reviews] = await Promise.all([
      Food.find({ restaurant: r._id, isAvailable: true }).populate('category', 'name image').lean(),
      Review.find({ restaurant: r._id }).populate('customer', 'name').sort('-createdAt').limit(10).lean()
    ]);

    res.json({
      restaurant: r,
      foods,
      reviews
    });
  } catch (e) {
    next(e);
  }
};

export const restaurantReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.id })
      .populate('customer', 'name')
      .sort('-createdAt')
      .lean();
    res.json(reviews);
  } catch (e) {
    next(e);
  }
};
