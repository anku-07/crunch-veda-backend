# Crunch Veda - Backend Project Overview

Welcome to the **Crunch Veda** backend documentation. This document outlines what features are completed, how they work, the roadmap for future development, and the overall vision for the platform.

---

## 🛠️ What is Done & Working

The backend is fully operational with a modular **Model-Controller-Route** architecture using Express, MongoDB, and Mongoose. 

### 1. Authentication & User Management
* **Customer Sign-Up & Sign-In**: Secure password hashing with `bcryptjs` and session tokens generated via `jsonwebtoken` (JWT).
* **Admin Login**: Explicit access control for admin-level users, separating them from the general customer flow.
* **Route Protection**: JWT verify middleware (`protect`) and role verification middleware (`adminOnly`) to lock down privileged endpoints.
* **Profile Management**: Endpoint to view and update logged-in profiles securely.

### 2. Product Management (CRUD & Filters)
* **Creation, Updates, and Deletion**: Restricted to validated administrators.
* **Dynamic Queries**: Search products by name (case-insensitive regular expressions) and filter products by category.
* **Product Category API**: A dynamic `GET /api/products/categories` endpoint returning unique product categories directly from the database.

### 3. CMS System (Content Management System)
* **General Settings**: Stores hero banner text, about us information, contact info, and company policies.
* **Homepage CMS**:
  * **Home Banner Section**: Updates and retrieves images, videos, titles, subtitles, and descriptions.
  * **Category Section**: Allows admin to update the Category Section Title, while the category list itself is dynamically rendered from the product collection.
  * **Best Seller Products**: Admin can select featured products by passing product ObjectIDs. The GET API populates full product details using Mongoose's `.populate()`.
  * **Validation**: Powered by `Zod` to ensure incoming data conforms to exact format expectations before saving to Mongo.

---

## 🚀 API Endpoint Reference

### Authentication (`/api/auth`)
* `POST /register` — Register a customer.
* `POST /login` — Customer login.
* `POST /admin-login` — Administrator login.
* `GET /profile` — View current user details (Header: `Authorization: Bearer <token>`).
* `PUT /profile` — Edit profile / change password (Header: `Authorization: Bearer <token>`).

### Products (`/api/products`)
* `GET /` — Browse products (Optional filters: `?category=Almonds`, `?search=Walnut`).
* `GET /categories` — View list of active product categories.
* `GET /:id` — Details of a single product.
* `POST /` — Create a product (Admin Only).
* `PUT /:id` — Edit a product (Admin Only).
* `DELETE /:id` — Remove a product (Admin Only).

### CMS & Homepage Content (`/api/cms`)
* `GET /home-page` — Public endpoint delivering the structured home page layout:
  ```json
  {
    "homeBanner": { "bannerImage": "", "bannerVideo": "", "bannerSubTitle": "", "bannerTitle": "", "bannerDescription": "" },
    "categorySection": { "categoryTitle": "", "categoryList": [] },
    "bestSellerProducts": []
  }
  ```
* `PUT /home-banner` — Update home banner fields (Admin Only).
* `PUT /category-section` — Update category section title (Admin Only).
* `PUT /best-seller` — Update featured best seller products list (Admin Only).

---

## 🔮 Future Roadmap (What is to Do)

To transition from a CMS and product catalog into a full-scale e-commerce solution, the following admin and user features are planned:

### 1. Enhanced Admin Product Controls
* **Bulk Product Operations**: Bulk upload products via CSV/Excel or edit multiple prices/stocks in a single request.
* **Stock & Inventory Alerts**: Automated notifications (winston logger / email warnings) when a product falls below low stock thresholds.
* **Soft Deletes**: Keep record histories for analytics rather than hard-deleting products from the database.

### 2. E-Commerce Core Systems
* **Shopping Cart & Checkout**: Endpoints to add items to cart, validate stock availability, and compute cart totals.
* **Order Management**: Create orders, manage order states (`pending`, `shipped`, `delivered`), and attach tracking numbers.
* **Payment Gateway Integration**: Secure integrations with Stripe, Razorpay, or PayPal to handle transactions.

### 3. User Engagement & Reviews
* **Product Reviews & Ratings**: Customers can write verified reviews and leave 1-to-5 star ratings on products they bought.
* **User Wishlists**: Allow users to save their favorite snacks for later purchase.

---

## 🌟 The Vision for Crunch Veda

Our vision for Crunch Veda is to build the ultimate **wellness-focused snack and dry fruit marketplace**. We aim to create a fast, premium web experience powered by:

1. **Scalability & Resiliency**: Microservice readiness and optimized database indexes to support thousands of active users ordering simultaneously.
2. **Personalization Engine**: A recommendation system suggesting products based on a customer's browsing history, dietary choices, or purchase trends.
3. **Omnichannel CMS**: Content management API designed to seamlessly feed content not only to a web storefront, but also to mobile apps and retail POS systems.
4. **Data-Driven Admin Dashboard**: Insightful visual analytics highlighting top-selling items, customer retention, revenue growth, and seasonal inventory needs.
