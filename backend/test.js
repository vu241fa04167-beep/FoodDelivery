process.env.NODE_ENV = 'test';
import http from 'http';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from './server.js';
import User from './models/User.js';

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

async function runAllTests() {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  port = server.address().port;

  console.log('------------------------------------------------');
  console.log('RUNNING FULL STACK TEST SUITE');
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
    // 1. Auth Logins
    const custLogin = await request('POST', '/api/auth/login', { email: 'rahul@gmail.com', password: 'password123' });
    const ownerLogin = await request('POST', '/api/auth/login', { email: 'priya@restaurant.com', password: 'password123' });
    const adminLogin = await request('POST', '/api/auth/login', { email: 'admin@quickbite.test', password: 'password123' });

    const customerToken = custLogin.body.token;
    const ownerToken = ownerLogin.body.token;
    const adminToken = adminLogin.body.token;
    test('1. Logins succeed for customer, owner, and admin', customerToken && ownerToken && adminToken);

    // Auth validation tests (duplicate email, wrong password, no token, 401)
    const dupEmail = await request('POST', '/api/auth/register', { name: 'Duplicate User', email: 'rahul@gmail.com', password: 'password123' });
    test('1a. Register with duplicate email returns 400', dupEmail.status === 400);

    const wrongPass = await request('POST', '/api/auth/login', { email: 'rahul@gmail.com', password: 'wrongpassword' });
    test('1b. Login with wrong password returns 401', wrongPass.status === 401);

    const noToken = await request('GET', '/api/auth/me');
    test('1c. Accessing protected route without token returns 401', noToken.status === 401);

    const badToken = await request('GET', '/api/auth/me', null, 'invalid_token_xyz');
    test('1d. Accessing protected route with invalid token returns 401', badToken.status === 401);

    // 2. Pure Veg & Price Sorting
    const vegRes = await request('GET', '/api/restaurants?veg=true');
    const allPureVeg = vegRes.body.length > 0 && vegRes.body.every((r) => r.isPureVeg === true);
    test('2. Pure Veg filter returns only pure veg restaurants', vegRes.status === 200 && (vegRes.body.length === 0 || allPureVeg));

    const priceSortRes = await request('GET', '/api/restaurants?sort=priceLow');
    let isSorted = true;
    for (let i = 1; i < priceSortRes.body.length; i++) {
      if (priceSortRes.body[i].priceForTwo < priceSortRes.body[i - 1].priceForTwo) isSorted = false;
    }
    test('3. Price low to high sorts by priceForTwo', isSorted && priceSortRes.body.length > 0);

    // 3. Restaurant Approval & Visibility
    const hashedPassword = await bcrypt.hash('password123', 10);
    const tempOwner = await User.create({
      name: 'Temp Chef',
      email: `tempchef_${Date.now()}@test.com`,
      password: hashedPassword,
      role: 'owner'
    });
    const tempOwnerLogin = await request('POST', '/api/auth/login', { email: tempOwner.email, password: 'password123' });
    const tempOwnerToken = tempOwnerLogin.body.token;

    const createRest = await request('POST', '/api/restaurants', {
      name: 'Mario Italian Bistro',
      cuisine: 'Italian, Pizza',
      area: 'Indiranagar',
      address: '100ft Road, Indiranagar',
      priceForTwo: 500
    }, tempOwnerToken);
    test('4. Newly created restaurant starts with status pending', createRest.status === 201 && createRest.body.restaurant?.status === 'pending');

    const publicList = await request('GET', '/api/restaurants');
    const hasPendingInPublic = publicList.body.some((r) => r.status === 'pending');
    test('5. Pending restaurant is hidden from public list', !hasPendingInPublic);

    const newRestId = createRest.body.restaurant?._id;
    const approveRes = await request('PATCH', `/api/admin/restaurants/${newRestId}/status`, { status: 'approved' }, adminToken);
    test('6. Admin can approve a pending restaurant', approveRes.status === 200 && approveRes.body.restaurant?.status === 'approved');

    const rejectRes = await request('PATCH', `/api/admin/restaurants/${newRestId}/status`, { status: 'rejected' }, adminToken);
    test('7. Admin can reject a restaurant', rejectRes.status === 200 && rejectRes.body.restaurant?.status === 'rejected');

    // 4. Orders & Cancellation
    const rest = publicList.body[0];
    const menu = await request('GET', `/api/restaurants/${rest._id}/menu`);
    const dish1 = menu.body[0];

    const orderRes = await request('POST', '/api/orders', {
      restaurantId: rest._id,
      items: [{ menuItemId: dish1._id, quantity: 2 }],
      address: 'Flat 101, Indiranagar, Bengaluru - 560038',
      paymentMethod: 'cod'
    }, customerToken);
    test('8. Customer places order with server totals and delivery ETA', orderRes.status === 201 && orderRes.body.order?.grandTotal > 0 && Boolean(orderRes.body.order?.estimatedDeliveryAt));

    const testOrder = orderRes.body.order;
    const cancelRes = await request('PATCH', `/api/orders/${testOrder._id}/cancel`, null, customerToken);
    test('9. Customer can cancel order while status is placed', cancelRes.status === 200 && cancelRes.body.order?.orderStatus === 'cancelled');

    const cancelAgain = await request('PATCH', `/api/orders/${testOrder._id}/cancel`, null, customerToken);
    test('10. Cancelling non-placed order fails with 400', cancelAgain.status === 400);

    // 5. Admin Stats & Access Control
    const statsRes = await request('GET', '/api/admin/stats', null, adminToken);
    test('11. GET /api/admin/stats returns counts', statsRes.status === 200 && statsRes.body.usersCount >= 1);

    const statsBlock = await request('GET', '/api/admin/stats', null, customerToken);
    test('12. Customer blocked from admin stats (403)', statsBlock.status === 403);

    // 6. Coupon CRUD
    const couponCode = `TEST${Date.now().toString().slice(-4)}`;
    const custCoupon = await request('POST', '/api/admin/coupons', { code: couponCode, discountPercent: 20 }, customerToken);
    test('13. Customer blocked from creating coupon (403)', custCoupon.status === 403);

    const adminCoupon = await request('POST', '/api/admin/coupons', {
      code: couponCode,
      discountPercent: 25,
      maxDiscount: 150,
      minOrder: 250
    }, adminToken);
    test('14. Admin creates new discount coupon', adminCoupon.status === 201);

    const couponId = adminCoupon.body.coupon?._id;
    const valRes = await request('POST', '/api/coupons/validate', { code: couponCode, orderTotal: 400 });
    test('15. Validating coupon calculates discount', valRes.status === 200 && valRes.body.discount === 100);

    const updRes = await request('PUT', `/api/admin/coupons/${couponId}`, { maxDiscount: 200 }, adminToken);
    test('16. Admin edits coupon', updRes.status === 200 && updRes.body.coupon?.maxDiscount === 200);

    const delRes = await request('DELETE', `/api/admin/coupons/${couponId}`, null, adminToken);
    test('17. Admin deletes coupon', delRes.status === 200);
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
  }

  console.log('------------------------------------------------');
  console.log(`Summary: ${passed} / ${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('------------------------------------------------');
  process.exit(passed === total ? 0 : 1);
}

runAllTests();
