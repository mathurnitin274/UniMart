# UniMart Backend API

Node.js + Express + MongoDB backend for the UniMart college marketplace.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, and optional Cloudinary/Gemini keys
npm run dev
```

Server runs at `http://localhost:5000`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `CLOUDINARY_*` | For uploads | Cloudinary credentials |
| `GEMINI_API_KEY` | For AI | Google Gemini API key |
| `CLIENT_URL` | No | Frontend origin for CORS |
| `ADMIN_EMAIL` | No | Email auto-assigned admin role on register |

## API Endpoints

### Health
- `GET /api/health`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile` (auth)
- `PUT /api/auth/profile` (auth, optional `profileImage` file)
- `POST /api/auth/logout` (auth — client clears token)

### Products
- `GET /api/products?q&category&minPrice&maxPrice&condition&status&page&limit`
- `GET /api/products/:id`
- `POST /api/products` (auth, optional `images` files)
- `PUT /api/products/:id` (auth, owner or admin)
- `DELETE /api/products/:id` (auth, soft delete)

### Wishlist
- `POST /api/wishlist/:productId` (auth)
- `GET /api/wishlist` (auth)
- `DELETE /api/wishlist/:productId` (auth)

### Chat
- `POST /api/chat` — body: `{ productId, sellerId }`
- `GET /api/chat` (auth)
- `POST /api/chat/message` — body: `{ chatId, message }`
- `GET /api/chat/:chatId/messages?page&limit&before`

### AI
- `POST /api/ai/generate` (auth, rate-limited)

```json
{
  "title": "Dell Laptop",
  "condition": "Good",
  "usage": "2 Years",
  "specifications": "8GB RAM, 512GB SSD"
}
```

### Admin (admin role only)
- `GET /api/admin/users`
- `GET /api/admin/products`
- `PATCH /api/admin/products/:id/status` — body: `{ status }`

## Example: Register & Login

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex","email":"alex@college.edu","password":"pass123","college":"ABC College","department":"CS","year":"2nd"}'
```

## Tests

```bash
npm test
```

Uses in-memory MongoDB — no Atlas connection required for tests.
