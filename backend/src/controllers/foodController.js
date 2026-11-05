const Food = require('../models/Food');
const Category = require('../models/Category');

exports.getFoods = async (req, res) => {
  try {
    const { category, search, popular, page = 1, limit = 20 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (popular === 'true') query.isPopular = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const foods = await Food.find(query)
      .populate('category', 'name description')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Food.countDocuments(query);
    res.json({
      success: true,
      count: foods.length,
      total,
      pages: Math.ceil(total / limit),
      page: parseInt(page),
      data: foods,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate('category', 'name description');
    if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
    res.json({ success: true, message: 'Food deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};