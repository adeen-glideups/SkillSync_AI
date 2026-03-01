# Node Modular Monolith

A modular monolith backend architecture built with Node.js, Express, Prisma, and MySQL. This project demonstrates how to structure a monolithic application with clear module boundaries, making it easy to maintain and potentially migrate to microservices in the future.

## Architecture Overview

```
src/
├── app.js                 # Application entry point
├── config/                # Global configuration
│   ├── index.js           # Environment variables & app config
│   └── database.js        # Database connection
├── shared/                # Shared utilities across modules
│   ├── middleware/        # Global middleware (error handling, validation)
│   └── utils/             # Helper functions (async handler, response formatter)
└── modules/               # Feature modules (self-contained)
    ├── auth/              # Authentication module
    │   ├── index.js       # Module public API
    │   ├── routes/        # Route definitions
    │   ├── controllers/   # Request handlers
    │   ├── services/      # Business logic
    │   ├── models/        # Database queries & data access
    │   └── middleware/    # Module-specific middleware
    ├── users/             # Users module
    │   ├── index.js
    │   ├── routes/
    │   ├── controllers/
    │   ├── services/
    │   └── models/        # Database queries & data access
    └── orders/            # Orders module
        ├── index.js
        ├── routes/
        ├── controllers/
        ├── services/
        └── models/        # Database queries & data access
```

### Key Principles

1. **Module Encapsulation**: Each module exposes only what's needed via its `index.js` public API
2. **Clear Boundaries**: Modules communicate through well-defined interfaces, not internal implementation
3. **Shared Kernel**: Common utilities and middleware live in the `shared/` directory
4. **Single Database**: All modules share the same Prisma client and MySQL database

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: MySQL
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Joi
- **Security**: Helmet, bcrypt

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/node-modular-monolith.git
cd node-modular-monolith
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=modular-monolith

# Database
DATABASE_URL="mysql://username:password@localhost:3306/modular_monolith"

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 5. Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Auth Module
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users Module
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Orders Module
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

## Database Schema

### Models

- **User**: Core user entity with authentication fields
- **Token**: Refresh and verification tokens
- **Order**: User orders with status tracking
- **OrderItem**: Individual items within an order

### Enums

- **Role**: `USER`, `ADMIN`
- **TokenType**: `REFRESH`, `RESET_PASSWORD`, `VERIFY_EMAIL`
- **OrderStatus**: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

## Prisma Database Layer

### Database Connection (Read/Write Separation)

For scalability, the project supports separate read and write database instances. This is configured in `src/config/database.js`:

```javascript
const { PrismaClient } = require('@prisma/client');

// Write instance (Primary/Master)
const prismaWrite = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_WRITE_URL },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Read instance (Replica/Slave)
const prismaRead = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_READ_URL },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

module.exports = { prismaRead, prismaWrite };
```

**Environment Variables:**
```env
# Primary database (for writes: INSERT, UPDATE, DELETE)
DATABASE_WRITE_URL="mysql://user:password@primary-host:3306/modular_monolith"

# Replica database (for reads: SELECT)
DATABASE_READ_URL="mysql://user:password@replica-host:3306/modular_monolith"
```

**Usage in Models:**
```javascript
const { prismaRead, prismaWrite } = require('../../../config/database');

// Use prismaRead for SELECT queries
const findById = (id) => prismaRead.user.findUnique({ where: { id } });

// Use prismaWrite for INSERT, UPDATE, DELETE
const create = (data) => prismaWrite.user.create({ data });
const update = (id, data) => prismaWrite.user.update({ where: { id }, data });
const remove = (id) => prismaWrite.user.delete({ where: { id } });
```

### Common Query Examples

**Create (Insert)**
```javascript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: hashedPassword,
    firstName: 'John',
    lastName: 'Doe',
  },
});
```

**Read (Select)**
```javascript
// Find one
const user = await prisma.user.findUnique({
  where: { id: 1 },
});

// Find many with filtering
const users = await prisma.user.findMany({
  where: { isActive: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0,
});

// Find with relations
const order = await prisma.order.findUnique({
  where: { id: 1 },
  include: { items: true, user: true },
});
```

**Update**
```javascript
const user = await prisma.user.update({
  where: { id: 1 },
  data: { firstName: 'Jane' },
});
```

**Delete**
```javascript
await prisma.user.delete({
  where: { id: 1 },
});
```

**Transactions**
```javascript
const [order, updatedUser] = await prisma.$transaction([
  prisma.order.create({ data: orderData }),
  prisma.user.update({ where: { id: userId }, data: { orderCount: { increment: 1 } } }),
]);
```

### Models Directory Pattern

Each module's `models/` directory should contain database queries with read/write separation:

```javascript
// src/modules/users/models/userModel.js
const { prismaRead, prismaWrite } = require('../../../config/database');

// READ operations (use replica)
const findById = (id) => prismaRead.user.findUnique({ where: { id } });

const findByEmail = (email) => prismaRead.user.findUnique({ where: { email } });

const findMany = (where, options = {}) => prismaRead.user.findMany({
  where,
  ...options,
});

// WRITE operations (use primary)
const create = (data) => prismaWrite.user.create({ data });

const update = (id, data) => prismaWrite.user.update({ where: { id }, data });

const remove = (id) => prismaWrite.user.delete({ where: { id } });

module.exports = { findById, findByEmail, findMany, create, update, remove };
```

> **Note:** For single-database setups, you can use the same connection URL for both `DATABASE_WRITE_URL` and `DATABASE_READ_URL`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:seed` | Seed database with initial data |

## Adding a New Module

1. Create module folder: `src/modules/your-module/`
2. Add the standard structure:
   ```
   your-module/
   ├── index.js          # Public API
   ├── routes/index.js   # Route definitions
   ├── controllers/      # Request handlers
   ├── services/         # Business logic
   └── models/           # Database queries & data access
   ```
3. Define your public API in `index.js`
4. Mount the router in `app.js`
5. Add database models to `prisma/schema.prisma` if needed

## License

MIT
#   U E a t s - b a c k e n d  
 