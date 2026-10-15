# ShopFlow — Production-Grade E-Commerce System

A phased roadmap to build a **single project** that evolves from a basic monolith into a full production-style distributed system, teaching every backend & system-design concept along the way — with a modern React frontend so the journey stays fun.

---

## Tech Stack Decision

| Layer | Choice | Why |
|---|---|---|
| **Backend** | **Node.js + Express + TypeScript** | Lightweight, flexible, massive ecosystem. You wire everything yourself — great for learning how things actually work |
| **ORM** | **Prisma** | Type-safe database client, auto-generated types, excellent migrations, works beautifully with TypeScript |
| **Validation** | **Zod** | Runtime schema validation with TypeScript type inference — validate request bodies, env vars, everything |
| **Frontend** | **React 18 (Vite) + TypeScript + Tailwind CSS** | Fast dev server, no SSR complexity, pure client-side SPA — keeps focus on backend learning while having a beautiful UI |
| **Primary DB** | PostgreSQL 16 | Battle-tested relational DB with excellent indexing, JSONB, full-text search |
| **Cache** | Redis 7 | Caching, rate limiting, distributed locks, session store |
| **Message Broker** | Apache Kafka | Event-driven architecture, decoupling services |
| **Search** | OpenSearch / Elasticsearch | Full-text product search |
| **Object Storage** | MinIO (S3-compatible, self-hosted) | Product images, seller uploads |
| **Containerization** | Docker + Docker Compose | Local dev environment |
| **Orchestration** | Kubernetes (Minikube / Kind for local) | Production orchestration |
| **CI/CD** | GitHub Actions | Automated test → build → deploy pipeline |
| **Monitoring** | Prometheus + Grafana + Jaeger | Metrics, dashboards, distributed tracing |
| **API Gateway** | Express-based custom gateway (later Kong/Traefik) | Routing, auth, rate limiting |
| **Load Balancer** | Nginx | Reverse proxy, load distribution |

> [!IMPORTANT]
> We will **not** use all of these on Day 1. Each technology is introduced only when the system hits a problem that the technology solves. That's the core philosophy.

---

## Phase Overview

```mermaid
gantt
    title ShopFlow Build Phases
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Foundation
    Phase 1 - Monolith Backend         :p1, 2026-08-26, 14d
    Phase 2 - Production Monolith      :p2, after p1, 7d
    Phase 3 - Frontend (React)         :p3, after p2, 10d

    section Performance
    Phase 4 - Redis Caching            :p4, after p3, 5d
    Phase 5 - Docker                   :p5, after p4, 3d
    Phase 6 - Load Balancing           :p6, after p5, 4d

    section Distribution
    Phase 7 - Microservices Split      :p7, after p6, 10d
    Phase 8 - Kafka Events             :p8, after p7, 7d
    Phase 9 - Distributed Problems     :p9, after p8, 7d

    section Production
    Phase 10 - Kubernetes              :p10, after p9, 7d
    Phase 11 - CI/CD                   :p11, after p10, 4d
    Phase 12 - Monitoring              :p12, after p11, 5d

    section Advanced
    Phase 13 - API Gateway             :p13, after p12, 4d
    Phase 14 - Search (OpenSearch)     :p14, after p13, 5d
    Phase 15 - Object Storage          :p15, after p14, 3d
    Phase 16 - Rate Limiting           :p16, after p15, 3d
```

> [!NOTE]
> Timeline is approximate. Some phases can overlap or take longer depending on learning pace. The key is **understanding, not rushing**.

---

## Phase 1 — The Monolith Backend (Express + TypeScript)

**Goal:** Build a working, clean, well-structured REST API monolith.

### Architecture

```
Client (Postman / Frontend later)
         │
         ▼
   Express.js App
         │
         ▼
     PostgreSQL
```

### Project Structure

```
shopflow-backend/
├── src/
│   ├── index.ts                        # Entry point — starts Express server
│   ├── app.ts                          # Express app setup (middleware, routes)
│   ├── config/
│   │   ├── env.ts                      # Zod-validated environment variables
│   │   ├── database.ts                 # Prisma client singleton
│   │   └── cors.ts                     # CORS configuration
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts      # POST /register, /login, /refresh
│   │   │   ├── auth.service.ts         # Business logic
│   │   │   ├── auth.schema.ts          # Zod schemas for request validation
│   │   │   └── auth.routes.ts          # Router
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.schema.ts
│   │   │   └── user.routes.ts
│   │   ├── product/
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   ├── product.schema.ts
│   │   │   └── product.routes.ts
│   │   ├── category/
│   │   │   ├── category.controller.ts
│   │   │   ├── category.service.ts
│   │   │   └── category.routes.ts
│   │   ├── cart/
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── cart.schema.ts
│   │   │   └── cart.routes.ts
│   │   ├── order/
│   │   │   ├── order.controller.ts
│   │   │   ├── order.service.ts
│   │   │   ├── order.schema.ts
│   │   │   └── order.routes.ts
│   │   ├── payment/
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── payment.schema.ts
│   │   │   └── payment.routes.ts
│   │   └── inventory/
│   │       ├── inventory.service.ts
│   │       └── inventory.routes.ts
│   ├── middleware/
│   │   ├── errorHandler.ts             # Global error handler
│   │   ├── validate.ts                 # Zod validation middleware
│   │   ├── authenticate.ts             # JWT verification middleware
│   │   ├── authorize.ts                # Role-based access (RBAC)
│   │   └── requestLogger.ts           # Morgan + custom logging
│   ├── utils/
│   │   ├── ApiError.ts                 # Custom error class with status codes
│   │   ├── ApiResponse.ts             # Standardized response wrapper
│   │   ├── asyncHandler.ts            # try/catch wrapper for async routes
│   │   ├── jwt.ts                      # Token generation & verification
│   │   └── pagination.ts             # Pagination helper
│   └── types/
│       ├── express.d.ts               # Extend Express Request with user
│       └── index.ts                   # Shared types & interfaces
├── prisma/
│   ├── schema.prisma                  # Database schema
│   ├── migrations/                    # Auto-generated migrations
│   └── seed.ts                        # Seed data (categories, test products)
├── tests/
│   ├── unit/
│   │   ├── auth.service.test.ts
│   │   ├── product.service.test.ts
│   │   └── order.service.test.ts
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── product.test.ts
│   │   └── order.test.ts
│   └── setup.ts                       # Test DB setup (Testcontainers)
├── .env
├── .env.example
├── tsconfig.json
├── package.json
├── nodemon.json
├── .eslintrc.json
├── .prettierrc
└── README.md
```

### Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  SELLER
  ADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

enum PaymentMethod {
  CARD
  UPI
  WALLET
  COD
}

model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  firstName     String    @map("first_name")
  lastName      String    @map("last_name")
  phone         String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  addresses     Address[]
  cart          Cart?
  orders        Order[]
  products      Product[]  // products listed by sellers

  @@map("users")
}

model Address {
  id          Int     @id @default(autoincrement())
  userId      Int     @map("user_id")
  street      String
  city        String
  state       String
  zipCode     String  @map("zip_code")
  country     String  @default("India")
  isDefault   Boolean @default(false) @map("is_default")

  user        User    @relation(fields: [userId], references: [id])
  orders      Order[]

  @@map("addresses")
}

model Category {
  id          Int        @id @default(autoincrement())
  name        String     @unique
  slug        String     @unique
  parentId    Int?       @map("parent_id")

  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  products    Product[]

  @@map("categories")
}

model Product {
  id          Int       @id @default(autoincrement())
  sellerId    Int       @map("seller_id")
  categoryId  Int       @map("category_id")
  name        String
  description String?
  price       Decimal   @db.Decimal(10, 2)
  sku         String    @unique
  imageUrl    String?   @map("image_url")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  seller      User      @relation(fields: [sellerId], references: [id])
  category    Category  @relation(fields: [categoryId], references: [id])
  inventory   Inventory?
  cartItems   CartItem[]
  orderItems  OrderItem[]

  @@index([categoryId])
  @@index([sellerId])
  @@index([isActive, categoryId])
  @@map("products")
}

model Inventory {
  id               Int      @id @default(autoincrement())
  productId        Int      @unique @map("product_id")
  quantity         Int      @default(0)
  reservedQuantity Int      @default(0) @map("reserved_quantity")
  updatedAt        DateTime @updatedAt @map("updated_at")

  product          Product  @relation(fields: [productId], references: [id])

  @@map("inventory")
}

model Cart {
  id        Int        @id @default(autoincrement())
  userId    Int        @unique @map("user_id")
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  user      User       @relation(fields: [userId], references: [id])
  items     CartItem[]

  @@map("carts")
}

model CartItem {
  id        Int     @id @default(autoincrement())
  cartId    Int     @map("cart_id")
  productId Int     @map("product_id")
  quantity  Int     @default(1)

  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])

  @@unique([cartId, productId])
  @@map("cart_items")
}

model Order {
  id                Int         @id @default(autoincrement())
  orderNumber       String      @unique @map("order_number")
  userId            Int         @map("user_id")
  shippingAddressId Int         @map("shipping_address_id")
  totalAmount       Decimal     @db.Decimal(10, 2) @map("total_amount")
  status            OrderStatus @default(PENDING)
  createdAt         DateTime    @default(now()) @map("created_at")
  updatedAt         DateTime    @updatedAt @map("updated_at")

  user              User        @relation(fields: [userId], references: [id])
  shippingAddress   Address     @relation(fields: [shippingAddressId], references: [id])
  items             OrderItem[]
  payment           Payment?

  @@index([userId, status])
  @@map("orders")
}

model OrderItem {
  id              Int     @id @default(autoincrement())
  orderId         Int     @map("order_id")
  productId       Int     @map("product_id")
  quantity        Int
  priceAtPurchase Decimal @db.Decimal(10, 2) @map("price_at_purchase")

  order           Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product         Product @relation(fields: [productId], references: [id])

  @@map("order_items")
}

model Payment {
  id            Int           @id @default(autoincrement())
  orderId       Int           @unique @map("order_id")
  transactionId String        @unique @map("transaction_id")
  amount        Decimal       @db.Decimal(10, 2)
  status        PaymentStatus @default(PENDING)
  method        PaymentMethod
  createdAt     DateTime      @default(now()) @map("created_at")

  order         Order         @relation(fields: [orderId], references: [id])

  @@map("payments")
}
```

### ER Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        varchar phone
        enum role "USER, ADMIN, SELLER"
        timestamp created_at
        timestamp updated_at
    }

    ADDRESSES {
        int id PK
        int user_id FK
        varchar street
        varchar city
        varchar state
        varchar zip_code
        varchar country
        boolean is_default
    }

    CATEGORIES {
        int id PK
        varchar name UK
        varchar slug UK
        int parent_id FK "self-ref"
    }

    PRODUCTS {
        int id PK
        int seller_id FK
        int category_id FK
        varchar name
        text description
        decimal price
        varchar sku UK
        varchar image_url
        boolean is_active
        timestamp created_at
    }

    INVENTORY {
        int id PK
        int product_id FK UK
        int quantity
        int reserved_quantity
        timestamp updated_at
    }

    CARTS {
        int id PK
        int user_id FK UK
        timestamp created_at
        timestamp updated_at
    }

    CART_ITEMS {
        int id PK
        int cart_id FK
        int product_id FK
        int quantity
    }

    ORDERS {
        int id PK
        varchar order_number UK
        int user_id FK
        int shipping_address_id FK
        decimal total_amount
        enum status "PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED"
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price_at_purchase
    }

    PAYMENTS {
        int id PK
        int order_id FK UK
        varchar transaction_id UK
        decimal amount
        enum status "PENDING, SUCCESS, FAILED, REFUNDED"
        enum method "CARD, UPI, WALLET, COD"
        timestamp created_at
    }

    USERS ||--o{ ADDRESSES : has
    USERS ||--o| CARTS : has
    USERS ||--o{ ORDERS : places
    USERS ||--o{ PRODUCTS : "sells (SELLER)"
    CATEGORIES ||--o{ PRODUCTS : contains
    CATEGORIES ||--o{ CATEGORIES : "parent"
    PRODUCTS ||--|| INVENTORY : tracks
    CARTS ||--o{ CART_ITEMS : contains
    CART_ITEMS }o--|| PRODUCTS : references
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDER_ITEMS }o--|| PRODUCTS : references
    ORDERS ||--|| PAYMENTS : "paid via"
    ORDERS }o--|| ADDRESSES : "shipped to"
```

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | Public | Register a new user |
| `POST` | `/api/v1/auth/login` | Public | Login, get JWT |
| `POST` | `/api/v1/auth/refresh` | Public | Refresh access token |
| `GET` | `/api/v1/users/me` | User | Get current user profile |
| `PUT` | `/api/v1/users/me` | User | Update profile |
| `POST` | `/api/v1/users/me/addresses` | User | Add address |
| `GET` | `/api/v1/products` | Public | List products (paginated, filterable) |
| `GET` | `/api/v1/products/:id` | Public | Get product details |
| `POST` | `/api/v1/products` | Seller | Create product |
| `PUT` | `/api/v1/products/:id` | Seller | Update product |
| `DELETE` | `/api/v1/products/:id` | Seller/Admin | Delete product |
| `GET` | `/api/v1/categories` | Public | List categories (tree) |
| `GET` | `/api/v1/cart` | User | Get user's cart |
| `POST` | `/api/v1/cart/items` | User | Add item to cart |
| `PUT` | `/api/v1/cart/items/:id` | User | Update cart item quantity |
| `DELETE` | `/api/v1/cart/items/:id` | User | Remove item from cart |
| `DELETE` | `/api/v1/cart` | User | Clear cart |
| `POST` | `/api/v1/orders` | User | Place order (from cart) |
| `GET` | `/api/v1/orders` | User | List user's orders |
| `GET` | `/api/v1/orders/:id` | User | Get order details |
| `PUT` | `/api/v1/orders/:id/cancel` | User | Cancel order |
| `POST` | `/api/v1/payments` | User | Process payment for order |
| `GET` | `/api/v1/admin/users` | Admin | List all users |
| `GET` | `/api/v1/admin/orders` | Admin | List all orders |
| `PUT` | `/api/v1/admin/orders/:id/status` | Admin | Update order status |

### Key Dependencies

```json
{
  "dependencies": {
    "express": "^4.18",
    "@prisma/client": "^5",
    "zod": "^3",
    "jsonwebtoken": "^9",
    "bcryptjs": "^2",
    "cors": "^2",
    "helmet": "^7",
    "morgan": "^1",
    "winston": "^3",
    "dotenv": "^16",
    "uuid": "^9"
  },
  "devDependencies": {
    "typescript": "^5",
    "prisma": "^5",
    "tsx": "^4",
    "nodemon": "^3",
    "@types/express": "^4",
    "@types/jsonwebtoken": "^9",
    "@types/bcryptjs": "^2",
    "@types/cors": "^2",
    "@types/morgan": "^1",
    "vitest": "^1",
    "supertest": "^6",
    "@types/supertest": "^6",
    "eslint": "^8",
    "@typescript-eslint/eslint-plugin": "^7",
    "prettier": "^3"
  }
}
```

### Concepts You'll Learn
- HTTP, REST, JSON, status codes
- Request/response lifecycle in Express
- Middleware pattern (the core of Express)
- TypeScript: interfaces, generics, type guards, declaration merging
- Prisma ORM: schema, migrations, type-safe queries, relations
- Zod: runtime validation with compile-time type inference
- SQL: schema design, joins, transactions, indexes
- Connection pooling (Prisma connection management)
- Pagination (cursor-based & offset-based)
- Input validation (Zod middleware)
- Global error handling (Express error middleware)
- Structured logging (Winston + Morgan)
- Unit & integration testing (Vitest, Supertest)

---

## Phase 2 — Make the Monolith Production-Grade

**Goal:** Harden security, optimize DB, add proper auth.

### What We Add

| Feature | Implementation |
|---------|---------------|
| JWT Auth | Access token (15 min) + Refresh token (7 days) stored in DB |
| Password hashing | bcryptjs (salt rounds = 12) |
| RBAC | `USER`, `SELLER`, `ADMIN` roles via `authorize()` middleware |
| Refresh tokens | Stored in a `refresh_tokens` table, rotated on use |
| DB Indexes | On frequently queried columns (already in Prisma schema) |
| Audit fields | `created_at`, `updated_at` on all entities |
| API versioning | `/api/v1/` prefix |
| Request logging | Winston + Morgan + correlation IDs via `crypto.randomUUID()` |
| Health check | `GET /health` endpoint |
| OpenAPI docs | swagger-jsdoc + swagger-ui-express at `/api-docs` |

### Auth Flow

```
┌────────┐     POST /login        ┌──────────┐
│ Client │ ──────────────────────→ │  Server  │
│        │ ←────────────────────── │          │
│        │  { accessToken,        │          │
│        │    refreshToken }      │          │
│        │                        │          │
│        │  GET /products         │          │
│        │  Authorization: Bearer │          │
│        │  <accessToken>         │          │
│        │ ──────────────────────→│          │
│        │ ←────────────────────── │          │
│        │  { products: [...] }   │          │
│        │                        │          │
│        │  POST /auth/refresh    │          │
│        │  { refreshToken }      │          │
│        │ ──────────────────────→│          │
│        │ ←────────────────────── │          │
│        │  { newAccessToken,     │          │
│        │    newRefreshToken }   │          │
└────────┘                        └──────────┘
```

### Database Optimization Exercises

```sql
-- Before index: EXPLAIN ANALYZE shows sequential scan
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = 5;

-- Add index (already in Prisma schema via @@index)
CREATE INDEX idx_products_category_id ON products(category_id);

-- After index: shows index scan, dramatically faster

-- Composite index for common query patterns
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Partial index for active products only
CREATE INDEX idx_products_active ON products(category_id) WHERE is_active = true;
```

### Concepts You'll Learn
- JWT mechanics (header.payload.signature)
- Token refresh flow with rotation
- Express middleware chain (authenticate → authorize → controller)
- RBAC implementation
- EXPLAIN / EXPLAIN ANALYZE in PostgreSQL
- Index types (B-tree, Hash, GIN)
- N+1 query detection and fix (Prisma `include` vs `select`)
- Transaction isolation levels
- Optimistic vs pessimistic locking
- API documentation with Swagger/OpenAPI

---

## Phase 3 — Frontend (React + Vite + Tailwind)

**Goal:** Build a modern, beautiful storefront + seller dashboard + admin panel.

### Architecture

```
Browser
   │
   ▼
React SPA (Vite)
   │ (API calls via fetch/axios)
   ▼
Express API
   │
   ▼
PostgreSQL
```

### Project Structure

```
shopflow-frontend/
├── src/
│   ├── main.tsx                       # Entry point
│   ├── App.tsx                        # Router setup
│   ├── pages/
│   │   ├── Home.tsx                   # Landing page
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Products.tsx               # Product listing
│   │   ├── ProductDetail.tsx          # Single product
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── Orders.tsx                 # Order history
│   │   ├── OrderDetail.tsx
│   │   ├── SellerDashboard.tsx
│   │   ├── SellerProducts.tsx         # Manage products
│   │   ├── SellerOrders.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminUsers.tsx
│   │   └── AdminOrders.tsx
│   ├── components/
│   │   ├── ui/                        # Reusable primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   └── ProductImageGallery.tsx
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartDrawer.tsx
│   │   └── orders/
│   │       ├── OrderCard.tsx
│   │       └── OrderTimeline.tsx
│   ├── lib/
│   │   ├── api.ts                     # Axios instance with interceptors
│   │   ├── auth.ts                    # Token storage & refresh logic
│   │   └── utils.ts                   # Formatting helpers
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useProducts.ts
│   │   └── useDebounce.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── types/
│   │   └── index.ts                   # All TypeScript interfaces
│   └── styles/
│       └── index.css                  # Tailwind imports + custom CSS
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

### Key Pages

| Page | Features |
|------|----------|
| **Home** | Hero banner, featured products, categories, trending items |
| **Products** | Grid/list view, filters (category, price range), sort, pagination |
| **Product Detail** | Image gallery, description, add to cart, stock status |
| **Cart** | Item list, quantity controls, price summary, checkout CTA |
| **Checkout** | Address form, payment method, order summary, place order |
| **Orders** | Order history with status timeline |
| **Seller Dashboard** | Revenue stats, product management, order fulfillment |
| **Admin Panel** | User management, system stats, order oversight |

### Design System

- **Theme:** Dark mode primary with light mode toggle
- **Colors:** Curated palette — deep slate/navy background, electric indigo accents, warm amber CTAs
- **Typography:** Inter (body) + Space Grotesk (headings) from Google Fonts
- **Animations:** Framer Motion for page transitions, hover effects, skeleton loading
- **Routing:** React Router v6 with nested layouts
- **State:** React Context (auth, cart) + React Query / TanStack Query for server state

### Key Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "@tanstack/react-query": "^5",
    "axios": "^1",
    "framer-motion": "^11",
    "lucide-react": "^0.400",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "react-hot-toast": "^2",
    "recharts": "^2"
  }
}
```

### Concepts You'll Learn
- React 18 with TypeScript
- React Router v6 (nested routes, protected routes, layouts)
- TanStack Query for data fetching, caching, mutations
- React Context for global state (auth, cart)
- Axios interceptors for JWT token refresh
- Responsive design with Tailwind CSS
- Optimistic UI updates
- Loading states, error boundaries, skeleton screens
- Framer Motion animations

---

## Phase 4 — Redis Caching

**Goal:** Solve the "why are we hitting PostgreSQL 50,000 times for the same product?" problem.

```
Browser → React → Express → Redis (cache hit? return) → PostgreSQL (cache miss)
```

### What We Cache
| Data | Strategy | TTL |
|------|----------|-----|
| Product details | Cache-aside | 10 min |
| Product listings | Cache-aside | 5 min |
| Category tree | Cache-aside | 1 hour |
| User session data | Write-through | 30 min |

### Implementation
- `ioredis` as the Redis client for Node.js
- Custom caching middleware/service wrapping Prisma calls
- Cache invalidation on product create/update/delete
- Benchmark: before/after response times with `console.time` / k6

### Example Pattern

```typescript
// Cache-aside pattern
async getProduct(id: number): Promise<Product> {
  const cacheKey = `product:${id}`;

  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Cache miss — query DB
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new ApiError(404, 'Product not found');

  // 3. Store in cache
  await redis.set(cacheKey, JSON.stringify(product), 'EX', 600);

  return product;
}
```

### Concepts You'll Learn
- Cache-aside, write-through, write-behind patterns
- TTL, eviction policies (LRU, LFU)
- Cache invalidation strategies
- Redis data structures (String, Hash, Set, Sorted Set, List)
- Distributed locks with Redis (Redlock algorithm)
- Cache stampede prevention (singleflight pattern)

---

## Phase 5 — Docker

**Goal:** "Works on my laptop bro" → "Works everywhere."

### docker-compose.yml

```yaml
services:
  backend:
    build: ./shopflow-backend
    ports: ["8080:8080"]
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgresql://shopflow:secret@postgres:5432/shopflow
      REDIS_URL: redis://redis:6379
      JWT_SECRET: supersecretkey
      NODE_ENV: production

  frontend:
    build: ./shopflow-frontend
    ports: ["3000:3000"]
    depends_on: [backend]
    environment:
      VITE_API_URL: http://localhost:8080/api/v1

  postgres:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: shopflow
      POSTGRES_USER: shopflow
      POSTGRES_PASSWORD: secret

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:
```

### Backend Dockerfile (multi-stage)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
EXPOSE 8080
CMD ["node", "dist/index.js"]
```

### Concepts You'll Learn
- Dockerfile (multi-stage builds for smaller images)
- Images, containers, volumes, networks
- Environment variables & secrets
- Container communication (Docker DNS)
- Docker Compose orchestration
- `.dockerignore`, layer caching, build optimization

---

## Phase 6 — Load Balancing + Horizontal Scaling

**Goal:** One server isn't enough. Scale horizontally.

```
          Nginx (Load Balancer)
          /       |       \
         ▼        ▼        ▼
     Backend   Backend   Backend
       :8081     :8082     :8083
         \        |        /
          ▼       ▼       ▼
           PostgreSQL + Redis
```

### Exercises
- Run 1 → 3 → 5 backend instances via `docker compose up --scale backend=3`
- Benchmark with k6 or Apache Bench
- Compare response times and throughput
- Test sticky sessions vs stateless
- Verify JWT works across all instances (stateless auth ✅)

### Concepts You'll Learn
- Horizontal vs vertical scaling
- Nginx as reverse proxy & load balancer
- Round-robin, least connections, IP hash
- Health checks
- Stateless services (why JWT > server sessions)
- Connection pool sizing under multiple instances

---

## Phase 7 — Microservices Split

**Goal:** Split the monolith into independent services, each with its own DB.

```
                    API Gateway
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   User Service   Product Service  Order Service
     (PostgreSQL)   (PostgreSQL)    (PostgreSQL)
                                       │
                              ┌────────┼────────┐
                              ▼        ▼        ▼
                         Payment  Inventory  Notification
                         Service   Service    Service
```

### Services

| Service | Port | DB | Responsibility |
|---------|------|-----|---------------|
| User Service | 3001 | PostgreSQL | Auth, profiles, addresses |
| Product Service | 3002 | PostgreSQL + Redis | Product CRUD, categories |
| Order Service | 3003 | PostgreSQL | Order lifecycle |
| Payment Service | 3004 | PostgreSQL | Payment processing, refunds |
| Inventory Service | 3005 | PostgreSQL | Stock management, reservations |
| Notification Service | 3006 | — (stateless) | Email, SMS, push notifications |

### Monorepo Structure

```
shopflow/
├── packages/
│   ├── shared/                  # Shared types, utils, constants
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── constants/
│   │   └── package.json
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   ├── inventory-service/
│   └── notification-service/
├── shopflow-frontend/
├── docker-compose.yml
├── package.json                 # Workspace root
└── turbo.json                   # Turborepo config
```

### Concepts You'll Learn
- Service boundaries (bounded contexts from DDD)
- Database-per-service pattern
- Inter-service communication (REST via axios, gRPC later)
- Service discovery
- Distributed transactions (Saga pattern)
- API composition
- Monorepo management (npm workspaces + Turborepo)
- Independent deployment

---

## Phase 8 — Kafka (Event-Driven Architecture)

**Goal:** Decouple services. When an order is created, don't call 4 services synchronously.

```
Order Service → publishes "OrderCreated" → Kafka
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                        Inventory        Payment         Notification
                        (reserve stock)  (charge)        (send email)
```

### Events

| Event | Producer | Consumers |
|-------|----------|-----------|
| `UserRegistered` | User Service | Notification (welcome email) |
| `OrderCreated` | Order Service | Inventory, Payment, Notification |
| `PaymentCompleted` | Payment Service | Order (confirm), Notification |
| `PaymentFailed` | Payment Service | Order (cancel), Inventory (release), Notification |
| `InventoryReserved` | Inventory Service | Order (update status) |
| `OrderShipped` | Order Service | Notification |
| `OrderCancelled` | Order Service | Inventory (release), Payment (refund) |

### Implementation
- `kafkajs` — native Node.js Kafka client
- Each service has a `producer.ts` and `consumer.ts`
- Event schemas validated with Zod
- Consumer groups per service

### Concepts You'll Learn
- Producers, consumers, topics, partitions
- Consumer groups, offsets, rebalancing
- At-least-once vs exactly-once delivery
- Dead letter queues
- Event schemas & versioning
- Saga pattern (choreography vs orchestration)
- Idempotent consumers

---

## Phase 9 — Distributed Systems Problems

**Goal:** Intentionally break things. Learn to handle real failures.

| Problem | Solution |
|---------|----------|
| Payment service crashes mid-order | Saga with compensating transactions |
| Kafka message processed twice | Idempotency keys (store processed event IDs) |
| Inventory service slow (5s response) | Timeouts, retries, circuit breaker (cockatiel / opossum) |
| Service completely down | Dead letter queue, fallback responses |
| Two users buy the last item | Optimistic locking + `SELECT FOR UPDATE` via Prisma `$executeRaw` |
| DB goes down | Graceful degradation, health checks, retry |
| Network partition | Eventual consistency, reconciliation jobs |

### Concepts You'll Learn
- Circuit breaker, bulkhead, timeout patterns
- Idempotency
- Eventual consistency
- Distributed locking (Redis-based)
- Race conditions & concurrency control
- Compensating transactions
- Graceful degradation

---

## Phase 10 — Kubernetes

**Goal:** Move from Docker Compose to a real orchestration platform.

```
                    Kubernetes Cluster
         ┌─────────────────────────────────┐
         │                                 │
    User Service              Order Service
     ┌──┼──┐                   ┌──┼──┐
     ▼  ▼  ▼                   ▼  ▼  ▼
   Pod Pod Pod               Pod Pod Pod
         │                         │
         └──────────┬──────────────┘
                    │
              Kafka (StatefulSet)
```

### K8s Resources per Service
- Deployment + ReplicaSet
- Service (ClusterIP)
- ConfigMap + Secret
- HorizontalPodAutoscaler
- Ingress (for external access)
- Health probes (liveness + readiness)

### Concepts You'll Learn
- Pods, Deployments, Services, Ingress
- ConfigMaps & Secrets
- Namespaces
- ReplicaSets, HPA
- Liveness & readiness probes
- Rolling updates & rollbacks
- Helm charts (optional)

---

## Phase 11 — CI/CD (GitHub Actions)

**Goal:** `git push` → automatic test, build, deploy.

```
git push → GitHub Actions
              │
              ├── Run unit tests (vitest)
              ├── Run integration tests
              ├── Build TypeScript
              ├── Build Docker images
              ├── Push to container registry
              └── Deploy to Kubernetes
```

### Concepts You'll Learn
- CI vs CD
- GitHub Actions workflows & jobs
- Docker registry (GitHub Container Registry)
- Environment variables & secrets management
- Deployment strategies (rolling, blue-green, canary)
- Rollback procedures

---

## Phase 12 — Monitoring & Observability

**Goal:** Know what's happening inside your system at all times.

### Three Pillars

| Pillar | Tool | Purpose |
|--------|------|---------|
| **Metrics** | Prometheus + Grafana | Request rate, latency, error rate, CPU, memory |
| **Logging** | Loki + Grafana | Centralized, searchable logs |
| **Tracing** | Jaeger + OpenTelemetry | Trace a request across all microservices |

### Implementation
- `prom-client` — Prometheus metrics for Node.js
- `@opentelemetry/sdk-node` — auto-instrumentation for Express, Prisma, ioredis
- Winston logs shipped to Loki

### Key Dashboards
- API request rate (req/sec per service)
- P50, P95, P99 latency
- Error rate by endpoint
- Kafka consumer lag
- Node.js event loop lag, heap usage
- Database connection pool utilization

### Concepts You'll Learn
- RED metrics (Rate, Errors, Duration)
- USE metrics (Utilization, Saturation, Errors)
- Correlation IDs / trace IDs
- Alerting rules
- SLIs, SLOs, SLAs
- Distributed tracing with OpenTelemetry

---

## Phase 13 — API Gateway

**Goal:** Single entry point for all services.

```
Internet → API Gateway → Route to correct service
```

### Gateway Responsibilities
- Authentication (verify JWT)
- Rate limiting
- Request routing (`/api/v1/users/**` → User Service)
- Request/response logging
- API versioning
- CORS handling

### Implementation Options
1. **Custom Express gateway** (build it yourself first to understand)
2. **Kong** or **Traefik** (production-ready, once you understand the patterns)

---

## Phase 14 — Search (OpenSearch)

**Goal:** Real product search, not `LIKE '%keyword%'`.

```
Product Service → Index to OpenSearch
User searches → OpenSearch → Ranked results
```

### Features
- Full-text search: "iphone 15 blue 256gb"
- Autocomplete / suggestions
- Faceted search (filter by price range, category, brand)
- Relevance ranking

### Implementation
- `@opensearch-project/opensearch` — Node.js client
- Sync products to OpenSearch on create/update (via Kafka events)

---

## Phase 15 — Object Storage (MinIO)

**Goal:** Product images stored properly, not in PostgreSQL.

```
Seller uploads image → Backend → MinIO (S3-compatible)
Frontend loads image → MinIO presigned URL
```

### Implementation
- `@aws-sdk/client-s3` — works with MinIO (S3-compatible API)
- Presigned URLs for direct uploads from frontend
- Image processing with `sharp` (resize, compress)

---

## Phase 16 — Rate Limiting

**Goal:** Protect APIs from abuse.

| Endpoint | Limit |
|----------|-------|
| `POST /auth/login` | 10 req/min/IP |
| `POST /auth/register` | 5 req/min/IP |
| `GET /products` | 100 req/min/user |
| `POST /orders` | 20 req/min/user |

### Algorithms to Implement
- Token bucket
- Sliding window (Redis-based via `ioredis`)

### Implementation
- `express-rate-limit` for simple in-memory limiting
- Custom Redis-based sliding window for distributed rate limiting

---

## Verification Plan

### Per-Phase Verification
- **Unit tests** for all service layers (Vitest)
- **Integration tests** with Testcontainers (real PostgreSQL, Redis, Kafka)
- **API tests** via Supertest / Postman
- **Load tests** via k6 or Apache Bench (phases 6+)
- **Frontend E2E** via Playwright (phase 3+)
- **Type checking** via `tsc --noEmit` on every change

### Manual Verification
- Test all CRUD operations via Swagger UI / Postman
- Test frontend flows: register → browse → add to cart → checkout → view orders
- Verify cache hits/misses in Redis via `MONITOR`
- Verify Kafka message flow with consumer lag monitoring
- Verify Kubernetes pod scaling with `kubectl get pods -w`
- Verify CI/CD pipeline runs on push
- Verify Grafana dashboards show live metrics

---

## Final Architecture

When all 16 phases are complete, you'll have:

```mermaid
graph TB
    Client["Browser (React SPA)"] --> CDN
    CDN --> LB[Nginx Load Balancer]
    LB --> GW[API Gateway]

    GW --> US[User Service]
    GW --> PS[Product Service]
    GW --> OS[Order Service]

    US --> USDB[(User DB)]
    PS --> PSDB[(Product DB)]
    PS --> Redis[(Redis Cache)]
    PS --> Search[(OpenSearch)]
    OS --> OSDB[(Order DB)]

    OS --> Kafka{Kafka}

    Kafka --> PAY[Payment Service]
    Kafka --> INV[Inventory Service]
    Kafka --> NOTIF[Notification Service]

    PAY --> PAYDB[(Payment DB)]
    INV --> INVDB[(Inventory DB)]

    PS --> MinIO[(MinIO / S3)]

    Prometheus[Prometheus] --> Grafana[Grafana]
    US & PS & OS & PAY & INV & NOTIF --> Prometheus
    US & PS & OS & PAY & INV & NOTIF --> Jaeger[Jaeger Tracing]

    GH[GitHub] --> CICD[GitHub Actions CI/CD]
    CICD --> K8s[Kubernetes Cluster]
```

And you can walk into any system design interview and say:

> "I built this. Here's why every component exists."

🔥
