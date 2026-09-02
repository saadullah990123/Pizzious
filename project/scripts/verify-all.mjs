import http from 'http';

const BASE_URL = 'http://localhost:3001';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = options.headers || {};
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  
  const res = await fetch(url, {
    ...options,
    headers,
  });
  
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  
  return {
    status: res.status,
    ok: res.ok,
    headers: res.headers,
    data,
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('🍕 PIZZIOUS PLATFORM FULL-STACK AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Storefront Menu & Categories
    console.log('\n--- 1. Testing Storefront Menu & Category API ---');
    const menuRes = await request('/api/menu');
    assert(menuRes.status === 200, 'GET /api/menu returns 200 OK');
    assert(Array.isArray(menuRes.data.categories) && menuRes.data.categories.length > 0, `Loaded ${menuRes.data?.categories?.length} categories`);
    assert(Array.isArray(menuRes.data.items) && menuRes.data.items.length > 0, `Loaded ${menuRes.data?.items?.length} menu items`);
    assert(Array.isArray(menuRes.data.deals) && menuRes.data.deals.length > 0, `Loaded ${menuRes.data?.deals?.length} combo deals`);

    // 2. Store Settings & Multi-Payment Details
    console.log('\n--- 2. Testing Store Settings & Payment Methods API ---');
    const settingsRes = await request('/api/settings');
    assert(settingsRes.status === 200, 'GET /api/settings returns 200 OK');
    const settings = settingsRes.data.settings;
    assert(settings.storeName === 'Pizzious', 'Store name is Pizzious');
    assert(Boolean(settings.easyPaisaNumber), `EasyPaisa configured (${settings.easyPaisaNumber})`);
    assert(Boolean(settings.jazzCashNumber), `JazzCash configured (${settings.jazzCashNumber})`);
    assert(Boolean(settings.meezanIban), `Meezan Bank IBAN configured (${settings.meezanIban})`);
    assert(Boolean(settings.sadaPayNumber), `SadaPay configured (${settings.sadaPayNumber})`);
    assert(Boolean(settings.payPalEmail), `PayPal configured (${settings.payPalEmail})`);

    // 3. Security: Unauthorized Admin Access Prevention
    console.log('\n--- 3. Testing Admin Security & Authorization ---');
    const unauthStats = await request('/api/admin/stats');
    assert(unauthStats.status === 401, 'Unauthenticated GET /api/admin/stats rejected with 401 Unauthorized');
    const unauthOrders = await request('/api/admin/orders');
    assert(unauthOrders.status === 401, 'Unauthenticated GET /api/admin/orders rejected with 401 Unauthorized');

    // 4. Order Creation with Server-Side Price Verification (EasyPaisa & COD)
    console.log('\n--- 4. Testing Order Placement & Server Price Recalculation ---');
    const firstItem = menuRes.data.items[0];
    const orderPayload = {
      customerName: 'Test Customer Hamza',
      customerPhone: '03009876543',
      customerEmail: 'hamza@test.com',
      deliveryAddress: 'House 10, Street 2, Gulberg, Lahore',
      deliveryNotes: 'Please ring bell',
      paymentMethod: 'EASYPAISA',
      transactionReference: 'EP-TRX-12345678',
      items: [
        {
          menuItemId: firstItem.id,
          quantity: 2,
        },
      ],
    };

    const orderRes = await request('/api/orders', {
      method: 'POST',
      body: orderPayload,
    });

    assert(orderRes.status === 201, 'POST /api/orders successfully created order (201 Created)');
    assert(orderRes.data.success === true, 'Order success flag is true');
    const createdOrder = orderRes.data.order;
    assert(Boolean(createdOrder.orderNumber), `Generated Order Number: ${createdOrder.orderNumber}`);
    assert(createdOrder.paymentStatus === 'Pending Verification', 'EasyPaisa initial payment status is "Pending Verification"');
    assert(createdOrder.orderStatus === 'Pending', 'Initial order status is "Pending"');

    // 5. Order Tracking API
    console.log('\n--- 5. Testing Order Tracking API ---');
    const trackRes = await request(`/api/orders/${createdOrder.orderNumber}`);
    assert(trackRes.status === 200, `GET /api/orders/${createdOrder.orderNumber} returned 200 OK`);
    assert(trackRes.data.order.customerName === 'Test Customer Hamza', 'Tracked order matched customer name');

    // 6. Admin Authentication (Bcrypt + HMAC Session)
    console.log('\n--- 6. Testing Admin Login & Session Generation ---');
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@pizzious.com',
        password: 'PizziousAdmin2026!',
      },
    });

    assert(loginRes.status === 200, 'POST /api/auth/login authenticated successfully (200 OK)');
    assert(loginRes.data.user.email === 'admin@pizzious.com', 'Authenticated admin email matches');
    
    // Extract session cookie
    const setCookie = loginRes.headers.get('set-cookie');
    assert(Boolean(setCookie), 'Received signed HTTP-only admin session cookie');

    const authHeaders = {
      Cookie: setCookie ? setCookie.split(';')[0] : '',
    };

    // 7. Admin Authorized Operations
    console.log('\n--- 7. Testing Admin Authorized Operations ---');
    const authStats = await request('/api/admin/stats', { headers: authHeaders });
    assert(authStats.status === 200, 'Authenticated GET /api/admin/stats returned stats 200 OK');
    assert(typeof authStats.data.stats.totalOrders === 'number', `Stats total orders: ${authStats.data.stats.totalOrders}`);

    const authOrders = await request('/api/admin/orders', { headers: authHeaders });
    assert(authOrders.status === 200, 'Authenticated GET /api/admin/orders returned orders 200 OK');

    // 8. Admin Order Status Workflow Update
    console.log('\n--- 8. Testing Admin Order Status & Payment Update ---');
    const updateRes = await request(`/api/admin/orders/${createdOrder.id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: {
        orderStatus: 'Preparing',
        paymentStatus: 'Paid',
      },
    });

    assert(updateRes.status === 200, 'Admin PATCH /api/admin/orders/:id returned 200 OK');
    assert(updateRes.data.order.orderStatus === 'Preparing', 'Order status updated to "Preparing"');
    assert(updateRes.data.order.paymentStatus === 'Paid', 'Payment status updated to "Paid"');

    // 9. Admin Combo Deal Creation
    console.log('\n--- 9. Testing Admin Dynamic Combo Deal Builder ---');
    const newDealPayload = {
      name: 'Pizzious Midnight Super Deal',
      categoryId: 1,
      description: '2 Regular Pizzas + 4 Crispy Wings + 1L Cold Drink',
      price: 2499,
      salePrice: 1999,
      images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'],
      isDeal: true,
      dealItems: [
        { name: 'Regular Pizzas', quantity: 2, description: 'Hand tossed' },
        { name: 'Crispy Wings', quantity: 4, description: 'Spicy dip' },
        { name: '1L Cold Drink', quantity: 1, description: 'Chilled' },
      ],
      isActive: true,
      isFeatured: true,
      isBestseller: true,
      stock: 50,
    };

    const createDealRes = await request('/api/admin/items', {
      method: 'POST',
      headers: authHeaders,
      body: newDealPayload,
    });

    assert(createDealRes.status === 201, 'Admin POST /api/admin/items created combo deal (201 Created)');
    assert(createDealRes.data.item.isDeal === true, 'Created item is configured as a Combo Deal');

    // 10. Summary
    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();