# Black Dog Express - Logistics Management System

A full-stack web application for a UK road transport company offering nationwide and European shipping services.

## Tech Stack

### Backend
- Ruby on Rails 7.1 (API mode)
- PostgreSQL database
- Devise + JWT authentication
- Stripe payment integration
- Sidekiq for background jobs
- Geocoder for distance calculations

### Frontend
- React 18 with TypeScript
- Vite build tool
- TailwindCSS styling
- React Query for data fetching
- React Router for navigation
- React Hook Form + Zod validation

## Features

- **Quote Calculator**: Instant pricing based on distance, weight, vehicle type, and services
- **Order Management**: Full order lifecycle from quote to delivery
- **Vehicle Fleet**: Track vehicles from small vans to 44-ton articulated lorries
- **Route Planning**: Distance calculation, driver hours compliance, ferry crossings
- **Payment Processing**: Stripe integration for secure payments
- **Customer Portal**: Account management, order tracking, communication
- **Admin Dashboard**: Fleet management, dispatching, reporting

## Getting Started

### Prerequisites
- Ruby 3.3+
- Node.js 20+
- PostgreSQL 14+
- Redis (for Sidekiq)

### Backend Setup

```bash
cd backend

# Install dependencies
bundle install

# Setup database
cp .env.example .env
# Edit .env with your configuration

rails db:create
rails db:migrate
rails db:seed

# Start the server
rails server
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with API URL

# Start development server
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth` - Register
- `POST /api/v1/auth/sign_in` - Login
- `DELETE /api/v1/auth/sign_out` - Logout

### Quotes
- `GET /api/v1/quotes` - List quotes
- `POST /api/v1/quotes` - Create quote
- `POST /api/v1/quotes/quick_estimate` - Quick price estimate
- `POST /api/v1/quotes/:id/accept` - Accept quote
- `POST /api/v1/quotes/:id/convert_to_order` - Convert to order

### Orders
- `GET /api/v1/orders` - List orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/track?tracking_number=XXX` - Track order
- `POST /api/v1/orders/:id/assign_vehicle` - Assign vehicle
- `POST /api/v1/orders/:id/deliver` - Mark delivered

### Vehicles
- `GET /api/v1/vehicles` - List vehicles
- `GET /api/v1/vehicles/vehicle_types` - Vehicle type specifications

### Shipping Info (Public)
- `GET /api/v1/shipping/info` - Company and service information
- `GET /api/v1/shipping/uk` - UK shipping details
- `GET /api/v1/shipping/eu` - European shipping details
- `GET /api/v1/shipping/vehicles` - Vehicle guide

## Vehicle Types

| Type | Max Weight | Max Volume | Typical Use |
|------|-----------|------------|-------------|
| Small Van | 800kg | 6m³ | Urgent parcels |
| Large Van | 1,200kg | 12m³ | General cargo |
| Luton Van | 1,000kg | 18m³ | House moves |
| 7.5 Tonne | 3,500kg | 30m³ | Pallet deliveries |
| 18 Tonne | 10,000kg | 45m³ | Multi-pallet loads |
| 26 Tonne | 15,000kg | 60m³ | Large distribution |
| 44 Tonne Artic | 26,000kg | 85m³ | Full loads |

## Test Accounts

After running `rails db:seed`:

- **Admin**: admin@blackdogexpress.co.uk / password123
- **Dispatcher**: dispatcher@blackdogexpress.co.uk / password123
- **Customer**: customer@example.com / password123

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgres://localhost/black_dog_development
DEVISE_JWT_SECRET_KEY=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## License

Proprietary - Black Dog Express Ltd
