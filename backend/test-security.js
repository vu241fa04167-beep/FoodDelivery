process.env.NODE_ENV = 'test';
import http from 'http';
import mongoose from 'mongoose';
import app from './server.js';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import Order from './models/Order.js';

let server, port;

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({ host: '127.0.0.1', port, path: encodeURI(path), method, headers }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

async function runSecurityTests() {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  port = server.address().port;

  console.log('------------------------------------------------');
  console.log('RUNNING SECURITY & AUTHORIZATION TESTS');
  console.log('------------------------------------------------');

  let passed = 0, total = 0;
  const test = (title, condition) => {
    total++;
    if (condition) { passed++; console.log(`  [PASS] ${title}`); }
    else { console.log(`  [FAIL] ${title}`); }
  };

  try {
    // Logins
    const custLogin = await request('POST', '/api/auth/login', { email: 'rahul@gmail.com', password: 'password123' });
    const custToken = custLogin.body.token;
    const ownerLogin = await request('POST', '/api/auth/login', { email: 'priya@restaurant.com', password: 'password123' });
    const ownerToken = ownerLogin.body.token;

    const strangerRes = await request('POST', '/api/auth/register', { name: 'Stranger', email: `stranger_${Date.now()}@t.com`, password: 'password123' });
    const strangerToken = strangerRes.body.token;

    // 1. Password hash leak check
    const meRes = await request('GET', '/api/auth/me', null, custToken);
    test('1. GET /api/auth/me never leaks password hash', !meRes.body.user?.password && meRes.body.user?.email === 'rahul@gmail.com');

    // 2. Profile update
    const profBad = await request('PUT', '/api/auth/profile', { name: 'Rahul', phone: '123' }, custToken);
    test('2. PUT /api/auth/profile rejects invalid phone', profBad.status === 400);

    const profOk = await request('PUT', '/api/auth/profile', { name: 'Rahul S', phone: '9876543210' }, custToken);
    test('3. PUT /api/auth/profile updates profile and returns no hash', profOk.status === 200 && profOk.body.user?.phone === '9876543210' && !profOk.body.user?.password);

    // 3. Password change
    const passWrong = await request('PUT', '/api/auth/password', { currentPassword: 'wrong', newPassword: 'newpassword123' }, custToken);
    test('4. PUT /api/auth/password rejects wrong current password', passWrong.status === 400);

    const passOk = await request('PUT', '/api/auth/password', { currentPassword: 'password123', newPassword: 'password123' }, custToken);
    test('5. PUT /api/auth/password succeeds with valid passwords', passOk.status === 200);

    // 4. Address CRUD & Cap
    const add1 = await request('POST', '/api/auth/addresses', {
      label: 'Home', fullName: 'Rahul', phone: '9876543210', line1: 'Flat 1', area: 'Koramangala', pincode: '560034'
    }, strangerToken);
    test('6. POST /api/auth/addresses creates address and first is default', add1.status === 201 && add1.body.length === 1 && add1.body[0].isDefault === true);

    for (let i = 2; i <= 5; i++) {
      await request('POST', '/api/auth/addresses', { label: 'Work', fullName: 'Rahul', phone: '9876543210', line1: `Floor ${i}`, area: 'Kora', pincode: '560034' }, strangerToken);
    }
    const add6 = await request('POST', '/api/auth/addresses', { label: 'Other', fullName: 'Rahul', phone: '9876543210', line1: 'Site 6', area: 'Kora', pincode: '560034' }, strangerToken);
    test('7. POST /api/auth/addresses enforces 5 address cap', add6.status === 400);

    // 5. Address Isolation
    const strangerAddrs = await request('GET', '/api/auth/addresses', null, strangerToken);
    const targetAddrId = strangerAddrs.body[0]._id;
    const deleteByCust = await request('DELETE', `/api/auth/addresses/${targetAddrId}`, null, custToken);
    test('8. User cannot delete another user address (404/isolation)', deleteByCust.status === 404);

    // 6. Order Isolation & Partner Assignment
    const rest = await Restaurant.findOne({ name: 'Meghana Foods' });
    const orderRes = await request('POST', '/api/orders', {
      restaurantId: rest._id,
      items: [{ menuItemId: (await Restaurant.findOne({ name: 'Meghana Foods' }).then(async r => (await Order.findOne({ restaurant: r._id })).items[0].menuItem)), quantity: 1 }],
      address: 'Flat 201, Koramangala', paymentMethod: 'cod'
    }, custToken);
    const orderId = orderRes.body.order?._id;

    const strangerCancel = await request('PATCH', `/api/orders/${orderId}/cancel`, null, strangerToken);
    test('9. Stranger cannot cancel customer order (403)', strangerCancel.status === 403);

    // Move to out_for_delivery
    await request('PATCH', `/api/orders/${orderId}/status`, { status: 'preparing' }, ownerToken);
    const outRes = await request('PATCH', `/api/orders/${orderId}/status`, { status: 'out_for_delivery' }, ownerToken);
    test('10. Moving to out_for_delivery assigns delivery partner', outRes.status === 200 && Boolean(outRes.body.order?.deliveryPartner?.name));

    const strangerView = await request('GET', `/api/orders/${orderId}`, null, strangerToken);
    test('11. Stranger cannot view order or partner details (403)', strangerView.status === 403);

    // 7. NoSQL Injection Rejection
    const injectRes = await request('POST', '/api/coupons/validate', { code: { $gt: '' }, orderTotal: 100 });
    test('12. Rejection of MongoDB $ operator in body (400)', injectRes.status === 400);

  } catch (err) {
    console.error('Security test error:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
  }

  console.log('------------------------------------------------');
  console.log(`Summary: ${passed} / ${total} Security Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('------------------------------------------------');
  process.exit(passed === total ? 0 : 1);
}

runSecurityTests();

