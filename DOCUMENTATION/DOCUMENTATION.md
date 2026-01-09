# Looping - E-commerce Application Documentation

## 📋 Overview

Looping is a full-stack e-commerce application built with React frontend and Laravel backend, featuring MongoDB for product data and MySQL for relational data. The application provides a complete shopping experience with user authentication, product management, cart functionality, wishlist, order processing, and admin panel.

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19.1.1
- Vite (build tool)
- TailwindCSS (styling)
- React Router DOM (routing)
- Fetch API (native HTTP client)
- React Icons (icon library)

**Backend:**
- Laravel 12.x
- PHP 8.2+
- MySQL (relational data)
- MongoDB (product data)
- Sanctum (API authentication)
- Stripe (payment processing)

**Infrastructure:**
- WAMP Server (Apache/MySQL)
- MongoDB Community Edition
- Node.js/NPM

## 📁 Project Structure

```
Looping/
├── looping-client/                 # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/             # Admin dashboard components
│   │   │   ├── Basic/             # Core UI components
│   │   │   ├── User/              # User account components
│   │   │   ├── App.jsx           # Main application component
│   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   ├── Footer.jsx        # Footer component
│   │   │   └── Home.jsx          # Homepage
│   │   ├── styles/               # CSS styles
│   │   └── main.jsx              # Entry point
│   ├── .env                      # Frontend environment variables
│   └── package.json              # Frontend dependencies
│
├── looping-server-laravel/        # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/      # API controllers
│   │   │   ├── Middleware/       # Request middleware
│   │   │   └── Requests/         # Form request validation
│   │   ├── Models/               # Database models
│   │   ├── Services/             # Business logic services
│   │   └── Observers/            # Model observers
│   ├── config/                   # Configuration files
│   ├── database/                 # Database migrations/seeds
│   ├── routes/                   # API routes
│   ├── resources/views/          # Email templates
│   ├── .env                      # Backend environment variables
│   └── composer.json             # Backend dependencies
│
└── looping.bat                   # Startup script
```

## ⚙️ Environment Setup

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+
- MongoDB 6.0+
- WAMP Server

### Environment Variables

**Backend (.env):**
```bash
# App Configuration
APP_NAME=Looping
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Database (MySQL)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=looping
DB_USERNAME=root
DB_PASSWORD=your_password

# MongoDB
MONGO_DB_HOST=127.0.0.1
MONGO_URI=mongodb://admin:password@localhost:27017
MONGO_DB=looping
MONGO_AUTH_DB=admin

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google-callback

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

**Frontend (.env):**
```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_PORT=3000
```

## ▶️ Running the Application

### Method 1: Using Startup Script (Recommended)
```bash
# Double-click or run from command line
looping.bat
```

This script automatically starts:
- WAMP Server (Apache/MySQL)
- MongoDB Shell
- Laravel development server
- React development server

### Method 2: Manual Start

**Backend:**
```bash
cd looping-server-laravel
php artisan serve
```

**Frontend:**
```bash
cd looping-client
npm run dev
```

## 🔐 Authentication System

### Features
- User registration/login
- Email verification
- Password reset
- Google OAuth integration
- Session management with Sanctum

### API Endpoints
```
POST /api/basic/register     # User registration
POST /api/basic/login        # User login
POST /api/basic/logout       # User logout
POST /email/verification-resend  # Resend verification email
POST /forgot-password        # Send password reset link
POST /reset-password         # Reset password
```

## 🛍️ Product Management

### Features
- Product listing and search
- Product detail pages
- Image upload and management
- Category organization
- Price management
- Stock tracking

### Data Model
```javascript
{
  _id: ObjectId,
  title: String,
  price: Number,
  image: String,           // Relative path to storage
  description: String,
  category: String,
  stock: Number,
  tags: [String],
  variants: [Object],
  active: Boolean,
  discount: Number,
  created_at: Date,
  updated_at: Date
}
```

### API Endpoints
```
GET /api/products            # List all products
GET /api/products/{id}       # Get product by ID
POST /api/products           # Create new product
PUT /api/products/{id}       # Update product
DELETE /api/products/{id}    # Delete product
```

## 🛒 Shopping Cart

### Features
- Add/remove products
- Quantity adjustment
- Real-time cart updates
- Persistent storage

### API Endpoints
```
GET /api/basic/cart          # Get user's cart
POST /api/basic/cart/add     # Add item to cart
PUT /api/basic/cart/{id}     # Update item quantity
DELETE /api/basic/cart/{id}  # Remove item from cart
DELETE /api/basic/cart       # Clear entire cart
```

## ❤️ Wishlist System

### Features
- Save favorite products
- Quick add to cart
- Sync across devices

### API Endpoints
```
GET /api/basic/wishlist      # Get user's wishlist
POST /api/basic/wishlist/toggle  # Add/remove item
DELETE /api/basic/wishlist/{id}  # Remove specific item
GET /api/basic/wishlist/check/{id}  # Check if item is saved
```

## 💳 Payment Processing

### Features
- PIX payment generation
- Payment status tracking
- Webhook handling
- Order confirmation

### API Endpoints
```
POST /api/basic/pix/generate     # Generate PIX payment
GET /api/basic/pix/status/{id}   # Check payment status
POST /api/basic/pix/webhook      # Handle payment webhook
```

## 📦 Order Management

### Features
- Order creation and tracking
- Customer information management
- Delivery status updates
- Order history

### Data Model
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  customer_info: {
    name: String,
    email: String,
    phone: String,
    address: Object
  },
  items: [Object],
  total_amount: Number,
  status: String,
  payment_method: String,
  created_at: Date,
  updated_at: Date
}
```

### API Endpoints
```
GET /api/infos               # List all orders
POST /api/infos              # Create new order
PUT /api/infos/{id}/status   # Update order status
DELETE /api/infos/{id}       # Delete order
```

## 📊 Admin Panel

### Features
- Dashboard with analytics
- Product management
- Order management
- Customer management
- Stock control
- Settings configuration

### Admin Components
- `DashboardManagement.jsx` - Analytics dashboard
- `SaleProductManagement.jsx` - Product CRUD operations
- `OrdersManagement.jsx` - Order tracking
- `CustomersManagement.jsx` - Customer data
- `StockManagement.jsx` - Inventory control
- `DeliveryManagement.jsx` - Shipping management
- `SettingsManagement.jsx` - System configuration

## 🗃️ Database Schema

### MySQL Tables
```
users                   # User accounts
password_reset_tokens   # Password reset tokens
failed_jobs             # Failed job tracking
personal_access_tokens  # API tokens
orders                  # Order records
addresses               # User addresses
profiles                # User profiles
```

### MongoDB Collections
```
products                # Product catalog
wishlists               # User wishlists
carts                   # Shopping carts
infos                   # Order information
stocks                  # Inventory data
```

## 🔄 Stock Management System

### Features
- Real-time inventory tracking
- Automatic stock deduction on orders
- Reserved stock management
- Low stock alerts
- Incoming stock tracking

### Key Services
- `StockService.php` - Core stock operations
- `OrderStockService.php` - Order-stock synchronization
- `StockController.php` - Stock API endpoints

### API Endpoints
```
GET /api/infos/stock/fetch           # Get stock data
PUT /api/infos/stock/sync-order      # Deduct stock for order
PUT /api/infos/stock/reverse-order   # Return stock from canceled order
PUT /api/infos/stock/{id}/update     # Update stock manually
GET /api/infos/stock/low-stock       # Get low stock items
```

## 🎨 UI Components

### Core Components
- `Navbar.jsx` - Responsive navigation
- `Footer.jsx` - Site footer
- `Home.jsx` - Landing page
- `ProductDetail.jsx` - Product showcase
- `CheckoutPage.jsx` - Payment processing
- `Profile.jsx` - User account management

### Admin Components
- Beautiful loading skeletons
- Responsive data tables
- Interactive charts and stats
- Modal dialogs
- Form validation

## 🔧 Development Tools

### Scripts Available

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
php artisan serve    # Start Laravel server
php artisan migrate  # Run database migrations
php artisan tinker   # Interactive PHP shell
```

### Debugging Tools
- Built-in Laravel debug toolbar
- React Developer Tools
- Browser console logging
- Database query logging

## 🛡️ Security Features

- CSRF protection
- XSS prevention
- SQL injection protection
- Rate limiting
- Input validation
- Sanitized file uploads
- Secure password hashing
- Email verification
- Session security

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop browsers
- Tablet devices
- Mobile phones
- Different screen sizes

## 🚀 Deployment

### Production Checklist
1. Set `APP_ENV=production`
2. Generate new `APP_KEY`
3. Configure production database
4. Set up SSL certificates
5. Configure email service
6. Optimize images
7. Enable caching
8. Set up monitoring

### Hosting Options
- Shared hosting with PHP support
- Cloud platforms (AWS, DigitalOcean, Heroku)
- Docker containers
- VPS servers

## 🐛 Troubleshooting

### Common Issues

**Database Connection:**
- Verify MySQL/MongoDB services are running
- Check database credentials in `.env`
- Ensure databases exist

**Authentication Errors:**
- Verify Sanctum configuration
- Check CORS settings
- Confirm API endpoints match frontend

**File Upload Issues:**
- Check storage permissions
- Verify symbolic links
- Confirm file size limits

**Payment Processing:**
- Validate Stripe keys
- Test webhook URLs
- Check network connectivity

## 🤝 Contributing

### Development Guidelines
- Follow PSR-12 coding standards for PHP
- Use ESLint for JavaScript code quality
- Write meaningful commit messages
- Test thoroughly before pushing
- Document new features

### Branch Strategy
- `main` - Production code
- `develop` - Development branch
- Feature branches for new functionality

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review error logs
- Contact development team
- Submit GitHub issues

## 📄 License

This project is proprietary software developed for Looping e-commerce platform.

---

*Documentation last updated: January 9, 2026*
*Version: 1.0.0*