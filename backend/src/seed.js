import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import {
  User,
  Category,
  Restaurant,
  Food,
  Cart,
  Order,
  GroupOrder,
  RescueListing,
  Coupon,
  Review
} from './models/index.js';

await connectDB();

console.log('Clearing existing collections...');
await Promise.all([
  User.deleteMany(),
  Category.deleteMany(),
  Restaurant.deleteMany(),
  Food.deleteMany(),
  Cart.deleteMany(),
  Order.deleteMany(),
  GroupOrder.deleteMany(),
  RescueListing.deleteMany(),
  Coupon.deleteMany(),
  Review.deleteMany()
]);

const hash = await bcrypt.hash('Password123!', 12);

console.log('Seeding users...');
const [admin, owner, owner2, customer, customer2] = await User.create([
  {
    name: 'Savor Admin',
    email: 'admin@savor.local',
    password: hash,
    role: 'admin',
    phone: '+1 (555) 019-2834'
  },
  {
    name: 'Marco Bellini',
    email: 'owner@savor.local',
    password: hash,
    role: 'restaurant',
    phone: '+1 (555) 014-9821'
  },
  {
    name: 'Chloe Laurent',
    email: 'owner2@savor.local',
    password: hash,
    role: 'restaurant',
    phone: '+1 (555) 017-4329'
  },
  {
    name: 'Alex Lane',
    email: 'alex@savor.local',
    password: hash,
    role: 'customer',
    phone: '+1 (555) 010-1849',
    addresses: [
      {
        label: 'Home',
        line1: '220 W 14th Street, Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10011',
        phone: '+1 (555) 010-1849',
        isDefault: true
      },
      {
        label: 'Work',
        line1: '75 9th Avenue, Floor 4',
        city: 'New York',
        state: 'NY',
        postalCode: '10011',
        phone: '+1 (555) 010-1849',
        isDefault: false
      }
    ]
  },
  {
    name: 'Sophia Chen',
    email: 'sophia@savor.local',
    password: hash,
    role: 'customer',
    phone: '+1 (555) 018-9921',
    addresses: [
      {
        label: 'Home',
        line1: '450 Lexington Avenue',
        city: 'New York',
        state: 'NY',
        postalCode: '10017',
        phone: '+1 (555) 018-9921',
        isDefault: true
      }
    ]
  }
]);

console.log('Seeding categories...');
const categories = await Category.create([
  { name: 'Pizza', image: '🍕' },
  { name: 'Healthy & Bowls', image: '🥗' },
  { name: 'Burgers', image: '🍔' },
  { name: 'Sushi & Japanese', image: '🍣' },
  { name: 'Asian Classics', image: '🥡' },
  { name: 'Bakery & Sweets', image: '🍰' },
  { name: 'Coffee & Drinks', image: '☕' },
  { name: 'Indian Spices', image: '🍛' }
]);

console.log('Seeding restaurants...');
const [pizza, green, bun, nori, bakery, spice] = await Restaurant.create([
  {
    owner: owner._id,
    name: 'Mamma Mia Pizzeria',
    description: 'Neapolitan sourdough pizzas with 48-hour fermentation and San Marzano tomatoes.',
    cuisines: ['Italian', 'Pizza', 'Vegetarian Friendly'],
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85',
    coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=85',
    address: '99 Carmine Street, West Village',
    city: 'New York',
    phone: '+1 (212) 555-0192',
    rating: 4.9,
    numReviews: 248,
    deliveryTime: '25-35 min',
    deliveryFee: 2.5,
    minOrder: 15,
    priceRange: '$$',
    isOpen: true,
    approved: true
  },
  {
    owner: owner2._id,
    name: 'Green Spoon Kitchen',
    description: 'Vibrant grain bowls, farm-fresh local salads, and cold-pressed elixirs.',
    cuisines: ['Healthy', 'Organic', 'Bowls', 'Vegan'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85',
    coverImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=85',
    address: '310 Bowery, NoHo',
    city: 'New York',
    phone: '+1 (212) 555-0143',
    rating: 4.8,
    numReviews: 192,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    minOrder: 12,
    priceRange: '$$',
    isOpen: true,
    approved: true
  },
  {
    name: 'Bun & Barrel Craft Burgers',
    description: 'Dry-aged smash burgers, truffle fries, and thick malt milkshakes.',
    cuisines: ['Burgers', 'American', 'Comfort Food'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85',
    coverImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1600&q=85',
    address: '11 Prince Street, SoHo',
    city: 'New York',
    phone: '+1 (212) 555-0176',
    rating: 4.7,
    numReviews: 310,
    deliveryTime: '25-40 min',
    deliveryFee: 2.99,
    minOrder: 15,
    priceRange: '$$',
    isOpen: true,
    approved: true
  },
  {
    name: 'Nori House Omakase',
    description: 'Hand-pressed nigiri, pristine sashimi, and warm miso broths prepared with Tokyo precision.',
    cuisines: ['Japanese', 'Sushi', 'Asian'],
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=85',
    coverImage: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1600&q=85',
    address: '44 2nd Avenue, East Village',
    city: 'New York',
    phone: '+1 (212) 555-0188',
    rating: 4.9,
    numReviews: 412,
    deliveryTime: '30-45 min',
    deliveryFee: 3.5,
    minOrder: 25,
    priceRange: '$$$',
    isOpen: true,
    approved: true
  },
  {
    name: 'Maison Laurent Pâtisserie',
    description: 'Artisanal French viennoiserie, pistachio tarts, and velvety specialty espresso.',
    cuisines: ['Bakery', 'Desserts', 'French', 'Coffee'],
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85',
    coverImage: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1600&q=85',
    address: '182 Columbus Avenue, Upper West Side',
    city: 'New York',
    phone: '+1 (212) 555-0155',
    rating: 4.9,
    numReviews: 180,
    deliveryTime: '20-30 min',
    deliveryFee: 2.0,
    minOrder: 10,
    priceRange: '$$',
    isOpen: true,
    approved: true
  },
  {
    name: 'Spice Route Kitchen',
    description: 'Slow-simmered aromatic curries, clay-oven tandoor naans, and saffron biryanis.',
    cuisines: ['Indian', 'Curry', 'Spices', 'Halal'],
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=85',
    coverImage: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?auto=format&fit=crop&w=1600&q=85',
    address: '88 1st Avenue, East Village',
    city: 'New York',
    phone: '+1 (212) 555-0164',
    rating: 4.8,
    numReviews: 154,
    deliveryTime: '30-40 min',
    deliveryFee: 2.5,
    minOrder: 18,
    priceRange: '$$',
    isOpen: true,
    approved: true
  }
]);

console.log('Seeding foods...');
const foods = await Food.create([
  // Mamma Mia Pizzeria
  {
    restaurant: pizza._id,
    category: categories[0]._id, // Pizza
    name: 'Truffle & Wild Mushroom Pizza',
    description: 'Fior di latte mozzarella, roasted wild chanterelles, white truffle oil, fresh thyme',
    price: 19.5,
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=700&q=80',
    dietary: ['Vegetarian'],
    isFeatured: true,
    isAvailable: true
  },
  {
    restaurant: pizza._id,
    category: categories[0]._id, // Pizza
    name: 'Classic Margherita DOP',
    description: 'San Marzano tomatoes, fresh buffalo mozzarella, hand-torn basil, extra virgin olive oil',
    price: 15.0,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80',
    dietary: ['Vegetarian'],
    isFeatured: true,
    isAvailable: true
  },
  {
    restaurant: pizza._id,
    category: categories[0]._id, // Pizza
    name: 'Spicy Diavola',
    description: 'Calabrian chili salami, mozzarella, spicy honey drizzle, charred red onions',
    price: 18.0,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=700&q=80',
    dietary: ['Spicy'],
    isFeatured: false,
    isAvailable: true
  },
  {
    restaurant: pizza._id,
    category: categories[1]._id, // Healthy & Bowls
    name: 'Burrata & Heirloom Fig Salad',
    description: 'Pugliese burrata, mission figs, baby arugula, crushed pistachios, aged balsamic',
    price: 14.5,
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=700&q=80',
    dietary: ['Vegetarian', 'Gluten-Free'],
    isFeatured: false,
    isAvailable: true
  },

  // Green Spoon Kitchen
  {
    restaurant: green._id,
    category: categories[1]._id, // Healthy & Bowls
    name: 'Harvest Quinoa Nourish Bowl',
    description: 'Organic tricolor quinoa, roasted butternut squash, avocado, pickled beetroot, lemon tahini dressing',
    price: 16.5,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80',
    dietary: ['Vegan', 'Gluten-Free'],
    isFeatured: true,
    isAvailable: true
  },
  {
    restaurant: green._id,
    category: categories[1]._id, // Healthy & Bowls
    name: 'Miso Glazed Salmon Bowl',
    description: 'Wild Atlantic salmon, steamed edamame, purple cabbage, brown rice, sesame dressing',
    price: 18.5,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80',
    dietary: ['Gluten-Free'],
    isFeatured: true,
    isAvailable: true
  },
  {
    restaurant: green._id,
    category: categories[6]._id, // Coffee & Drinks
    name: 'Immunity Cold-Pressed Elixir',
    description: 'Turmeric root, Valencia orange, ginger, cayenne, wild wildflower honey (350ml)',
    price: 6.5,
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=700&q=80',
    dietary: ['Vegan', 'Gluten-Free'],
    isFeatured: false,
    isAvailable: true
  },

  // Bun & Barrel
  {
    restaurant: bun._id,
    category: categories[2]._id, // Burgers
    name: 'The Truffle Double Smash',
    description: 'Twin 4oz dry-aged beef patties, cave-aged cheddar, caramelized onions, black truffle aioli on brioche',
    price: 17.5,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
    dietary: [],
    isFeatured: true,
    isAvailable: true
  },
  {
    restaurant: bun._id,
    category: categories[2]._id, // Burgers
    name: 'Smoked Jalapeño Crispy Chicken',
    description: 'Buttermilk fried chicken thigh, smoked jalapeño slaw, house bread & butter pickles, brioche bun',
    price: 15.5,
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=700&q=80',
    dietary: ['Spicy'],
    isFeatured: false,
    isAvailable: true
  },
  {
    restaurant: bun._id,
    category: categories[2]._id, // Burgers
    name: 'Hand-Cut Parmesan & Truffle Fries',
    description: 'Crisp russet fries tossed in aged Parmigiano Reggiano, chopped herbs, and truffle mayo dip',
    price: 8.0,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=700&q=80',
    dietary: ['Vegetarian'],
    isFeatured: false,
    isAvailable: true
  },

  // Nori House
  {
    restaurant: nori._id,
    category: categories[3]._id, // Sushi & Japanese
    name: 'Tokyo Premium Nigiri Set (9 pcs)',
    description: 'Chef selection of bluefin otoro, king salmon, yellowtail hamachi, hotate scallop, and tamago',
    price: 28.0,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=700&q=80',
    dietary: ['Gluten-Free'],
    isFeatured: true,
    isAvailable: true
  },
  {
    restaurant: nori._id,
    category: categories[3]._id, // Sushi & Japanese
    name: 'Spicy Bluefin Tuna Crunch Roll',
    description: 'Fresh bluefin tuna, cucumber, spicy aioli, topped with tempura crisps and scallions',
    price: 16.0,
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=700&q=80',
    dietary: ['Spicy'],
    isFeatured: false,
    isAvailable: true
  },

  // Maison Laurent
  {
    restaurant: bakery._id,
    category: categories[5]._id, // Bakery & Sweets
    name: 'Pistachio & Raspberry Brioche Feuilletee',
    description: 'Laminated flaky brioche, pure Sicilian pistachio cream, fresh organic raspberries',
    price: 7.5,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
    dietary: ['Vegetarian'],
    isFeatured: true,
    isAvailable: true
  },
  {
    restaurant: bakery._id,
    category: categories[6]._id, // Coffee & Drinks
    name: 'Bourbon Vanilla Bean Flat White',
    description: 'Double ristretto espresso, steamed oat milk, Madagascar bourbon vanilla reduction',
    price: 5.5,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80',
    dietary: ['Vegetarian'],
    isFeatured: false,
    isAvailable: true
  },

  // Spice Route
  {
    restaurant: spice._id,
    category: categories[7]._id, // Indian Spices
    name: 'Old Delhi Butter Chicken',
    description: 'Charcoal-grilled chicken tikka in a velvet tomato, fenugreek, and cultured butter gravy with garlic naan',
    price: 19.0,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=700&q=80',
    dietary: ['Halal'],
    isFeatured: true,
    isAvailable: true
  },
  {
    restaurant: spice._id,
    category: categories[7]._id, // Indian Spices
    name: 'Smoked Paneer Tikka Masala',
    description: 'Clay-oven charred artisanal paneer, roasted peppers, spiced onion-tomato masala',
    price: 17.0,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=700&q=80',
    dietary: ['Vegetarian'],
    isFeatured: false,
    isAvailable: true
  }
]);

console.log('Seeding Food Rescue listings...');
await RescueListing.create([
  {
    restaurant: pizza._id,
    food: foods[1]._id, // Classic Margherita
    name: 'Classic Margherita DOP (Surplus Batch)',
    description: 'Freshly baked before oven shutdown. High-grade ingredients in prime shape.',
    originalPrice: 15.0,
    discountedPrice: 8.5,
    quantity: 5,
    initialQuantity: 6,
    isAvailable: true
  },
  {
    restaurant: green._id,
    food: foods[4]._id, // Harvest Quinoa Bowl
    name: 'Harvest Quinoa Bowl (End of Lunch Shift)',
    description: 'Surplus organic grain portions prepped fresh at noon. Keep chilled or reheat.',
    originalPrice: 16.5,
    discountedPrice: 9.0,
    quantity: 4,
    initialQuantity: 5,
    isAvailable: true
  },
  {
    restaurant: bun._id,
    food: foods[7]._id, // Smoked Jalapeno Chicken
    name: 'Smoked Jalapeño Crispy Chicken',
    description: 'Extra crispy chicken breast portions prepped for dinner peak.',
    originalPrice: 15.5,
    discountedPrice: 9.5,
    quantity: 3,
    initialQuantity: 4,
    isAvailable: true
  },
  {
    restaurant: bakery._id,
    food: foods[11]._id, // Pistachio Brioche
    name: 'Daily Fresh Artisan Pastry Duo',
    description: 'Today’s morning bake surplus. Perfect dessert or breakfast treat.',
    originalPrice: 15.0,
    discountedPrice: 7.0,
    quantity: 6,
    initialQuantity: 8,
    isAvailable: true
  }
]);

console.log('Seeding promo coupons...');
await Coupon.create([
  {
    code: 'SAVOR10',
    discountType: 'fixed',
    discountValue: 10,
    minOrder: 30,
    description: '$10 off orders over $30',
    active: true
  },
  {
    code: 'WELCOME20',
    discountType: 'percent',
    discountValue: 20,
    minOrder: 20,
    maxDiscount: 15,
    description: '20% off your order (up to $15 off)',
    active: true
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 2.5,
    minOrder: 15,
    description: 'Free delivery on your meal ($2.50 off)',
    active: true
  }
]);

console.log('Seeding initial reviews...');
await Review.create([
  {
    restaurant: pizza._id,
    customer: customer._id,
    rating: 5,
    comment: 'The Truffle & Wild Mushroom pizza is exceptional. The sourdough crust is airy and delightfully chewy.'
  },
  {
    restaurant: pizza._id,
    customer: customer2._id,
    rating: 5,
    comment: 'Delivered fast, still piping hot. Mamma Mia never disappoints!'
  },
  {
    restaurant: green._id,
    customer: customer._id,
    rating: 5,
    comment: 'Super fresh ingredients, great portion sizes, and the immunity elixir is genuinely rejuvenating.'
  }
]);

console.log('Seeding initial sample order for Alex...');
await Order.create({
  customer: customer._id,
  restaurant: pizza._id,
  items: [
    {
      food: foods[0]._id,
      name: foods[0].name,
      price: foods[0].price,
      quantity: 1,
      notes: 'Extra crispy crust please'
    },
    {
      food: foods[1]._id,
      name: foods[1].name,
      price: foods[1].price,
      quantity: 1
    }
  ],
  deliveryAddress: customer.addresses[0],
  deliveryInstructions: 'Ring bell 4B or leave in lobby',
  paymentMethod: 'online',
  paymentStatus: 'paid',
  status: 'delivered',
  subtotal: 34.5,
  deliveryFee: 2.5,
  discount: 10.0,
  couponCode: 'SAVOR10',
  total: 27.0,
  statusHistory: [
    { status: 'placed', timestamp: new Date(Date.now() - 3600000), note: 'Order placed' },
    { status: 'accepted', timestamp: new Date(Date.now() - 3000000), note: 'Kitchen accepted' },
    { status: 'preparing', timestamp: new Date(Date.now() - 2400000), note: 'Chef baking pizza' },
    { status: 'out_for_delivery', timestamp: new Date(Date.now() - 1200000), note: 'Courier en route' },
    { status: 'delivered', timestamp: new Date(Date.now() - 300000), note: 'Delivered at door' }
  ]
});

// Update customer favorites
customer.favorites.push(pizza._id, green._id);
await customer.save();

console.log('----------------------------------------------------');
console.log('Savor database seeded successfully!');
console.log('Customer:   alex@savor.local   / Password123!');
console.log('Owner:      owner@savor.local  / Password123!');
console.log('Admin:      admin@savor.local  / Password123!');
console.log('----------------------------------------------------');

process.exit(0);
