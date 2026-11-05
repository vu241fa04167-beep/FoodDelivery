import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import MenuItem from './models/MenuItem.js';
import Order from './models/Order.js';
import Coupon from './models/Coupon.js';
import DeliveryPartner from './models/DeliveryPartner.js';
import { sampleRestaurants, sampleCoupons } from './seedData.js';
import { meghanaMenu } from './menuData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Clearing existing collections...');

    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    await Coupon.deleteMany({});
    await DeliveryPartner.deleteMany({});

    console.log('Seeding demo users and delivery partners...');
    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('password123', salt);

    const customer = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      password: commonPassword,
      role: 'customer',
      phone: '9876543210',
      address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
      addresses: [
        { label: 'Home', fullName: 'Rahul Sharma', phone: '9876543210', line1: 'Flat 402, Green Glen Layout', area: 'Bellandur', pincode: '560103', isDefault: true },
        { label: 'Work', fullName: 'Rahul Sharma', phone: '9876543210', line1: 'Tower B, 4th Floor, EcoSpace', area: 'Bellandur', pincode: '560103', isDefault: false }
      ]
    });

    const owner = await User.create({
      name: 'Priya Nair',
      email: 'priya@restaurant.com',
      password: commonPassword,
      role: 'owner',
      phone: '9845012345',
      address: '1st Block, Koramangala, Bengaluru'
    });

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@quickbite.test',
      password: commonPassword,
      role: 'admin',
      phone: '9900112233',
      address: 'Platform HQ, Embassy Tech Village, Bengaluru'
    });

    await DeliveryPartner.insertMany([
      { name: 'Suresh Kumar', phone: '9845112233', vehicleNumber: 'KA 01 AB 1234' },
      { name: 'Ramesh Gowda', phone: '9845223344', vehicleNumber: 'KA 03 CD 5678' },
      { name: 'Manjunath Swamy', phone: '9845334455', vehicleNumber: 'KA 05 EF 9012' },
      { name: 'Venkatesh Rao', phone: '9845445566', vehicleNumber: 'KA 04 GH 3456' },
      { name: 'Syed Imran', phone: '9845556677', vehicleNumber: 'KA 02 JK 7890' },
      { name: 'Kiran Reddy', phone: '9845667788', vehicleNumber: 'KA 51 LM 2345' }
    ]);

    console.log('Seeding restaurants and menu items...');
    // Customer-facing QuickBite is a single-restaurant ordering platform.
    // Keep the legacy sample data available for reference, but only seed the
    // Meghana Foods catalog into a fresh database.
    const restaurantsToSeed = sampleRestaurants.filter((restaurant) => restaurant.name === 'Meghana Foods');
    for (let i = 0; i < restaurantsToSeed.length; i++) {
      const restData = restaurantsToSeed[i];
      const dishes = restData.name === 'Meghana Foods' ? meghanaMenu : restData.dishes;
      const restaurantOwner = i === 0 ? owner._id : admin._id;

      const createdRest = await Restaurant.create({
        name: restData.name,
        description: restData.description,
        cuisine: restData.cuisine,
        area: restData.area,
        address: restData.address,
        rating: restData.rating,
        numRatings: restData.numRatings,
        deliveryTime: restData.deliveryTime,
        deliveryFee: restData.deliveryFee,
        minOrder: restData.minOrder,
        priceForTwo: restData.priceForTwo || 300,
        isPureVeg: Boolean(restData.isPureVeg),
        image: restData.image,
        owner: restaurantOwner,
        status: 'approved',
        isApproved: true,
        isOpen: true
      });

      const menuItemsToInsert = dishes.map((dish) => ({
        restaurant: createdRest._id,
        name: dish.name,
        price: dish.price,
        description: dish.description,
        isVeg: dish.isVeg,
        category: dish.category,
        image: dish.image,
        isAvailable: true
      }));

      await MenuItem.insertMany(menuItemsToInsert);
    }

    console.log('Seeding discount coupons...');
    await Coupon.insertMany(sampleCoupons);

    console.log('Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
