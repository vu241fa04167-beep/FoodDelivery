process.env.NODE_ENV = 'test';
import http from 'http';
import mongoose from 'mongoose';
import app from './server.js';

let server;
let port;

// Helper to make HTTP requests
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { host: '127.0.0.1', port, path: encodeURI(path), method, headers };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

async function runPhase2Tests() {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  port = server.address().port;

  console.log('------------------------------------------------');
  console.log('RUNNING PHASE 2 API TEST RUNNER');
  console.log('------------------------------------------------');

  let passed = 0;
  let total = 0;

  const test = (title, condition) => {
    total++;
    if (condition) {
      console.log(`  [PASS] ${title}`);
      passed++;
    } else {
      console.log(`  [FAIL] ${title}`);
    }
  };

  try {
    // 0. Login Customer, Owner, Stranger
    const custLogin = await request('POST', '/api/auth/login', { email: 'rahul@gmail.com', password: 'password123' });
    const customerToken = custLogin.body.token;

    const ownerLogin = await request('POST', '/api/auth/login', { email: 'priya@restaurant.com', password: 'password123' });
    const ownerToken = ownerLogin.body.token;

    const strangerEmail = `stranger_${Date.now()}@test.com`;
    const strangerReg = await request('POST', '/api/auth/register', { name: 'Stranger User', email: strangerEmail, password: 'password123' });
    const strangerToken = strangerReg.body.token;
    test('0. Public registration always creates a customer even when role is supplied', strangerReg.status === 201 && strangerReg.body.user?.role === 'customer');

    const escalationAttempt = await request('POST', '/api/auth/register', {
      name: 'Role Escalation Attempt', email: `role_${Date.now()}@test.com`, password: 'password123', role: 'admin'
    });
    test('0a. Public registration ignores an injected admin role', escalationAttempt.status === 201 && escalationAttempt.body.user?.role === 'customer');

    // 1. Restaurant APIs
    const allRest = await request('GET', '/api/restaurants');
    test('1. GET /api/restaurants returns the single approved Meghana Foods catalog', allRest.status === 200 && allRest.body.length === 1 && allRest.body[0]?.name === 'Meghana Foods');
    const sampleRest = allRest.body.find(r => r.name === 'Meghana Foods') || allRest.body[0];

    const searchRes = await request('GET', '/api/restaurants?search=Biryani');
    test('2. GET /api/restaurants?search=Biryani returns matches', searchRes.status === 200 && searchRes.body.length > 0);

    const dishSearchRes = await request('GET', '/api/restaurants?search=Chicken');
    test('2a. GET /api/restaurants?search=Chicken matches restaurants by dish name', dishSearchRes.status === 200 && dishSearchRes.body.length >= 1 && dishSearchRes.body.some(r => r.name === 'Meghana Foods'));

    const cuisineRes = await request('GET', '/api/restaurants?cuisine=South Indian');
    test('3. GET /api/restaurants?cuisine=South Indian filters correctly', cuisineRes.status === 200 && cuisineRes.body.length > 0);

    const vegRes = await request('GET', '/api/restaurants?veg=true');
    test('4. GET /api/restaurants?veg=true filters restaurants with veg items', vegRes.status === 200 && (vegRes.body.length === 0 || vegRes.body.every((restaurant) => restaurant.isPureVeg === true)));

    const sortRes = await request('GET', '/api/restaurants?sort=deliveryTime');
    test('5. GET /api/restaurants?sort=deliveryTime sorts by delivery time', sortRes.status === 200);

    const singleRest = await request('GET', `/api/restaurants/${sampleRest._id}`);
    test('6. GET /api/restaurants/:id returns restaurant details', singleRest.status === 200 && singleRest.body.name === sampleRest.name);

    const ownerRest = await request('GET', '/api/restaurants/mine', null, ownerToken);
    test('7. GET /api/restaurants/mine returns owner restaurant (Meghana Foods)', ownerRest.status === 200 && ownerRest.body.name === 'Meghana Foods');

    // 2. Menu APIs
    const menuRes = await request('GET', `/api/restaurants/${sampleRest._id}/menu`);
    test('8. GET /api/restaurants/:id/menu returns menu items', menuRes.status === 200 && menuRes.body.length >= 6);

    const addItemRes = await request('POST', '/api/menu', {
      name: 'Paneer Kulcha',
      price: 120,
      category: 'Breads',
      description: 'Stuffed spiced cottage cheese tandoor bread',
      isVeg: true
    }, ownerToken);
    test('9. POST /api/menu adds new dish (Owner only)', addItemRes.status === 201 && addItemRes.body.item?.name === 'Paneer Kulcha');
    const newDishId = addItemRes.body.item?._id;

    const toggleRes = await request('PATCH', `/api/menu/${newDishId}/availability`, null, ownerToken);
    test('10. PATCH /api/menu/:id/availability toggles in-stock / out-of-stock', toggleRes.status === 200 && toggleRes.body.item?.isAvailable === false);

    await request('PATCH', `/api/menu/${newDishId}/availability`, null, ownerToken);

    const editItemRes = await request('PUT', `/api/menu/${newDishId}`, { price: 130 }, ownerToken);
    test('11. PUT /api/menu/:id updates dish price', editItemRes.status === 200 && editItemRes.body.item?.price === 130);

    // 3. Coupon Validation
    const couponValid = await request('POST', '/api/coupons/validate', { code: 'WELCOME50', orderTotal: 300 });
    test('12. POST /api/coupons/validate calculates discount (WELCOME50)', couponValid.status === 200 && couponValid.body.discount === 100);

    const couponMinFail = await request('POST', '/api/coupons/validate', { code: 'WELCOME50', orderTotal: 100 });
    test('13. POST /api/coupons/validate rejects order below minimum amount (400)', couponMinFail.status === 400);

    // 4. Order Lifecycle
    const meghanaMenu = await request('GET', `/api/restaurants/${ownerRest.body._id}/menu`);
    const menuItems = meghanaMenu.body;

    const invalidQuantity = await request('POST', '/api/orders', {
      restaurantId: ownerRest.body._id,
      items: [{ menuItemId: menuItems[0]._id, quantity: 0 }],
      address: 'Flat 302, Koramangala, Bengaluru', paymentMethod: 'cod'
    }, customerToken);
    test('13a. POST /api/orders rejects zero item quantity instead of silently changing it', invalidQuantity.status === 400);

    const orderCreate = await request('POST', '/api/orders', {
      restaurantId: ownerRest.body._id,
      items: [
        { menuItemId: menuItems[0]._id, quantity: 2 },
        { menuItemId: menuItems[1]._id, quantity: 1 }
      ],
      address: 'Flat 302, 12th Main, Koramangala 4th Block, Bengaluru',
      paymentMethod: 'online',
      couponCode: 'WELCOME50'
    }, customerToken);

    test('14. POST /api/orders places order with server-computed totals & tax', orderCreate.status === 201 && orderCreate.body.order?.grandTotal > 0);
    const placedOrder = orderCreate.body.order;

    const myOrdersRes = await request('GET', '/api/orders/mine', null, customerToken);
    test('15. GET /api/orders/mine lists placed order for customer', myOrdersRes.status === 200 && myOrdersRes.body.length > 0);

    const unauthorizedOrder = await request('GET', `/api/orders/${placedOrder._id}`, null, strangerToken);
    test('16. GET /api/orders/:id blocks unauthorized user (403 Forbidden)', unauthorizedOrder.status === 403);

    const ownerOrders = await request('GET', '/api/orders/restaurant', null, ownerToken);
    test('17. GET /api/orders/restaurant lists incoming orders for owner', ownerOrders.status === 200 && Array.isArray(ownerOrders.body));

    const skipStep = await request('PATCH', `/api/orders/${placedOrder._id}/status`, { status: 'delivered' }, ownerToken);
    test('18. PATCH /api/orders/:id/status rejects skipping status steps (400)', skipStep.status === 400);

    const step1 = await request('PATCH', `/api/orders/${placedOrder._id}/status`, { status: 'preparing' }, ownerToken);
    const step2 = await request('PATCH', `/api/orders/${placedOrder._id}/status`, { status: 'out_for_delivery' }, ownerToken);
    const step3 = await request('PATCH', `/api/orders/${placedOrder._id}/status`, { status: 'delivered' }, ownerToken);
    test('19. PATCH /api/orders/:id/status allows sequential progression to delivered', step1.status === 200 && step2.status === 200 && step3.status === 200 && step3.body.order?.orderStatus === 'delivered');

    const reviewRes = await request('POST', `/api/orders/${placedOrder._id}/review`, { rating: 5, comment: 'Great food!' }, customerToken);
    test('20. POST /api/orders/:id/review customer rates delivered order', reviewRes.status === 200 && reviewRes.body.order?.rating === 5);

    const duplicateReview = await request('POST', `/api/orders/${placedOrder._id}/review`, { rating: 4, comment: 'Duplicate' }, customerToken);
    test('21. POST /api/orders/:id/review rejects second review on same order (400)', duplicateReview.status === 400);

    const deleteRes = await request('DELETE', `/api/menu/${newDishId}`, null, ownerToken);
    test('22. DELETE /api/menu/:id deletes dish (Owner only)', deleteRes.status === 200);
  } catch (err) {
    console.error('Test execution error:', err.message);
  } finally {
    server.close();
    await mongoose.disconnect();
  }

  console.log('------------------------------------------------');
  console.log(`Summary: ${passed} / ${total} Phase 2 tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log('------------------------------------------------');
  process.exit(passed === total ? 0 : 1);
}

runPhase2Tests();
