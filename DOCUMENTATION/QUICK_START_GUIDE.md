# Looping Developer Quick Start Guide

## 🚀 Getting Started

Welcome to the Looping e-commerce project! This guide will help you set up your development environment and get started quickly.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **PHP** 8.2 or higher
- **Composer** (PHP dependency manager)
- **Node.js** 18 or higher
- **npm** or **yarn**
- **MySQL** 8.0 or higher
- **MongoDB** 6.0 or higher
- **Git**

### Recommended Tools
- **Visual Studio Code** (or your preferred IDE)
- **Postman** (for API testing)
- **MongoDB Compass** (for database management)
- **WAMP/XAMPP** (for local server environment)

## 🛠️ Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Looping
```

### 2. Backend Setup (Laravel)

```bash
cd looping-server-laravel

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Install Laravel Passport (if needed)
php artisan passport:install
```

### 3. Frontend Setup (React)

```bash
cd ../looping-client

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 4. Database Configuration

#### MySQL Setup
```sql
-- Create database
CREATE DATABASE looping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional)
CREATE USER 'looping_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON looping.* TO 'looping_user'@'localhost';
FLUSH PRIVILEGES;
```

#### MongoDB Setup
```javascript
// Connect to MongoDB
use looping

// Create collections (will be created automatically)
// products, wishlists, carts, infos, stocks
```

### 5. Environment Configuration

Update the `.env` files with your configuration:

**Backend (.env):**
```bash
# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=looping
DB_USERNAME=your_username
DB_PASSWORD=your_password

# MongoDB Configuration
MONGO_DB_HOST=127.0.0.1
MONGO_URI=mongodb://admin:password@localhost:27017
MONGO_DB=looping

# Application URLs
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:8000
VITE_PORT=3000
```

### 6. Run Database Migrations

```bash
cd looping-server-laravel

# Run migrations
php artisan migrate

# Seed initial data (optional)
php artisan db:seed
```

### 7. Storage Setup

```bash
# Create symbolic link for storage
php artisan storage:link

# Set proper permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

## ▶️ Running the Application

### Option 1: Using Startup Script (Windows)

Double-click `looping.bat` or run:
```bash
looping.bat
```

This will automatically start:
- WAMP Server
- MongoDB
- Laravel development server
- React development server

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd looping-server-laravel
php artisan serve
# Server will start at http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd looping-client
npm run dev
# Server will start at http://localhost:3000
```

**Terminal 3 - Database Services:**
```bash
# Start MySQL (if not using WAMP)
sudo service mysql start

# Start MongoDB
sudo service mongod start
```

## 🧪 Testing Your Setup

### 1. Backend Health Check
Visit: `http://localhost:8000/api/products`

Should return a JSON array of products or empty array.

### 2. Frontend Health Check
Visit: `http://localhost:3000`

Should display the Looping homepage.

### 3. Database Connection Test

```bash
# Test MySQL connection
mysql -u your_username -p -e "SHOW DATABASES LIKE 'looping';"

# Test MongoDB connection
mongosh --eval "db.stats()"
```

## 📁 Project Structure Overview

```
Looping/
├── looping-client/              # React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Admin/         # Admin panel components
│   │   │   ├── Basic/         # Core UI components
│   │   │   └── User/          # User account components
│   │   ├── styles/            # CSS/Tailwind styles
│   │   └── main.jsx           # Entry point
│   └── package.json
│
├── looping-server-laravel/      # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/  # API controllers
│   │   ├── Models/            # Database models
│   │   ├── Services/          # Business logic
│   │   └── Providers/         # Service providers
│   ├── config/                # Configuration files
│   ├── database/              # Migrations & seeds
│   ├── routes/                # API routes
│   └── composer.json
│
└── DOCUMENTATION.md            # Main documentation
```

## 🔧 Development Workflow

### Creating a New Feature

1. **Create a new branch:**
```bash
git checkout -b feature/new-feature-name
```

2. **Backend Development:**
```bash
# Create controller
php artisan make:controller FeatureController

# Create model (if needed)
php artisan make:model Feature

# Create migration (if needed)
php artisan make:migration create_features_table
```

3. **Frontend Development:**
```bash
# Create new component
touch src/components/NewFeature.jsx

# Import and use in routes
# Update App.jsx or relevant parent component
```

4. **Testing:**
```bash
# Backend tests
php artisan test

# Frontend tests (if configured)
npm test
```

5. **Commit and Push:**
```bash
git add .
git commit -m "Add new feature: description"
git push origin feature/new-feature-name
```

### Common Development Commands

**Backend:**
```bash
# Start development server
php artisan serve

# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Generate API documentation
php artisan api:docs
```

**Frontend:**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm test
```

## 🐛 Debugging Tips

### Backend Debugging

1. **Enable Debug Mode:**
```bash
# In .env file
APP_DEBUG=true
LOG_LEVEL=debug
```

2. **Use Laravel Tinker:**
```bash
php artisan tinker
>>> User::all()
>>> DB::table('products')->get()
```

3. **Check Logs:**
```bash
tail -f storage/logs/laravel.log
```

### Frontend Debugging

1. **Browser DevTools:**
- Network tab to monitor API calls
- Console for JavaScript errors
- React DevTools for component inspection

2. **Add Console Logs:**
```javascript
console.log('Debug info:', data);
console.table(arrayData);
```

3. **React Error Boundaries:**
```jsx
 componentDidCatch(error, errorInfo) {
   console.error('React Error:', error, errorInfo);
 }
```

## 🔐 Authentication Testing

### Using Postman

1. **Register User:**
```
POST http://localhost:8000/api/basic/register
Body: {
  "nome": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

2. **Login User:**
```
POST http://localhost:8000/api/basic/login
Body: {
  "email": "test@example.com",
  "password": "password123"
}
```

3. **Use Token for Authenticated Requests:**
```
Headers: {
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

## 📱 Mobile Development Notes

The application is responsive and mobile-friendly. Test on:

- Chrome DevTools device emulator
- Physical mobile devices
- Different screen sizes and orientations

## 🚨 Common Issues & Solutions

### Database Connection Errors
```bash
# Check if services are running
sudo service mysql status
sudo service mongod status

# Restart services if needed
sudo service mysql restart
sudo service mongod restart
```

### Permission Issues
```bash
# Fix storage permissions
sudo chmod -R 755 storage/
sudo chown -R www-data:www-data storage/

# Fix bootstrap cache
sudo chmod -R 755 bootstrap/cache/
```

### CORS Errors
```php
// config/cors.php
'allowed_origins' => [
    'http://localhost:3000',
    'http://localhost:8000'
],
```

### Port Conflicts
```bash
# Kill process using port
sudo lsof -i :8000
sudo kill -9 PID

# Or use different ports
php artisan serve --port=8001
```

## 📚 Learning Resources

### Framework Documentation
- [Laravel Docs](https://laravel.com/docs)
- [React Docs](https://react.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [MongoDB Docs](https://docs.mongodb.com/)

### Project-Specific Resources
- `DOCUMENTATION.md` - Complete project documentation
- `TECHNICAL_DOCUMENTATION.md` - Technical implementation details
- `API_DOCUMENTATION.md` - API endpoints reference

## 🤝 Getting Help

### Internal Resources
- Check existing documentation
- Review recent commits and pull requests
- Ask team members in Slack/Teams

### External Resources
- Stack Overflow
- Laravel/React community forums
- GitHub issues for dependencies

## 🎯 Next Steps

1. ✅ Complete environment setup
2. ✅ Run the application locally
3. ✅ Explore the codebase structure
4. ✅ Make a small change and test it
5. ✅ Review documentation for deeper understanding
6. ✅ Start contributing to issues/features

---

*Quick Start Guide Last Updated: January 9, 2026*
*Happy Coding! 🚀*