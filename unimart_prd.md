# UniMart — Product Requirements Document

## Overview

UniMart is an AI-powered college marketplace where students can buy and sell items within their campus community. Backend is built first; frontend follows after API verification.

## User Roles

- **student** (default): Register, list products, buy, wishlist, chat
- **admin**: Moderate products, view all users/products, change product status

## Product Categories

- Electronics
- Books
- Furniture
- Clothing
- Sports
- Accessories
- Other

## Product Conditions

- New
- Like New
- Good
- Fair

## Product Status

- `available` — listed and visible
- `sold` — marked sold by seller
- `removed` — soft-deleted or removed by admin

## Business Rules

1. Only authenticated users can create products, wishlist items, and chat
2. Users can only edit/delete their own products (admins can moderate any product)
3. Wishlist entries are unique per user + product
4. Chat threads are unique per buyer + seller + product combination
5. AI generation requires authentication and is rate-limited
6. Profile images: max 1; product images: max 5 per listing
7. JWT logout is client-side (token discard); server returns success for API symmetry

## Admin Rules

- Admins can list all users and products
- Admins can change any product status (`available`, `sold`, `removed`)
- First admin must be seeded manually in the database or via env `ADMIN_EMAIL`

## Search & Filters (GET /api/products)

Query params: `q`, `category`, `minPrice`, `maxPrice`, `condition`, `status`, `page`, `limit`

## External Services

- MongoDB Atlas — primary database
- Cloudinary — image storage
- Google Gemini — AI description, price suggestion, category
