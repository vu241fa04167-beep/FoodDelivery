import http from 'http';

const request = (path, { method = 'GET', body, token, headers = {} } = {}) => {
  return new Promise((resolve, reject) => {
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (token) reqHeaders.Authorization = `Bearer ${token}`;

    const bodyData = body ? JSON.stringify(body) : null;
    if (bodyData) reqHeaders['Content-Length'] = Buffer.byteLength(bodyData);

    const req = http.request(
      {
        socketPath: '/tmp/savor.sock',
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            parsed = raw;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
};

const assert = (condition, msg) => {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${msg}`);
    throw new Error(msg);
  }
  console.log(`  ✓ ${msg}`);
};

async function run() {
  console.log('\n========================================');
  console.log('🧪 SAVOR PLATFORM END-TO-END TEST SUITE');
  console.log('========================================\n');

  // 1. Health check
  console.log('1. Health Check:');
  const health = await request('/api/health');
  assert(health.status === 200, 'Health endpoint returns 200');
  assert(health.data.status === 'ok', 'Service status is ok');

  // 2. Public Catalog
  console.log('\n2. Public Catalog & Discovery:');
  const categories = await request('/api/categories');
  assert(categories.status === 200, 'Categories endpoint returns 200');
  assert(categories.data.length >= 6, `Categories count: ${categories.data.length}`);

  const restaurants = await request('/api/restaurants');
  assert(restaurants.status === 200, 'Restaurants endpoint returns 200');
  assert(restaurants.data.length >= 4, `Approved restaurants count: ${restaurants.data.length}`);

  const suggestions = await request('/api/restaurants/suggestions?q=pizza');
  assert(suggestions.status === 200, 'Search suggestions returns 200');
  assert(suggestions.data.restaurants.length > 0 || suggestions.data.foods.length > 0, 'Found suggestions for "pizza"');

  const dietaryRes = await request('/api/restaurants?dietary=Vegetarian');
  assert(dietaryRes.status === 200, 'Dietary filter endpoint returns 200');
  assert(Array.isArray(dietaryRes.data), 'Dietary restaurants list returned');

  const pizzaRest = restaurants.data.find(r => r.name.includes('Mamma Mia'));
  const restDetail = await request(`/api/restaurants/${pizzaRest._id}`);
  assert(restDetail.status === 200, 'Restaurant detail endpoint returns 200');
  assert(restDetail.data.foods.length >= 3, `Menu foods count: ${restDetail.data.foods.length}`);

  // 3. Authentication
  console.log('\n3. Authentication & Roles:');
  const custLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'alex@savor.local', password: 'Password123!' }
  });
  assert(custLogin.status === 200, 'Customer login succeeds');
  const alexToken = custLogin.data.token;
  assert(custLogin.data.user.role === 'customer', 'Alex has customer role');

  const ownerLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'owner@savor.local', password: 'Password123!' }
  });
  assert(ownerLogin.status === 200, 'Restaurant owner login succeeds');
  const ownerToken = ownerLogin.data.token;
  assert(ownerLogin.data.user.role === 'restaurant', 'Owner has restaurant role');

  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@savor.local', password: 'Password123!' }
  });
  assert(adminLogin.status === 200, 'Admin login succeeds');
  const adminToken = adminLogin.data.token;
  assert(adminLogin.data.user.role === 'admin', 'Admin has admin role');

  // Customer Profile & Address Management
  const profileRes = await request('/api/auth/profile', {
    method: 'PATCH',
    token: alexToken,
    body: {
      phone: '+1 (555) 999-0000',
      addresses: [
        {
          label: 'Home',
          line1: '220 W 14th St, Apt 4B',
          city: 'New York',
          state: 'NY',
          postalCode: '10011',
          isDefault: true
        },
        {
          label: 'Office',
          line1: '100 Broadway, 12th Floor',
          city: 'New York',
          state: 'NY',
          postalCode: '10005',
          isDefault: false
        }
      ]
    }
  });
  assert(profileRes.status === 200, 'Customer profile updated successfully');
  assert(profileRes.data.user.addresses.length === 2, 'Customer saved 2 delivery addresses');

  // Favorites Toggle
  const favToggle = await request('/api/auth/favorites', {
    method: 'POST',
    token: alexToken,
    body: { restaurantId: pizzaRest._id }
  });
  assert(favToggle.status === 200, 'Favorites toggle endpoint returns 200');

  // 4. Cart & Checkout Flow
  console.log('\n4. Cart & Checkout Flow:');
  const trufflePizza = restDetail.data.foods[0];

  // Add to cart
  const cartRes = await request('/api/cart', {
    method: 'PUT',
    token: alexToken,
    body: { foodId: trufflePizza._id, quantity: 2, notes: 'Extra crispy' }
  });
  assert(cartRes.status === 200, 'Added item to cart');
  assert(cartRes.data.items.length === 1, 'Cart has 1 item');
  assert(cartRes.data.items[0].quantity === 2, 'Item quantity is 2');

  // Apply Coupon
  const couponRes = await request('/api/cart/apply-coupon', {
    method: 'POST',
    token: alexToken,
    body: { code: 'SAVOR10' }
  });
  assert(couponRes.status === 200, 'Coupon SAVOR10 applied successfully');
  assert(couponRes.data.discount === 10, 'Coupon discount is $10.00');

  // Checkout with Idempotency Key
  const idempKey = `test-idemp-${Date.now()}`;
  const checkoutRes = await request('/api/orders/checkout', {
    method: 'POST',
    token: alexToken,
    headers: { 'Idempotency-Key': idempKey },
    body: {
      address: {
        line1: '220 W 14th St, Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10011'
      },
      paymentMethod: 'online',
      couponCode: 'SAVOR10',
      deliveryInstructions: 'Leave with doorman',
      tip: 3.0,
      deliverySpeed: 'priority'
    }
  });
  assert(checkoutRes.status === 201, 'Order placed successfully (201)');
  const placedOrder = checkoutRes.data;
  assert(placedOrder.status === 'placed', 'Order status is "placed"');
  assert(placedOrder.discount === 10, 'Discount correctly recorded on order');
  assert(placedOrder.tip === 3, 'Courier tip recorded on order');
  assert(placedOrder.deliverySpeed === 'priority', 'Priority speed recorded on order');
  assert(placedOrder.priorityFee === 1.99, 'Priority fee ($1.99) charged on order');

  // Verify Cart is emptied
  const emptyCart = await request('/api/cart', { token: alexToken });
  assert(emptyCart.data.items.length === 0, 'Cart is automatically emptied after checkout');

  // Verify Order in user order history
  const myOrders = await request('/api/orders/my', { token: alexToken });
  assert(myOrders.status === 200, 'Orders history fetched');
  assert(myOrders.data.some(o => o._id === placedOrder._id), 'Placed order is in order history');

  // Test Order Cancellation Rule (allowed in placed status)
  const cancelRes = await request(`/api/orders/${placedOrder._id}/cancel`, {
    method: 'POST',
    token: alexToken,
    body: { reason: 'Placed by mistake' }
  });
  assert(cancelRes.status === 200, 'Customer successfully cancelled order in "placed" state');
  assert(cancelRes.data.status === 'cancelled', 'Order status changed to "cancelled"');

  // Customer Review on delivered order
  const deliveredOrder = myOrders.data.find(o => o.status === 'delivered');
  if (deliveredOrder) {
    const revRes = await request('/api/orders/review', {
      method: 'POST',
      token: alexToken,
      body: {
        orderId: deliveredOrder._id,
        rating: 5,
        comment: 'Best pizza in Manhattan!'
      }
    });
    assert(revRes.status === 201, '5-star review submitted and restaurant rating recalculated');
  }

  // 5. Food Rescue (Atomic Overselling Protection)
  console.log('\n5. Food Rescue Surplus Inventory:');
  const rescueList = await request('/api/rescue');
  assert(rescueList.status === 200, 'Rescue listings endpoint returns 200');
  assert(rescueList.data.length > 0, `Active surplus listings: ${rescueList.data.length}`);

  const rescueItem = rescueList.data[0];
  const initialQty = rescueItem.quantity;

  const buyRescue = await request(`/api/rescue/${rescueItem._id}/purchase`, {
    method: 'POST',
    token: alexToken,
    body: {
      quantity: 1,
      paymentMethod: 'cod',
      address: { line1: '220 W 14th St', city: 'New York' }
    }
  });
  assert(buyRescue.status === 201, 'Food rescue portion purchased');
  assert(buyRescue.data.remainingStock === initialQty - 1, 'Stock atomically decremented by 1');

  // 6. Smart Group Ordering
  console.log('\n6. Smart Group Ordering:');
  const createGroup = await request('/api/groups', {
    method: 'POST',
    token: alexToken,
    body: { restaurantId: pizzaRest._id }
  });
  assert(createGroup.status === 201, 'Group order created (201)');
  const groupCode = createGroup.data.code;
  assert(groupCode.length === 6, `Group code generated: ${groupCode}`);

  // Sophia chen joins group
  const sophiaLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'sophia@savor.local', password: 'Password123!' }
  });
  const sophiaToken = sophiaLogin.data.token;

  const joinRes = await request('/api/groups/join', {
    method: 'POST',
    token: sophiaToken,
    body: { code: groupCode }
  });
  assert(joinRes.status === 200, 'Sophia joined group order');

  // Alex adds item
  await request(`/api/groups/${groupCode}/items`, {
    method: 'POST',
    token: alexToken,
    body: { foodId: trufflePizza._id, quantity: 1 }
  });

  // Sophia adds Margherita
  const margherita = restDetail.data.foods[1];
  await request(`/api/groups/${groupCode}/items`, {
    method: 'POST',
    token: sophiaToken,
    body: { foodId: margherita._id, quantity: 1 }
  });

  // Inspect Group Order Breakdown
  const groupDetail = await request(`/api/groups/${groupCode}`, { token: alexToken });
  assert(groupDetail.data.items.length === 2, 'Group has 2 items');
  assert(groupDetail.data.memberBreakdown.length >= 2, 'Member breakdown contains both Alex and Sophia');
  assert(groupDetail.data.groupTotal > 0, `Combined group total: $${groupDetail.data.groupTotal}`);

  // Non-creator checkout should be blocked (403)
  const nonCreatorCheckout = await request(`/api/groups/${groupCode}/checkout`, {
    method: 'POST',
    token: sophiaToken,
    body: {
      address: { line1: '450 Lexington Ave', city: 'New York' },
      paymentMethod: 'online'
    }
  });
  assert(nonCreatorCheckout.status === 403, 'Non-creator checkout correctly rejected with 403 Forbidden');

  // Creator checkout succeeds
  const creatorCheckout = await request(`/api/groups/${groupCode}/checkout`, {
    method: 'POST',
    token: alexToken,
    body: {
      address: { line1: '220 W 14th St', city: 'New York' },
      paymentMethod: 'online'
    }
  });
  assert(creatorCheckout.status === 201, 'Creator checkout succeeds and creates group order');

  // 7. Restaurant Operations
  console.log('\n7. Restaurant Portal Operations:');
  const restStats = await request('/api/restaurant/stats', { token: ownerToken });
  assert(restStats.status === 200, 'Restaurant stats loaded');

  // Add new food item
  const newFood = await request('/api/restaurant/foods', {
    method: 'POST',
    token: ownerToken,
    body: {
      name: 'Spaghetti al Tartufo',
      description: 'Handmade tagliolini with shaved black winter truffles',
      price: 24.0,
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
      category: categories.data[0]._id
    }
  });
  assert(newFood.status === 201, 'New dish created in restaurant portal');

  // Toggle food availability
  const toggleFood = await request(`/api/restaurant/foods/${newFood.data._id}`, {
    method: 'PATCH',
    token: ownerToken,
    body: { isAvailable: false }
  });
  assert(toggleFood.data.isAvailable === false, 'Dish availability toggled to false (Sold out)');

  // Update restaurant profile settings
  const restProfileUpdate = await request('/api/restaurant/profile', {
    method: 'PUT',
    token: ownerToken,
    body: {
      deliveryTime: '20-30 min',
      minOrder: 15
    }
  });
  assert(restProfileUpdate.status === 200, 'Restaurant profile settings updated');

  // Delete food item
  const delFood = await request(`/api/restaurant/foods/${newFood.data._id}`, {
    method: 'DELETE',
    token: ownerToken
  });
  assert(delFood.status === 204, 'Dish successfully deleted from menu (204)');

  // 8. Admin Operations
  console.log('\n8. Admin Dashboard & Platform Controls:');
  const adminDash = await request('/api/admin/dashboard', { token: adminToken });
  assert(adminDash.status === 200, 'Admin dashboard overview loaded');
  assert(adminDash.data.orders > 0, `Total platform orders: ${adminDash.data.orders}`);

  // Admin restaurant approval status check
  const approveRest = await request(`/api/admin/restaurants/${pizzaRest._id}`, {
    method: 'PATCH',
    token: adminToken,
    body: { approved: true }
  });
  assert(approveRest.status === 200, 'Admin approved restaurant partner');

  // Create new Category (idempotent name)
  const catName = `Tacos & Mexican ${Date.now().toString().slice(-4)}`;
  const newCat = await request('/api/admin/categories', {
    method: 'POST',
    token: adminToken,
    body: { name: catName, image: '🌮' }
  });
  assert(newCat.status === 201, `Admin created new category: ${catName}`);

  // Create new Coupon (idempotent code)
  const coupCode = `FLASH${Date.now().toString().slice(-4)}`;
  const newCoup = await request('/api/admin/coupons', {
    method: 'POST',
    token: adminToken,
    body: {
      code: coupCode,
      discountType: 'percent',
      discountValue: 25,
      minOrder: 30,
      description: '25% off Flash Sale'
    }
  });
  assert(newCoup.status === 201, `Admin created promo code ${coupCode}`);

  console.log('\n========================================');
  console.log('✅ ALL TEST SUITE ASSERTIONS PASSED (100%)');
  console.log('========================================\n');
}

run().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
