// Mock seed data for Bengaluru college project
export const sampleRestaurants = [
  {
    name: 'Meghana Foods',
    description: 'Authentic Andhra style spicy biryani and starters',
    cuisine: 'Biryani, Andhra, South Indian',
    area: 'Koramangala',
    address: '1st Block, Near Sony World Signal, Koramangala, Bengaluru',
    rating: 4.4,
    numRatings: 1850,
    deliveryTime: '25-35 mins',
    deliveryFee: 35,
    minOrder: 150,
    priceForTwo: 600,
    isPureVeg: false,
    isApproved: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    dishes: [
      { name: 'Meghana Special Chicken Biryani', price: 320, isVeg: false, category: 'Biryani', description: 'Fragrant basmati rice cooked with boneless chicken pieces and spicy Andhra masala.', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80' },
      { name: 'Paneer Biryani', price: 270, isVeg: true, category: 'Biryani', description: 'Fresh cottage cheese cubes simmered in spiced biryani gravy and layered rice.', image: 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=600&q=80' },
      { name: 'Chicken 65', price: 260, isVeg: false, category: 'Starters', description: 'Crispy fried chicken tossed in curd, curry leaves and green chillies.', image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600&q=80' },
      { name: 'Paneer 65', price: 230, isVeg: true, category: 'Starters', description: 'Golden fried paneer tossed with Andhra spices and fresh herbs.', image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&q=80' },
      { name: 'Andhra Chicken Curry', price: 290, isVeg: false, category: 'Main Course', description: 'Traditional spicy chicken curry prepared with freshly ground pepper and coriander.', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80' },
      { name: 'Butter Naan (2 Pcs)', price: 80, isVeg: true, category: 'Breads', description: 'Tandoor baked soft flatbread layered with generous melted butter.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80' },
      { name: 'Gulab Jamun (2 Pcs)', price: 70, isVeg: true, category: 'Desserts', description: 'Soft fried khoya dumplings soaked in warm cardamom sugar syrup.', image: 'https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77?w=600&q=80' }
    ]
  },
  {
    name: 'CTR - Shri Sagar',
    description: 'Heritage South Indian breakfast and iconic butter masala dosas',
    cuisine: 'South Indian, Fast Food, Filter Coffee',
    area: 'Malleshwaram',
    address: '7th Cross, Margosa Road, Malleshwaram, Bengaluru',
    rating: 4.6,
    numRatings: 3200,
    deliveryTime: '20-30 mins',
    deliveryFee: 30,
    minOrder: 100,
    priceForTwo: 200,
    isPureVeg: true,
    isApproved: true,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80',
    dishes: [
      { name: 'Benne Masala Dosa', price: 110, isVeg: true, category: 'Dosa', description: 'Signature crispy golden crepe roasted in pure butter with spiced potato filling.', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80' },
      { name: 'Rava Onion Dosa', price: 120, isVeg: true, category: 'Dosa', description: 'Semolina crepe filled with finely chopped onions and crushed green chillies.', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80' },
      { name: 'Steamed Idli (2 Pcs)', price: 50, isVeg: true, category: 'Breakfast', description: 'Fluffy steamed fermented rice cakes served with fresh coconut chutney and piping sambar.', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80' },
      { name: 'Crispy Medu Vada (2 Pcs)', price: 60, isVeg: true, category: 'Breakfast', description: 'Deep fried lentil fritters crunchy outside and soft fluffy inside.', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80' },
      { name: 'Khara Bath', price: 65, isVeg: true, category: 'Breakfast', description: 'Roasted rava cooked with mixed vegetables, mustard seeds and ghee.', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80' },
      { name: 'South Indian Filter Coffee', price: 40, isVeg: true, category: 'Beverages', description: 'Freshly decocted chicory blend milk coffee served frothy.', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80' }
    ]
  },
  {
    name: 'Empire Restaurant',
    description: 'Legendary Bengaluru eatery famous for shawarmas, kebabs and ghee rice',
    cuisine: 'North Indian, Mughlai, Kebabs',
    area: 'Indiranagar',
    address: '80 Feet Road, Near HAL 2nd Stage, Indiranagar, Bengaluru',
    rating: 4.2,
    numRatings: 2150,
    deliveryTime: '30-40 mins',
    deliveryFee: 40,
    minOrder: 150,
    priceForTwo: 500,
    isPureVeg: false,
    isApproved: true,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    dishes: [
      { name: 'Empire Special Ghee Rice', price: 160, isVeg: true, category: 'Rice', description: 'Aromatic short grain kaima rice gently tossed in pure desi ghee and fried onions.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80' },
      { name: 'Butter Chicken Masala', price: 280, isVeg: false, category: 'Curry', description: 'Charred chicken tikka simmered in creamy satin tomato makhani gravy.', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80' },
      { name: 'Empire Grilled Chicken (Half)', price: 290, isVeg: false, category: 'Tandoor', description: 'Juicy half chicken marinated in yogurt and Empire secret spice mix.', image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&q=80' },
      { name: 'Paneer Tikka', price: 240, isVeg: true, category: 'Tandoor', description: 'Chargrilled cottage cheese cubes with capsicum, onions and mint chutney.', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
      { name: 'Chicken Shawarma Roll', price: 140, isVeg: false, category: 'Rolls', description: 'Sliced roasted chicken wrapped in kuboos with garlic toum mayonnaise.', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80' },
      { name: 'Garlic Naan', price: 60, isVeg: true, category: 'Breads', description: 'Fresh clay oven bread brushed with crushed garlic and melted butter.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80' }
    ]
  },
  {
    name: 'Truffles',
    description: 'Bengaluru college popular spot for loaded burgers and pasta',
    cuisine: 'Burgers, Continental, Fast Food',
    area: 'Koramangala',
    address: 'Apex Building, 5th Block, Koramangala, Bengaluru',
    rating: 4.5,
    numRatings: 4100,
    deliveryTime: '25-35 mins',
    deliveryFee: 35,
    minOrder: 150,
    priceForTwo: 450,
    isPureVeg: false,
    isApproved: true,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    dishes: [
      { name: 'All American Cheese Burger', price: 210, isVeg: false, category: 'Burgers', description: 'Juicy tender patty with cheddar slice, pickles, lettuce and secret burger sauce.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80' },
      { name: 'Crispy Veg Whopper', price: 170, isVeg: true, category: 'Burgers', description: 'Crunchy vegetable patty with melted cheese, tomato and tangy mayo.', image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&q=80' },
      { name: 'Alfredo Pasta (Penne)', price: 240, isVeg: true, category: 'Pasta', description: 'Penne tossed in creamy parmesan garlic white sauce with sautéed mushrooms.', image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281724?w=600&q=80' },
      { name: 'Peri Peri French Fries', price: 120, isVeg: true, category: 'Sides', description: 'Crispy golden potato fries dusted with African peri peri spice blend.', image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&q=80' },
      { name: 'Chicken Wings (6 Pcs)', price: 220, isVeg: false, category: 'Sides', description: 'Glazed chicken wings tossed in smoky barbecue and hot sauce.', image: 'https://images.unsplash.com/photo-1527477378677-4c2a30d0d3a1?w=600&q=80' },
      { name: 'Ferrero Rocher Milkshake', price: 180, isVeg: true, category: 'Beverages', description: 'Thick creamy shake blended with chocolate hazelnut wafers and ice cream.', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80' }
    ]
  },
  {
    name: 'Vidyarthi Bhavan',
    description: 'Iconic century-old vegetarian tiffin spot in the cultural heart of Bengaluru',
    cuisine: 'South Indian, Traditional, Snacks',
    area: 'Gandhi Bazaar',
    address: 'Gandhi Bazaar Main Road, Basavanagudi, Bengaluru',
    rating: 4.7,
    numRatings: 5400,
    deliveryTime: '20-30 mins',
    deliveryFee: 30,
    minOrder: 100,
    priceForTwo: 200,
    isPureVeg: true,
    isApproved: true,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&q=80',
    dishes: [
      { name: 'VB Special Masala Dosa', price: 95, isVeg: true, category: 'Dosa', description: 'Thick, pillow-soft yet crispy ghee roast dosa with potato palya and coconut chutney.', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80' },
      { name: 'Poori Sagu (3 Pcs)', price: 85, isVeg: true, category: 'Breakfast', description: 'Puffed golden pooris served with mild mixed vegetable potato coconut sagu.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80' },
      { name: 'Kesari Bath', price: 55, isVeg: true, category: 'Sweets', description: 'Ghee enriched semolina pudding infused with pineapple and saffron.', image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&q=80' },
      { name: 'Rava Vada (2 Pcs)', price: 65, isVeg: true, category: 'Snacks', description: 'Crispy textured rava fritters studded with cashew nuts and curry leaves.', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80' },
      { name: 'Chow Chow Bath', price: 110, isVeg: true, category: 'Breakfast', description: 'The famous twin platter of savoury khara bath paired with sweet kesari bath.', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80' },
      { name: 'Traditional Filter Coffee', price: 35, isVeg: true, category: 'Beverages', description: 'Aromatic South Indian filter coffee in a brass dabarah set.', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80' }
    ]
  },
  {
    name: 'Punjab Grill',
    description: 'Rich North Indian curries, aromatic gravies and clay oven delicacies',
    cuisine: 'North Indian, Mughlai, Punjabi',
    area: 'Whitefield',
    address: 'ITPL Main Road, Prestige Shantiniketan, Whitefield, Bengaluru',
    rating: 4.3,
    numRatings: 1400,
    deliveryTime: '35-45 mins',
    deliveryFee: 45,
    minOrder: 200,
    priceForTwo: 700,
    isPureVeg: false,
    isApproved: true,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    dishes: [
      { name: 'Dal Makhani', price: 260, isVeg: true, category: 'Main Course', description: 'Black lentils slow cooked overnight on charcoal with butter and cream.', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80' },
      { name: 'Murgh Tikka Lababdar', price: 340, isVeg: false, category: 'Main Course', description: 'Tender chicken tikka cooked in rich tomato and onion gravy with ginger juliennes.', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80' },
      { name: 'Paneer Butter Masala', price: 280, isVeg: true, category: 'Main Course', description: 'Succulent paneer cubes simmered in velvety tomato makhani sauce.', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80' },
      { name: 'Tandoori Roti (2 Pcs)', price: 50, isVeg: true, category: 'Breads', description: 'Crisp whole wheat bread baked in clay tandoor oven.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80' },
      { name: 'Subz Biryani with Raita', price: 240, isVeg: true, category: 'Rice', description: 'Fragrant basmati rice layered with garden fresh vegetables and saffron.', image: 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=600&q=80' },
      { name: 'Sweet Lassi (Tall Glass)', price: 90, isVeg: true, category: 'Beverages', description: 'Traditional thick churned yogurt beverage flavored with rose water and cardamom.', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80' }
    ]
  },
  {
    name: 'A2B - Adyar Ananda Bhavan',
    description: 'Pure vegetarian South Indian meals, chats and traditional sweets',
    cuisine: 'Pure Veg, South Indian, Sweets',
    area: 'HSR Layout',
    address: '14th Main Road, Sector 3, HSR Layout, Bengaluru',
    rating: 4.1,
    numRatings: 1980,
    deliveryTime: '25-35 mins',
    deliveryFee: 30,
    minOrder: 120,
    priceForTwo: 300,
    isPureVeg: true,
    isApproved: true,
    image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=800&q=80',
    dishes: [
      { name: 'South Indian Mini Meals Thali', price: 160, isVeg: true, category: 'Thali', description: 'Complete lunch with rice, sambar, rasam, kootu, poriyal, curd and papad.', image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600&q=80' },
      { name: 'Ghee Podi Idli (14 Mini Idlis)', price: 110, isVeg: true, category: 'Breakfast', description: 'Mini steamed idlis generously smeared with spicy gun powder and melted ghee.', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80' },
      { name: 'Pani Puri (8 Pcs)', price: 70, isVeg: true, category: 'Chaat', description: 'Crisp hollow puris filled with spiced potato and tangy mint water.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80' },
      { name: 'Sev Puri', price: 80, isVeg: true, category: 'Chaat', description: 'Flat crispy papdis topped with diced potatoes, onions and fine chickpea sev.', image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&q=80' },
      { name: 'Kaju Katli (250g)', price: 280, isVeg: true, category: 'Sweets', description: 'Diamond cut cashew nut fudge with edible silver vark.', image: 'https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77?w=600&q=80' },
      { name: 'Badam Milk (Hot/Cold)', price: 65, isVeg: true, category: 'Beverages', description: 'Rich almond flavored milk infused with saffron strands and slivered nuts.', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80' }
    ]
  },
  {
    name: 'Corner House Ice Creams',
    description: 'Bengaluru landmark dessert parlour legendary for Death By Chocolate',
    cuisine: 'Desserts, Ice Cream, Shakes',
    area: 'Jayanagar',
    address: '9th Main Road, 4th Block, Jayanagar, Bengaluru',
    rating: 4.8,
    numRatings: 6200,
    deliveryTime: '20-30 mins',
    deliveryFee: 35,
    minOrder: 150,
    priceForTwo: 350,
    isPureVeg: true,
    isApproved: true,
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800&q=80',
    dishes: [
      { name: 'Death By Chocolate (DBC)', price: 260, isVeg: true, category: 'Sundaes', description: 'Rich chocolate cake loaded with vanilla ice cream, hot chocolate fudge and roasted peanuts.', image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=80' },
      { name: 'Hot Fudge Sundae', price: 160, isVeg: true, category: 'Sundaes', description: 'Two scoops of vanilla ice cream drenched in thick hot chocolate fudge sauce.', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80' },
      { name: 'Almond Fudge Sundae', price: 190, isVeg: true, category: 'Sundaes', description: 'Creamy butterscotch ice cream topped with roasted almond flakes and caramel.', image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=80' },
      { name: 'Apple Pie with Ice Cream', price: 180, isVeg: true, category: 'Desserts', description: 'Warm cinnamon spiced apple pie served with a scoop of vanilla bean ice cream.', image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=600&q=80' },
      { name: 'Mango Mousse Cup', price: 130, isVeg: true, category: 'Desserts', description: 'Airy whipped Alphonso mango mousse layered with mango puree.', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&q=80' },
      { name: 'Cold Chocolate Thick Shake', price: 150, isVeg: true, category: 'Beverages', description: 'Classic thick blend of chocolate ice cream, dark cocoa and fresh whole milk.', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80' }
    ]
  }
];

export const sampleCoupons = [
  {
    code: 'WELCOME50',
    discountPercent: 50,
    maxDiscount: 100, // Up to ₹100
    minOrder: 199,    // Min order ₹199
    isActive: true
  },
  {
    code: 'WELCOME20',
    discountPercent: 20,
    maxDiscount: 50,  // Up to ₹50
    minOrder: 149,    // Min order ₹149
    isActive: true
  }
];
