# Full-Stack Project Blueprint

# AI Powered College Marketplace

## Tech Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### AI
- Google Gemini API

### Authentication
- JWT
- bcrypt

### Image Storage
- Cloudinary

---

## Repository Structure

```text
CampusKart/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── marketplace.html
│   ├── sell-product.html
│   ├── product-details.html
│   ├── profile.html
│   ├── wishlist.html
│   ├── chat.html
│   ├── css/
│   ├── js/
│   └── assets/
└── backend/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    ├── utils/
    ├── uploads/
    ├── server.js
    └── package.json
```

---

## Core Features

- Student Registration & Login
- JWT Authentication
- Product CRUD
- Buy & Sell Marketplace
- Search & Filters
- Wishlist
- Buyer–Seller Chat
- AI Description Generator
- AI Price Suggestion
- Cloudinary Image Upload
- Responsive Design
- Admin Dashboard

---

## Database Collections

### User
- name
- email
- password
- college
- department
- year
- phone
- profileImage
- role

### Product
- title
- description
- category
- price
- condition
- specifications
- images
- sellerId
- status

### Wishlist
- userId
- productId

### Chat
- buyerId
- sellerId

### Message
- chatId
- senderId
- message
- createdAt

---

## REST APIs

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile
- PUT /api/auth/profile
- POST /api/auth/logout

### Products
- GET /api/products
- GET /api/products/:id
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id

### Wishlist
- POST /api/wishlist/:id
- GET /api/wishlist
- DELETE /api/wishlist/:id

### Chat
- POST /api/chat
- GET /api/chat
- POST /api/chat/message

### AI
POST /api/ai/generate

Example Request

```json
{
  "title":"Dell Laptop",
  "condition":"Good",
  "usage":"2 Years",
  "specifications":"8GB RAM, 512GB SSD"
}
```

Example Response

```json
{
  "description":"AI generated product description...",
  "priceRange":"₹20,000 - ₹23,000",
  "category":"Electronics"
}
```

---

## Development Roadmap

1. UI (HTML/CSS/JS)
2. Authentication
3. MongoDB Integration
4. Product CRUD
5. Cloudinary Upload
6. Gemini AI Integration
7. Chat & Wishlist
8. Admin Dashboard
9. Testing
10. Deployment
