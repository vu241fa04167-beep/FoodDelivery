const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Food = require('./models/Food');
const Category = require('./models/Category');
const User = require('./models/User');

dotenv.config({ path: './.env' });

const categories = [
  { name: 'Pizza', description: 'Fresh, cheesy pizzas baked to perfection', isActive: true },
  { name: 'Burger', description: 'Juicy burgers with premium ingredients', isActive: true },
  { name: 'Sushi', description: 'Fresh sushi and rolls from master chefs', isActive: true },
  { name: 'Pasta', description: 'Authentic Italian pasta dishes', isActive: true },
  { name: 'Salad', description: 'Fresh and healthy salad bowls', isActive: true },
  { name: 'Dessert', description: 'Sweet treats and decadent desserts', isActive: true },
  { name: 'Beverages', description: 'Cold drinks, juices, and smoothies', isActive: true },
  { name: 'Indian', description: 'Authentic Indian curries and dishes', isActive: true },
];

const foods = [
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil leaves',
    price: 12.99,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80',
    isPopular: true,
    rating: 4.8,
    prepTime: 20,
    ingredients: ['Mozzarella cheese', 'Tomato sauce', 'Fresh basil', 'Olive oil'],
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Spicy pepperoni with melted cheese on a crispy crust',
    price: 15.99,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1574104853767-fb68c96e8a9d?w=500&q=80',
    isPopular: true,
    rating: 4.9,
    prepTime: 22,
    ingredients: ['Pepperoni', 'Mozzarella cheese', 'Tomato sauce', 'Oregano'],
  },
  {
    name: 'BBQ Chicken Pizza',
    description: 'Grilled chicken with BBQ sauce, red onions, and cilantro',
    price: 17.99,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
    rating: 4.6,
    prepTime: 25,
    ingredients: ['Grilled chicken', 'BBQ sauce', 'Red onions', 'Cilantro', 'Mozzarella'],
  },
  {
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce',
    price: 10.99,
    categoryName: 'Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
    isPopular: true,
    rating: 4.7,
    prepTime: 15,
    ingredients: ['Beef patty', 'Cheddar cheese', 'Lettuce', 'Tomato', 'Bun', 'Special sauce'],
  },
  {
    name: 'Double Bacon Burger',
    description: 'Two beef patties with crispy bacon, cheese, and BBQ sauce',
    price: 15.99,
    categoryName: 'Burger',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80',
    rating: 4.8,
    prepTime: 18,
    ingredients: ['Beef patty x2', 'Bacon', 'Cheese', 'BBQ sauce', 'Bun'],
  },
  {
    name: 'California Roll',
    description: 'Fresh sushi roll with crab, avocado, and cucumber',
    price: 14.99,
    categoryName: 'Sushi',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80',
    rating: 4.6,
    prepTime: 25,
    ingredients: ['Crab stick', 'Avocado', 'Cucumber', 'Rice', 'Seaweed'],
  },
  {
    name: 'Salmon Sashimi',
    description: 'Fresh salmon sashimi with soy sauce and wasabi',
    price: 18.99,
    categoryName: 'Sushi',
    image: 'https://images.unsplash.com/photo-1579584545556-081253632137?w=500&q=80',
    rating: 4.9,
    prepTime: 15,
    ingredients: ['Fresh salmon', 'Soy sauce', 'Wasabi', 'Ginger'],
  },
  {
    name: 'Chicken Alfredo Pasta',
    description: 'Creamy alfredo sauce with grilled chicken and fettuccine',
    price: 16.99,
    categoryName: 'Pasta',
    image: 'https://images.unsplash.com/photo-1612874742237-652622197843?w=500&q=80',
    rating: 4.5,
    prepTime: 20,
    ingredients: ['Fettuccine', 'Grilled chicken', 'Alfredo sauce', 'Parmesan cheese'],
  },
  {
    name: 'Penne Arrabbiata',
    description: 'Spicy tomato sauce with garlic, chili, and penne pasta',
    price: 13.99,
    categoryName: 'Pasta',
    image: 'https://images.unsplash.com/photo-1563298708-6232396e2014?w=500&q=80',
    rating: 4.4,
    prepTime: 18,
    ingredients: ['Penne pasta', 'Tomato sauce', 'Garlic', 'Chili', 'Parsley'],
  },
  {
    name: 'Greek Salad',
    description: 'Fresh vegetables with feta cheese, olives, and olive oil dressing',
    price: 9.99,
    categoryName: 'Salad',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
    rating: 4.3,
    prepTime: 10,
    ingredients: ['Tomatoes', 'Cucumber', 'Red onion', 'Feta cheese', 'Olives', 'Olive oil'],
  },
  {
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan, croutons, and Caesar dressing',
    price: 11.99,
    categoryName: 'Salad',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54dd792?w=500&q=80',
    rating: 4.2,
    prepTime: 12,
    ingredients: ['Romaine lettuce', 'Parmesan', 'Croutons', 'Caesar dressing'],
  },
  {
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center and vanilla ice cream',
    price: 7.99,
    categoryName: 'Dessert',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
    isPopular: true,
    rating: 4.9,
    prepTime: 15,
    ingredients: ['Dark chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour', 'Vanilla ice cream'],
  },
  {
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
    price: 8.99,
    categoryName: 'Dessert',
    image: 'https://images.unsplash.com/photo-1573767677131-d95290889604?w=500&q=80',
    rating: 4.7,
    prepTime: 10,
    ingredients: ['Ladyfingers', 'Mascarpone', 'Espresso', 'Cocoa powder'],
  },
  {
    name: 'Fresh Orange Juice',
    description: '100% fresh squeezed orange juice',
    price: 4.99,
    categoryName: 'Beverages',
    image: 'https://images.unsplash.com/photo-1620542926795-7154b0a392a0?w=500&q=80',
    rating: 4.4,
    prepTime: 5,
    ingredients: ['Fresh oranges'],
  },
  {
    name: 'Iced Caramel Latte',
    description: 'Cold brew coffee with caramel syrup and milk',
    price: 5.99,
    categoryName: 'Beverages',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80',
    rating: 4.6,
    prepTime: 5,
    ingredients: ['Cold brew coffee', 'Caramel syrup', 'Milk', 'Ice'],
  },
  {
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken and basmati rice',
    price: 17.99,
    categoryName: 'Indian',
    image: 'https://images.unsplash.com/photo-1603894564274-3e029f9ac9d0?w=500&q=80',
    isPopular: true,
    rating: 4.8,
    prepTime: 25,
    ingredients: ['Chicken', 'Tomato cream sauce', 'Butter', 'Indian spices', 'Basmati rice'],
  },
  {
    name: 'Chicken Tikka Masala',
    description: 'Grilled chicken in spiced tomato and cream sauce with rice',
    price: 16.99,
    categoryName: 'Indian',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80',
    rating: 4.7,
    prepTime: 28,
    ingredients: ['Chicken', 'Tomato cream sauce', 'Indian spices', 'Basmati rice'],
  },
];

const adminUser = {
  name: 'Admin User',
  email: 'admin@foodexpress.com',
  password: 'admin123',
  role: 'admin',
  phone: '+1 (555) 000-0000',
  address: 'Admin Office, 123 Main St',
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🗑️  Clearing existing data...');
    await Food.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log('📝 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    console.log('🍕 Creating food items...');
    const foodsWithCategories = foods.map((food) => ({
      ...food,
      category: categoryMap[food.categoryName],
    }));
    delete foodsWithCategories.categoryName;
    await Food.insertMany(foodsWithCategories);

    console.log('👤 Creating admin user...');
    await User.create(adminUser);

    console.log('✅ Database seeded successfully!');
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Foods: ${foods.length}`);
    console.log(`   Admin: admin@foodexpress.com / admin123`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();