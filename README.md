# 🏪 Inventory Management System

A complete, production-grade Stock Management System built with **Next.js 14**, **NestJS**, and **PostgreSQL**. This system handles all product and stock operations with a clean architecture and scalable code structure.

## 🚀 Features

### Core Inventory Management
- ✅ **Product Management** - CRUD operations for products with SKU, categories, and reorder levels
- ✅ **Location Management** - Manage warehouses and stores
- ✅ **Stock Management** - Dedicated stock adjustment and transfer system
- ✅ **Stock Transactions** - Receipt, Issue, Transfer, and Adjustment transactions
- ✅ **Stock Balances** - Real-time stock tracking across all locations
- ✅ **Stocktake** - Manual count adjustments with automatic transaction generation
- ✅ **Reorder Alerts** - Low stock notifications and suggestions
- ✅ **Audit Logs** - Complete audit trail for all CRUD operations
- ✅ **Bulk Import/Export** - Excel/CSV bulk operations for products

## 🔄 Workflow

### Product Management Workflow
1. **Create Products** - Add product details (name, SKU, category, UOM, pricing, etc.)
2. **Manage Stock** - Use the dedicated Stock Balances page to add/adjust quantities
3. **Transfer Stock** - Move stock between locations as needed
4. **Monitor Levels** - Track reorder levels and low stock alerts

### Key Design Principles
- **Separation of Concerns**: Product creation is separate from stock management
- **Flexible Stock Management**: Add stock to any location after product creation
- **Clean Data Flow**: Products exist independently of stock quantities
- **Scalable Architecture**: Easy to add new locations and stock operations

### Authentication & Security
- ✅ **JWT Authentication** - Secure login with access and refresh tokens
- ✅ **Role-based Access** - Admin and Staff user roles
- ✅ **Protected Routes** - Secure API endpoints and frontend pages

### Technical Features
- ✅ **RESTful API** - Complete API with Swagger documentation
- ✅ **Database Migrations** - Prisma ORM with PostgreSQL
- ✅ **Docker Support** - Complete containerization setup
- ✅ **Responsive UI** - Modern interface with ShadCN UI components
- ✅ **Real-time Updates** - React Query for data fetching and caching

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (Access + Refresh Tokens)
- **Validation**: class-validator
- **Documentation**: Swagger (OpenAPI)
- **Testing**: Jest

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **State Management**: React Query (TanStack)
- **HTTP Client**: Axios
- **Authentication**: NextAuth.js (JWT mode)
- **Forms**: React Hook Form + Zod

### DevOps
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL 15
- **Reverse Proxy**: Nginx (optional)

## 📦 Project Structure

```
inventory-management-system/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── products/       # Product CRUD
│   │   ├── locations/      # Location management
│   │   ├── stock-balances/ # Stock tracking
│   │   ├── stock-transactions/ # Stock operations
│   │   ├── stocktake/      # Manual counting
│   │   ├── audit/          # Audit logging
│   │   ├── csv/            # Import/Export
│   │   └── reorder/        # Reorder alerts
│   ├── prisma/             # Database schema & migrations
│   └── Dockerfile
├── frontend/               # Next.js App
│   ├── app/                # App Router pages
│   │   ├── auth/           # Login/Register
│   │   ├── dashboard/      # Main dashboard
│   │   └── api/            # API routes
│   ├── components/         # Reusable components
│   └── lib/                # Utilities
├── docker-compose.yml      # Docker services
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd inventory-management-system
```

### 2. Environment Setup
```bash
# Copy environment files
cp backend/env.example backend/.env
```

Update `backend/.env` with your configuration:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/inventory?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

### 3. Start with Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Manual Setup (Alternative)

#### Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs
- **Database Admin**: http://localhost:5050 (pgAdmin)

## 🔐 Default Credentials

The system comes with pre-seeded demo accounts:

- **Admin**: admin@inventory.com / admin123
- **Staff**: staff@inventory.com / staff123

## 📊 Database Schema

### Core Entities
- **User** - System users with roles
- **Product** - Inventory items with SKU and reorder levels
- **Location** - Warehouses and stores
- **StockBalance** - Current stock quantities per location
- **StockTransaction** - All stock movements (receipt, issue, transfer, adjustment)
- **Stocktake** - Manual count records
- **AuditLog** - Complete audit trail

### Key Relationships
- Products have many StockBalances (one per location)
- StockTransactions reference Products and Locations
- All operations are audited in AuditLog
- Stocktake adjustments generate StockTransactions

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh access token

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Locations
- `GET /api/locations` - List locations
- `POST /api/locations` - Create location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Stock Management
- `GET /api/stock/balances` - Get stock balances
- `POST /api/stock/transactions` - Create stock transaction
- `GET /api/stock/transactions` - List transactions
- `GET /api/reorder/alerts` - Get reorder alerts

### Stocktake
- `POST /api/stocktake` - Create stocktake
- `GET /api/stocktake` - List stocktakes

### CSV Operations
- `GET /api/csv/export/products` - Export products
- `GET /api/csv/export/stock-balances` - Export stock balances
- `POST /api/csv/import/products` - Import products

### Audit
- `GET /api/audit-logs` - Get audit logs

## 🎯 Business Logic

### Stock Transaction Rules
- **RECEIPT**: Adds stock to a location (requires `toLocationId`)
- **ISSUE**: Removes stock from a location (requires `fromLocationId`)
- **TRANSFER**: Moves stock between locations (requires both `fromLocationId` and `toLocationId`)
- **ADJUSTMENT**: Adjusts stock quantity (requires `fromLocationId`)

### Stock Balance Updates
- All transactions automatically update `StockBalance` records
- Negative stock quantities are prevented
- Stocktake adjustments generate `ADJUSTMENT` transactions

### Reorder Alerts
- Triggered when `stock_quantity < reorder_level`
- Available via API and dashboard
- Includes reorder suggestions

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🚀 Deployment

### Production Environment
1. Update environment variables for production
2. Build and deploy with Docker:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `CORS_ORIGIN` - Allowed CORS origins
- `NODE_ENV` - Environment (development/production)

## 📈 Monitoring & Logging

- **Application Logs**: NestJS built-in logger
- **Database Logs**: PostgreSQL logs
- **Audit Trail**: Complete audit logs for all operations
- **Error Handling**: Global exception filters

## 🔧 Development

### Adding New Features
1. Create module in backend (`src/modules/`)
2. Add Prisma schema changes
3. Create migration: `npx prisma migrate dev`
4. Update frontend components
5. Add API tests

### Code Style
- **Backend**: ESLint + Prettier
- **Frontend**: Next.js ESLint config
- **TypeScript**: Strict mode enabled

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the audit logs for troubleshooting

## 🎉 Acknowledgments

Built with modern web technologies and best practices:
- NestJS for robust backend architecture
- Next.js 14 for performant frontend
- Prisma for type-safe database operations
- ShadCN UI for beautiful components
- React Query for efficient data management

---

**Happy Inventory Managing! 🎯**
