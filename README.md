# QuickBite — Food Delivery Web App

A simple, beginner-friendly food delivery website built for a college project using the MERN stack (MongoDB, Express, React, Node.js) with Tailwind CSS. The design follows a clean layout with Inter font and primary orange (`#FC8019`).

---

## Tech Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS v4, React Router 7, Axios
- **Backend**: Node.js, Express 4, MongoDB, Mongoose 8
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Styling**: Tailwind CSS with custom primary orange `#FC8019`

---

## Features by Role

### 1. Customer
- Sign up and log in with JWT authentication.
- Browse approved restaurants with search, cuisine filter chips, "Pure Veg" toggle, and sorting (Rating, Delivery Time, Price Low to High).
- View restaurant page with categorized menu, veg/non-veg indicator dots, and quantity controls.
- Cart with single-restaurant enforcement (prompts if switching restaurants), item remove, and promo coupon application.
- Checkout with delivery address validation, Cash on Delivery (COD), or demo online card payment.
- Order tracking with visual 4-step progress (Placed > Preparing > Out for Delivery > Delivered) that polls every 10 seconds.
- Order cancellation (allowed only while status is "placed").
- Rate and review delivered orders (1 to 5 stars + optional comment).
- View past order history with a one-click "Reorder" button.

### 2. Restaurant Owner
- Register a restaurant (starts with status "pending" until approved by admin).
- View incoming live customer orders with auto-polling every 15 seconds.
- Update order status step-by-step: Placed -> Preparing -> Out for Delivery -> Delivered.
- Full menu management: add dishes, edit prices/descriptions, delete dishes, and toggle in-stock / sold-out availability.

### 3. Admin
- Overview dashboard with platform stats: total users, restaurants, orders, and gross revenue.
- Restaurant approvals: view pending restaurant applications and approve or reject them.
- Coupon management: view, create, edit, and delete discount promo codes with percentage discounts, max limits, minimum order values, and expiry dates.

---

## Folder Structure

```text
build-a-modern-responsive-food-delivery/
├── backend/
│   ├── config/             # Database connection
│   ├── controllers/        # Request handlers (auth, restaurant, menu, order, coupon, admin)
│   ├── middleware/         # JWT auth check, role authorize, centralized error handler
│   ├── models/             # Mongoose schemas (User, Restaurant, MenuItem, Order, Coupon)
│   ├── routes/             # Express API route declarations
│   ├── seed.js             # Database seeder script
│   ├── seedData.js         # Sample Bengaluru restaurants, menus & coupons
│   ├── server.js           # Express app setup, helmet, cors & port listener
│   ├── test.js             # Automated full stack test suite
│   └── test-phase2.js      # Automated Phase 2 test suite
│
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance with auth interceptors
│   │   ├── assets/         # Tailwind CSS styling and theme setup
│   │   ├── components/     # Navbar, Footer, Cards, Steps, StatusBadge, Owner & Admin tabs
│   │   ├── context/        # AuthContext and CartContext (localStorage synced)
│   │   ├── pages/          # Home, Restaurant, Cart, Checkout, Orders, Tracking, Dashboards
│   │   ├── utils/          # Price and date formatting helpers (formatPrice, formatDate)
│   │   ├── App.jsx         # Routes setup with ProtectedRoute guards
│   │   └── main.jsx        # React root entry point
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Setup and Running

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI

### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Variables
Create `.env` in the `backend/` folder:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/quickbite
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

Create `.env` in the `frontend/` folder:
```env
VITE_API_URL=/api
```

### 4. Seed the Database
Populate demo users, the Meghana Foods restaurant, its 55-item menu, and discount coupons:
```bash
cd backend
npm run seed
```

### 5. Run the Application
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

**Terminal 2 (Frontend React App):**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Open your browser at `http://localhost:5173`.

### Production deployment

Run the backend as a Node web service and the frontend as a static site. Set these values in the hosting provider instead of committing secrets:

**Backend:** `NODE_ENV=production`, a managed `MONGODB_URI`, a long random `JWT_SECRET`, and the deployed frontend URL in `CLIENT_URL`.

**Frontend:** `VITE_API_URL=https://<your-backend-domain>/api`, then build with `npm run build` and publish `frontend/dist`.

Production startup intentionally stops when MongoDB authentication fails; it never falls back to a local database.

---

## Demo Accounts

All demo accounts use the password: **`password123`**

| Role | Email | Password | What to test |
| :--- | :--- | :--- | :--- |
| **Customer** | `rahul@gmail.com` | `password123` | Search, filters, cart, checkout, order tracking, rating, reorder |
| **Owner** | `priya@restaurant.com` | `password123` | Meghana Foods orders queue, accept orders, menu CRUD, stock toggle |
| **Admin** | `admin@quickbite.test` | `password123` | Platform revenue stats, approve/reject restaurants, coupon CRUD |

Demo Coupon Code: **`WELCOME50`** (50% off up to ₹100 on orders above ₹200)

---

## API Endpoints

### Authentication & Profile
- `POST /api/auth/register` — Register a new customer
- `POST /api/auth/login` — Login and receive JWT token (rate limited)
- `GET /api/auth/me` — Get current logged-in profile with addresses
- `PUT /api/auth/profile` — Update user name or phone (10 digits)
- `PUT /api/auth/password` — Change password (requires current password verification)
- `GET /api/auth/addresses` — List saved delivery addresses
- `POST /api/auth/addresses` — Add saved delivery address (max 5)
- `PUT /api/auth/addresses/:id` — Update saved address
- `DELETE /api/auth/addresses/:id` — Delete saved address
- `PATCH /api/auth/addresses/:id/default` — Set default address

### Restaurants & Menu
- `GET /api/restaurants` — List approved restaurants (`?search=&cuisine=&veg=&sort=`)
- `GET /api/restaurants/:id` — Restaurant details
- `POST /api/restaurants` — Owner registers a restaurant (starts pending)
- `PUT /api/restaurants/:id` — Owner updates restaurant details
- `GET /api/restaurants/mine` — Logged-in owner's restaurant
- `GET /api/restaurants/:id/menu` — Restaurant menu items
- `POST /api/menu` — Owner adds a dish
- `PUT /api/menu/:id` — Owner edits a dish
- `DELETE /api/menu/:id` — Owner deletes a dish
- `PATCH /api/menu/:id/availability` — Owner toggles dish in-stock / sold-out

### Orders & Reviews
- `POST /api/orders` — Customer places order (prices recalculated on server)
- `GET /api/orders/mine` — Customer order history
- `GET /api/orders/:id` — Single order tracking details
- `PATCH /api/orders/:id/cancel` — Customer cancels order (only while "placed")
- `GET /api/orders/restaurant` — Owner views incoming orders
- `PATCH /api/orders/:id/status` — Owner / Admin updates status (sequential)
- `POST /api/orders/:id/review` — Customer rates delivered order 1-5 stars

### Coupons
- `POST /api/coupons/validate` — Validate promo code and compute discount

### Admin
- `GET /api/admin/stats` — Total users, restaurants, orders, and platform revenue
- `GET /api/admin/orders` — View all incoming customer orders
- `GET /api/admin/restaurants` — All restaurants with pending ones first
- `PATCH /api/admin/restaurants/:id/status` — Approve or reject restaurant
- `GET /api/admin/coupons` — List all promo coupons
- `POST /api/admin/coupons` — Create coupon
- `PUT /api/admin/coupons/:id` — Edit coupon
- `DELETE /api/admin/coupons/:id` — Delete coupon

---

## Running Tests

Run all automated test suites (functional, lifecycle, security):
```bash
cd backend
npm test
```
This runs:
1. `test.js` — Core functional & auth tests
2. `test-phase2.js` — Full ordering lifecycle, catalog & coupon tests
3. `test-security.js` — Security, mass assignment, isolation & partner assignment tests
