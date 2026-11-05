# SAVOR — Premium MERN Food Delivery Platform

Savor is an elevated, production-quality food delivery web platform crafted with the **MERN** technology stack (MongoDB, Express, React, Node.js) and Tailwind CSS. Savor bridges fine artisanal dining with intuitive digital convenience, featuring multi-role workflows for customers, restaurant kitchen operators, and platform administrators, alongside unique innovations: **Smart Group Ordering** and zero-waste **Food Rescue**.

---

## Table of Contents
1. [Tech Stack & Architecture](#tech-stack--architecture)
2. [Project Structure](#project-structure)
3. [Design & UI Principles](#design--ui-principles)
4. [Key Features & Workflows](#key-features--workflows)
   - [Customer Experience](#customer-experience)
   - [Restaurant Kitchen Dashboard](#restaurant-kitchen-dashboard)
   - [Platform Administration Dashboard](#platform-administration-dashboard)
   - [Smart Group Ordering](#smart-group-ordering)
   - [Food Rescue Surplus](#food-rescue-surplus)
   - [Security & Server-Side Integrity](#security--server-side-integrity)
5. [Installation & Setup](#installation--setup)
6. [Environment Variables](#environment-variables)
7. [Pre-Seeded Test Accounts](#pre-seeded-test-accounts)
8. [API Reference](#api-reference)
9. [Automated Verification & Testing](#automated-verification--testing)
10. [Production Deployment Guide](#production-deployment-guide)

---

## Tech Stack & Architecture

- **Frontend**: React 18, Vite 6, Tailwind CSS v4, Lucide React icons.
- **Backend**: Node.js (ES Modules), Express 4, MongoDB, Mongoose 8.
- **Authentication**: Signed JSON Web Tokens (JWT, 7-day expiration), bcrypt password hashing (12 salt rounds), Google OAuth 2.0 Identity Services verification endpoint.
- **API Architecture**: RESTful endpoints, centralized error handler, role-based access control (`customer`, `restaurant`, `admin`), Idempotency-Key support, atomic stock decrement.

---

## Project Structure

The project is cleanly decoupled into independently runnable `frontend/` and `backend/` packages:

```text
Savor/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   └── styles.css               # Tailwind CSS v4 setup & custom animations
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx           # Navigation, search, location & cart triggers
│   │   │   │   ├── Footer.jsx           # Editorial footer with brand links & mission
│   │   │   │   ├── NotificationToast.jsx# Floating notification toasts
│   │   │   │   ├── LoadingSkeleton.jsx  # Shimmer loading cards
│   │   │   │   ├── EmptyState.jsx       # Reusable empty states with CTAs
│   │   │   │   ├── LocationModal.jsx    # Delivery neighborhood & address selector
│   │   │   │   ├── SearchModal.jsx      # Live autocomplete search for dishes & kitchens
│   │   │   │   └── ReviewModal.jsx      # 5-star customer review modal
│   │   │   ├── customer/
│   │   │   │   ├── RestaurantCard.jsx   # Kitchen card with rating, fee & favorite heart
│   │   │   │   ├── FoodCard.jsx         # Dish card with dietary badges & quantity counter
│   │   │   │   └── CartDrawer.jsx       # Slide-over cart with live promo code & totals
│   │   │   ├── restaurant/
│   │   │   │   ├── MenuDishRow.jsx      # Dish inventory item row
│   │   │   │   └── OrderQueueCard.jsx   # Live incoming kitchen order card
│   │   │   └── admin/
│   │   │       ├── RestaurantApprovalRow.jsx # Partner verification action row
│   │   │       └── StatsMetricCard.jsx  # Platform KPI card
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   │   ├── HomePage.jsx         # Hero, offers, categories, filters & restaurant grid
│   │   │   │   ├── RestaurantDetailPage.jsx # Banner, category tabs, menu items, reviews
│   │   │   │   ├── CheckoutPage.jsx     # Address selector, COD/Online card simulation
│   │   │   │   ├── OrdersPage.jsx       # Order history, live status stepper, cancel, reorder
│   │   │   │   ├── FoodRescuePage.jsx   # Surplus marketplace, stock countdown & reservation
│   │   │   │   ├── GroupOrderPage.jsx   # Shared cart, member attribution, creator checkout
│   │   │   │   ├── FavoritesPage.jsx    # User wishlist and bookmarked kitchens
│   │   │   │   └── ProfilePage.jsx      # Name, phone, saved delivery addresses manager
│   │   │   ├── restaurant/
│   │   │   │   └── RestaurantDashboardPage.jsx # Orders queue, menu manager, surplus listing
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboardPage.jsx      # Platform analytics, kitchen approvals, coupons
│   │   │   └── auth/
│   │   │       └── AuthModal.jsx        # Login, signup, forgot password & 1-click test pills
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx           # Global master wrapper layout
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # Context provider for authentication & favorites
│   │   │   └── CartContext.jsx          # Context provider for shopping cart state
│   │   ├── hooks/
│   │   │   ├── useAuth.js               # Hook accessing AuthContext
│   │   │   ├── useCart.js               # Hook accessing CartContext
│   │   │   └── useNotification.js       # Hook managing toast notifications
│   │   ├── services/
│   │   │   ├── api.js                   # Unified API fetch utility
│   │   │   ├── authService.js           # Authentication & user profile API calls
│   │   │   ├── restaurantService.js     # Catalog, kitchens & dish queries
│   │   │   ├── orderService.js          # Cart, orders & checkout operations
│   │   │   ├── groupOrderService.js     # Group session API calls
│   │   │   └── rescueService.js         # Surplus food rescue operations
│   │   ├── utils/
│   │   │   └── formatters.js            # Currency & date formatters
│   │   ├── App.jsx                      # Main application orchestrator
│   │   └── main.jsx                     # Vite mount point
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # Database connection with socket fallback
│   │   ├── controllers/
│   │   │   ├── authController.js        # Auth, Google login, favorites
│   │   │   ├── catalogController.js     # Public categories, restaurants, dishes, search
│   │   │   ├── cartController.js        # Persistent user shopping cart & coupon check
│   │   │   ├── orderController.js       # Server checkout, status update, cancel, reviews
│   │   │   ├── groupOrderController.js  # Smart group ordering & creator checkout
│   │   │   ├── rescueController.js      # Zero-waste food rescue marketplace
│   │   │   └── managementController.js  # Partner restaurant portal & platform admin
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js        # JWT verify and role authorization middleware
│   │   │   └── errorMiddleware.js       # Centralized JSON error responder
│   │   ├── models/
│   │   │   ├── User.js                  # User schema with embedded addresses & favorites
│   │   │   ├── Restaurant.js            # Kitchen schema with cuisines, fees & approval
│   │   │   ├── Food.js                  # Dish schema with dietary tags & pricing
│   │   │   ├── Category.js              # Culinary categories
│   │   │   ├── Cart.js                  # Persistent cart schema
│   │   │   ├── Order.js                 # Order schema with status history & tracking
│   │   │   ├── GroupOrder.js            # Multi-member shared cart schema
│   │   │   ├── RescueListing.js         # Surplus food listings with atomic counters
│   │   │   ├── Coupon.js                # Percentage/fixed promotional discount codes
│   │   │   ├── Review.js                # 5-star ratings & customer reviews
│   │   │   └── index.js                 # Export barrel for all models
│   │   ├── routes/
│   │   │   ├── authRoutes.js            # /api/auth routes
│   │   │   ├── catalogRoutes.js         # /api categories, restaurants, dishes, search
│   │   │   ├── cartRoutes.js            # /api/cart routes
│   │   │   ├── orderRoutes.js           # /api/orders routes
│   │   │   ├── groupRoutes.js           # /api/groups routes
│   │   │   ├── rescueRoutes.js          # /api/rescue routes
│   │   │   ├── restaurantRoutes.js      # /api/restaurant routes
│   │   │   ├── adminRoutes.js           # /api/admin routes
│   │   │   └── index.js                 # Top-level API router dispatcher
│   │   ├── services/
│   │   │   ├── pricingService.js        # Server-side subtotal, discount, fee & total
│   │   │   └── inventoryService.js      # Atomic stock validation & decrement
│   │   ├── validators/
│   │   │   ├── authValidator.js         # Payload validation for login & registration
│   │   │   └── orderValidator.js        # Payload validation for checkout & status updates
│   │   ├── utils/
│   │   │   ├── tokenHelper.js           # JWT sign & verify utilities
│   │   │   └── codeGenerator.js         # Unique 6-character group invite code generator
│   │   ├── seed.js                      # Realistic seed script
│   │   └── server.js                    # Express app (HTTP 5000 + unix socket)
│   ├── test/
│   │   └── test-full-suite.js           # Comprehensive automated end-to-end test runner
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json                         # Workspace root convenience runner
---

## Project Structure

The project is cleanly decoupled into independently runnable `frontend/` and `backend/` packages:

```text
Savor/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   └── styles.css               # Tailwind CSS v4 setup & custom animations
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx           # Navigation, search, location & cart triggers
│   │   │   │   ├── Footer.jsx           # Editorial footer with brand links & mission
│   │   │   │   ├── NotificationToast.jsx# Floating notification toasts
│   │   │   │   ├── LoadingSkeleton.jsx  # Shimmer loading cards
│   │   │   │   ├── EmptyState.jsx       # Reusable empty states with CTAs
│   │   │   │   ├── LocationModal.jsx    # Delivery neighborhood & address selector
│   │   │   │   ├── SearchModal.jsx      # Live autocomplete search for dishes & kitchens
│   │   │   │   └── ReviewModal.jsx      # 5-star customer review modal
│   │   │   ├── customer/
│   │   │   │   ├── RestaurantCard.jsx   # Kitchen card with rating, fee & favorite heart
│   │   │   │   ├── FoodCard.jsx         # Dish card with dietary badges & quantity counter
│   │   │   │   └── CartDrawer.jsx       # Slide-over cart with live promo code & totals
│   │   │   ├── restaurant/
│   │   │   │   ├── MenuDishRow.jsx      # Dish inventory item row
│   │   │   │   └── OrderQueueCard.jsx   # Live incoming kitchen order card
│   │   │   └── admin/
│   │   │       ├── RestaurantApprovalRow.jsx # Partner verification action row
│   │   │       └── StatsMetricCard.jsx  # Platform KPI card
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   │   ├── HomePage.jsx         # Hero, offers, categories, filters & restaurant grid
│   │   │   │   ├── RestaurantDetailPage.jsx # Banner, category tabs, menu items, reviews
│   │   │   │   ├── CheckoutPage.jsx     # Address selector, COD/Online card simulation
│   │   │   │   ├── OrdersPage.jsx       # Order history, live status stepper, cancel, reorder
│   │   │   │   ├── FoodRescuePage.jsx   # Surplus marketplace, stock countdown & reservation
│   │   │   │   ├── GroupOrderPage.jsx   # Shared cart, member attribution, creator checkout
│   │   │   │   ├── FavoritesPage.jsx    # User wishlist and bookmarked kitchens
│   │   │   │   └── ProfilePage.jsx      # Name, phone, saved delivery addresses manager
│   │   │   ├── restaurant/
│   │   │   │   └── RestaurantDashboardPage.jsx # Orders queue, menu manager, surplus listing
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboardPage.jsx      # Platform analytics, kitchen approvals, coupons
│   │   │   └── auth/
│   │   │       └── AuthModal.jsx        # Login, signup, forgot password & 1-click test pills
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx           # Global master wrapper layout
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # Context provider for authentication & favorites
│   │   │   └── CartContext.jsx          # Context provider for shopping cart state
│   │   ├── hooks/
│   │   │   ├── useAuth.js               # Hook accessing AuthContext
│   │   │   ├── useCart.js               # Hook accessing CartContext
│   │   │   └── useNotification.js       # Hook managing toast notifications
│   │   ├── services/
│   │   │   └── api.js                   # Unified API fetch utility & service modules
│   │   ├── utils/
│   │   │   ├── formatters.js            # Currency & date formatters
│   │   │   └── storage.js               # LocalStorage auth helpers
│   │   ├── App.jsx                      # Main application orchestrator
│   │   └── main.jsx                     # Vite mount point
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # Database connection with socket fallback
│   │   ├── controllers/
│   │   │   ├── authController.js        # Auth, Google login, favorites
│   │   │   ├── catalogController.js     # Public categories, restaurants, dishes, search
│   │   │   ├── cartController.js        # Persistent user shopping cart & coupon check
│   │   │   ├── orderController.js       # Server checkout, status update, cancel, reviews
│   │   │   ├── groupOrderController.js  # Smart group ordering & creator checkout
│   │   │   ├── rescueController.js      # Zero-waste food rescue marketplace
│   │   │   └── managementController.js  # Partner restaurant portal & platform admin
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js        # JWT verify and role authorization middleware
│   │   │   └── errorMiddleware.js       # Centralized JSON error responder
│   │   ├── models/
│   │   │   ├── User.js                  # User schema with embedded addresses & favorites
│   │   │   ├── Restaurant.js            # Kitchen schema with cuisines, fees & approval
│   │   │   ├── Food.js                  # Dish schema with dietary tags & pricing
│   │   │   ├── Category.js              # Culinary categories
│   │   │   ├── Cart.js                  # Persistent cart schema
│   │   │   ├── Order.js                 # Order schema with status history & tracking
│   │   │   ├── GroupOrder.js            # Multi-member shared cart schema
│   │   │   ├── RescueListing.js         # Surplus food listings with atomic counters
│   │   │   ├── Coupon.js                # Percentage/fixed promotional discount codes
│   │   │   ├── Review.js                # 5-star ratings & customer reviews
│   │   │   └── index.js                 # Export barrel for all models
│   │   ├── routes/
│   │   │   ├── authRoutes.js            # /api/auth routes
│   │   │   ├── catalogRoutes.js         # /api categories, restaurants, dishes, search
│   │   │   ├── cartRoutes.js            # /api/cart routes
│   │   │   ├── orderRoutes.js           # /api/orders routes
│   │   │   ├── groupRoutes.js           # /api/groups routes
│   │   │   ├── rescueRoutes.js          # /api/rescue routes
│   │   │   ├── restaurantRoutes.js      # /api/restaurant routes
│   │   │   ├── adminRoutes.js           # /api/admin routes
│   │   │   └── index.js                 # Top-level API router dispatcher
│   │   ├── services/
│   │   │   ├── pricingService.js        # Server-side subtotal, discount, fee & total
│   │   │   └── inventoryService.js      # Atomic stock validation & decrement
│   │   ├── validators/
│   │   │   ├── authValidator.js         # Payload validation for login & registration
│   │   │   └── orderValidator.js        # Payload validation for checkout & status updates
│   │   ├── utils/
│   │   │   ├── tokenHelper.js           # JWT sign & verify utilities
│   │   │   └── codeGenerator.js         # Unique 6-character group invite code generator
│   │   ├── seed.js                      # Realistic seed script
│   │   └── server.js                    # Express app (HTTP 5000 + unix socket)
│   ├── test/
│   │   └── test-full-suite.js           # Comprehensive automated end-to-end test runner
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json                         # Workspace root convenience runner
```

---

## Design & UI Principles

1. **Color Palette**:
   - Background: Warm eggshell `#fbfaf7` & card surface `#f7f6f1`
   - Primary: Deep forest green `#195c45` (hover: `#124534`, light badge: `#e6efe8`)
   - Accent: Warm terracotta `#ef6b42` (hover: `#d85730`, light badge: `#fdf1ec`)
   - Text & Lines: Ink `#17211d`, muted `#66706b`, subtle border `#e7e9e6`
2. **Typography**:
   - Headings: Editorial serif `Playfair Display`
   - Body & Controls: Crisp sans-serif `DM Sans`
3. **Responsive Layout**: Fluid layouts across mobile, tablet, and wide desktop screens.

---

## Key Features & Workflows

### Customer Experience
- **Location Selector**: Header modal to choose from popular neighborhoods or enter custom street addresses.
- **Discovery & Search**: Real-time debounce search for kitchens and dishes with instant auto-suggestions.
- **Cuisine Filters**: Categorized tabs (Pizza, Healthy Bowls, Burgers, Sushi, Asian, Bakery, Coffee, Indian) with active reset indicators.
- **Kitchen Detail**: Cover banners, hygiene & price badges, category tabs, and menu dish cards with dietary labels (`Vegetarian`, `Vegan`, `Gluten-Free`, `Halal`, `Spicy`).
- **Persistent Cart**: Slide-over drawer synced with the database. Supports dish quantities, custom chef instructions, promo codes, and conflict warnings when adding from different restaurants.
- **Secure Checkout**: Saved address picker, COD or simulated online card payments, subtotal, delivery fee, and discount summary.
- **Live Order Tracker**: 5-step visual stepper (`Order Placed` -> `Kitchen Accepted` -> `Cooking & Packing` -> `Out for Delivery` -> `Delivered`) updating automatically via polling.
- **Cancellation**: One-click cancellation with reason prompt allowed while the order is in `placed` status.
- **Reordering**: One-click re-add of items from past orders into the active shopping cart.
- **Customer Reviews**: Rate completed orders 1–5 stars with written reviews that recalculate restaurant ratings.
- **Wishlist & Favorites**: Persistent heart toggle for favourite kitchens.

### Restaurant Kitchen Dashboard
- **Live Orders Queue**: Instant view of incoming orders with customer details, item notes, payment status, and order status progression buttons (`Accept`, `Start Cooking`, `Send Courier`, `Mark Delivered`).
- **Menu Manager**: Add new dishes, edit prices, descriptions, dietary tags, and toggle instant dish availability (`In Stock` / `Sold Out`).
- **Surplus Food Rescue Publisher**: Quickly publish evening surplus batches with discounted rescue pricing and available portions.
- **Kitchen Performance**: Real-time sales, order volume, and customer satisfaction ratings.

### Platform Administration Dashboard
- **Platform Overview**: Platform-wide metrics: total revenue, order count, registered customers, partner kitchens, active surplus items.
- **Kitchen Approvals**: Review new partner applications with one-click `Approve` or `Reject` actions.
- **Category Manager**: Add new culinary categories and icon badges to the discovery grid.
- **Promotions & Promo Codes**: Create promo codes with percentage discounts or fixed amounts, minimum order amounts, and usage limits.

### Smart Group Ordering
- Start a group order from any kitchen menu.
- Generates a unique 6-character code (e.g., `SAV7X9`) and shareable link (`/?group=SAV7X9`).
- Friends join in their own browsers without sharing passwords.
- Real-time shared basket itemizing who ordered what with individual sub-totals.
- Creator-controlled checkout: only the group host can finalize delivery details and submit the order.

### Food Rescue Surplus
- Partner restaurants list end-of-day surplus meals at 40–60% discounts.
- Live countdown of remaining portions.
- Stock is validated and decremented atomically on the server (`$gte` query filter) to prevent overselling.

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (Local or Atlas)

### Step 1: Install Dependencies
From the repository root:
```bash
# Install backend dependencies
npm --prefix backend install

# Install frontend dependencies
npm --prefix frontend install
```

### Step 2: Configure Environment Variables
Copy the `.env.example` templates in both `backend/` and `frontend/`:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Step 3: Seed the Database
Populate the database with realistic sample kitchens, chef-curated menus, active surplus listings, promo codes, and demo accounts:
```bash
npm run seed
# Or directly:
npm --prefix backend run seed
```

### Step 4: Run the Application
In terminal 1 (start backend API on port 5000):
```bash
npm run dev:backend
# Or directly:
npm --prefix backend run dev
```

In terminal 2 (start frontend Vite dev server on port 5173):
```bash
npm run dev:frontend
# Or directly:
npm --prefix frontend run dev
```

Open your browser at:
`http://localhost:5173`

---

## Pre-Seeded Test Accounts

All accounts share the password: **`Password123!`**

| Role | Email | Password | Access Details |
|---|---|---|---|
| **Customer** | `alex@savor.local` | `Password123!` | Customer order history, favorites, saved addresses, group orders |
| **Restaurant Partner** | `owner@savor.local` | `Password123!` | Bella Vista Trattoria kitchen dashboard, orders queue, menu manager |
| **Platform Admin** | `admin@savor.local` | `Password123!` | System-wide statistics, restaurant approvals, coupons & categories |

*Tip: The login modal contains 1-click test login pills for immediate access without typing.*

---

## Automated Verification & Testing

Savor includes an automated end-to-end integration test suite verifying health endpoints, discovery, customer checkout, atomic inventory updates, smart group ordering, restaurant kitchen status updates, and administrative controls.

Run the test suite anytime:
```bash
npm test
# Or directly:
npm --prefix backend test
```

Expected result:
```
========================================
🧪 SAVOR PLATFORM END-TO-END TEST SUITE
========================================
1. Health Check               ✓ (2/2)
2. Public Catalog & Discovery ✓ (5/5)
3. Authentication & Roles     ✓ (6/6)
4. Cart & Checkout Flow       ✓ (13/13)
5. Food Rescue Surplus        ✓ (3/3)
6. Smart Group Ordering       ✓ (8/8)
7. Restaurant Portal          ✓ (3/3)
8. Admin Dashboard Controls   ✓ (4/4)
========================================
✅ ALL TEST SUITE ASSERTIONS PASSED (100%)
========================================
```

---

## Production Deployment Guide

1. **Frontend Production Build**:
   ```bash
   npm --prefix frontend run build
   ```
   Static output is generated in `frontend/dist/`. Serve with Nginx, Vercel, or Netlify.

2. **Backend Production Start**:
   ```bash
   npm --prefix backend start
   ```
   Deploy to Render, Railway, AWS ECS, or DigitalOcean App Platform with `MONGODB_URI` and a secure `JWT_SECRET`.
