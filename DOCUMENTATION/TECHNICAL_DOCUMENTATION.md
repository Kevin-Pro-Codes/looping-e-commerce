# Looping Technical Documentation

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  React Frontend │────│  Laravel Backend │────│   Databases     │
│  (Port 3000)    │    │   (Port 8000)    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │                       │
        │              ┌────────┴────────┐              │
        │              │                 │              │
        │        ┌─────▼─────┐     ┌─────▼─────┐        │
        │        │  MySQL    │     │ MongoDB   │        │
        │        │  (SQL)│   │ (NoSQL)         │        │
        │        └───────────┘     └───────────┘        │
        │              │                 │              │
        └──────────────┼─────────────────┼──────────────┘
                       │                 │
                ┌──────▼──────┐   ┌─────▼─────┐
                │   Apache    │   │   Nginx   │
                │   (WAMP)    │   │ (Optional)│
                └─────────────┘   └───────────┘
```

## 📊 Data Flow Architecture

### Request Flow Pattern

```
Client Request
      ↓
[React Component] → [Fetch API Client]
      ↓
[API Endpoint] → [Laravel Controller] → [Service Layer]
      ↓
[Model/Data Access] ↔ [Database]
      ↓
[Response] → [JSON/API Response] → [React State Update]
      ↓
UI Re-render
```

## 🔧 Core Services Implementation

### StockService Class

Located: `looping-server-laravel/app/Services/StockService.php`

#### Key Methods:

```php
class StockService 
{
    // Deduct stock when order is placed
    public function deductStockForOrder($orderData)
    
    // Return stock when order is canceled
    public function returnStockForOrder($orderData)
    
    // Get current stock levels
    public function getCurrentStock($productId)
    
    // Update stock manually
    public function updateStock($productId, $quantity, $operation)
    
    // Check low stock alerts
    public function getLowStockItems($threshold = 10)
}
```

#### Usage Example:
```php
$stockService = new StockService();
$stockService->deductStockForOrder([
    'product_id' => 'camiseta_branca',
    'quantities' => [
        'P' => 2,
        'M' => 1,
        'G' => 3
    ]
]);
```

### OrderStockService Class

Handles synchronization between orders and stock system:

```php
class OrderStockService
{
    // Sync stock when order status changes
    public function syncOrderStock($orderId, $newStatus)
    
    // Reverse stock deduction
    public function reverseOrderStock($orderId)
    
    // Validate stock availability
    public function validateStockAvailability($orderItems)
}
```

## 🔄 State Management Patterns

### React Hooks Usage

#### Authentication Context:
```jsx
// useAuth.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication status
        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
```

#### Cart State Management:
```jsx
const [cartItems, setCartItems] = useState([]);
const [cartCount, setCartCount] = useState(0);

// Add to cart function
const addToCart = async (product, quantity = 1) => {
    try {
        const response = await fetch('/api/basic/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: product._id,
                quantity: quantity
            })
        });
        const data = await response.json();
        
        setCartItems(response.data.items);
        setCartCount(response.data.count);
    } catch (error) {
        console.error('Failed to add to cart:', error);
    }
};
```

## 🗄️ Database Schema Details

### MySQL Schema

#### Users Table
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(14),
    data_nascimento DATE,
    avatar TEXT,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    receber_marketing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Orders Table
```sql
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    customer_data JSON,
    items JSON,
    total_amount DECIMAL(10,2),
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    payment_method VARCHAR(50),
    pix_qr_code TEXT,
    pix_copy_paste VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### MongoDB Schema

#### Products Collection
```javascript
{
    "_id": ObjectId("..."),
    "title": "Camiseta Básica",
    "price": 49.90,
    "image": "uploads/product_image.jpg",
    "description": "Camiseta de algodão 100%",
    "category": "Roupas",
    "stock": 100,
    "tags": ["verão", "básico", "algodão"],
    "variants": [
        {
            "size": "P",
            "color": "branco",
            "stock": 20,
            "price": 49.90
        }
    ],
    "active": true,
    "discount": 0,
    "created_at": ISODate("2024-01-01T00:00:00Z"),
    "updated_at": ISODate("2024-01-01T00:00:00Z")
}
```

#### Stock Collection
```javascript
{
    "_id": ObjectId("..."),
    "product_id": "camiseta_branca",
    "variant": "P",
    "current_stock": 20,
    "reserved_stock": 5,
    "incoming_stock": 30,
    "last_updated": ISODate("2024-01-01T10:00:00Z"),
    "history": [
        {
            "date": ISODate("2024-01-01T09:00:00Z"),
            "change": -2,
            "reason": "order_123",
            "previous_stock": 22
        }
    ]
}
```

## 🌐 API Endpoints Reference

### Authentication Endpoints

#### POST `/api/basic/register`
```javascript
// Request Body
{
    "nome": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "telefone": "+5511999999999",
    "cpf": "123.456.789-00",
    "data_nascimento": "1990-01-01"
}

// Response
{
    "success": true,
    "user": { /* user data */ },
    "token": "sanctum_token"
}
```

#### POST `/api/basic/login`
```javascript
// Request Body
{
    "email": "john@example.com",
    "password": "password123"
}

// Response
{
    "success": true,
    "user": { /* user data */ },
    "token": "sanctum_token"
}
```

### Product Endpoints

#### GET `/api/products`
```javascript
// Response
[
    {
        "_id": "product_id",
        "title": "Product Name",
        "price": 99.99,
        "image": "http://localhost:8000/storage/uploads/image.jpg",
        "category": "Category",
        "description": "Product description"
    }
]
```

#### POST `/api/products`
```javascript
// Request Headers
Authorization: Bearer token
Content-Type: multipart/form-data

// Request Body (form-data)
title: "New Product"
price: 99.99
description: "Product description"
category: "Electronics"
image: (file upload)
```

### Cart Endpoints

#### GET `/api/basic/cart`
```javascript
// Response
{
    "items": [
        {
            "product_id": "product_123",
            "quantity": 2,
            "product": { /* product data */ }
        }
    ],
    "total": 199.98,
    "count": 2
}
```

#### POST `/api/basic/cart/add`
```javascript
// Request Body
{
    "product_id": "product_123",
    "quantity": 2
}

// Response
{
    "success": true,
    "message": "Item added to cart",
    "cart": { /* updated cart data */ }
}
```

## 🎨 Component Architecture

### Component Hierarchy

```
App.jsx
├── Navbar.jsx
├── Routes
│   ├── Home.jsx
│   │   ├── ProductGrid.jsx
│   │   └── FeaturedProducts.jsx
│   ├── ProductDetail.jsx
│   │   ├── ProductImages.jsx
│   │   ├── ProductInfo.jsx
│   │   └── AddToCartButton.jsx
│   ├── Profile.jsx
│   │   ├── UserTabs.jsx
│   │   ├── AccountTab.jsx
│   │   ├── OrdersTab.jsx
│   │   └── AddressesTab.jsx
│   └── AdminPanel.jsx
│       ├── DashboardManagement.jsx
│       ├── SaleProductManagement.jsx
│       ├── OrdersManagement.jsx
│       └── StockManagement.jsx
└── Footer.jsx
```

### Admin Panel Components Structure

#### DashboardManagement.jsx
```jsx
const DashboardManagement = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalUsers: 0,
        totalOrders: 0,
        revenue: 0
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    return (
        <div className="dashboard-container">
            <StatsCards data={stats} />
            <ChartsSection />
            <RecentActivity />
        </div>
    );
};
```

#### SaleProductManagement.jsx
```jsx
const SaleProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const handleCreateProduct = async (productData) => {
        // API call to create product
    };

    const handleUpdateProduct = async (id, productData) => {
        // API call to update product
    };

    const handleDeleteProduct = async (id) => {
        // API call to delete product
    };

    return (
        <div className="products-management">
            <ProductForm onSubmit={handleCreateProduct} />
            <ProductList 
                products={products}
                onEdit={setEditingProduct}
                onDelete={handleDeleteProduct}
            />
            {editingProduct && (
                <EditModal 
                    product={editingProduct}
                    onUpdate={handleUpdateProduct}
                    onClose={() => setEditingProduct(null)}
                />
            )}
        </div>
    );
};
```

## 🔒 Security Implementation

### Middleware Chain

```
Request → CORS Middleware → Authentication Middleware → Authorization Middleware → Controller
```

#### Auth Middleware (`auth:sanctum`)
```php
// app/Http/Middleware/Authenticate.php
public function handle($request, Closure $next)
{
    if (!Auth::check()) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    
    return $next($request);
}
```

#### Admin Middleware (`admin`)
```php
// app/Http/Middleware/AdminMiddleware.php
public function handle($request, Closure $next)
{
    if (!Auth::user() || !Auth::user()->is_admin) {
        return response()->json(['error' => 'Access denied'], 403);
    }
    
    return $next($request);
}
```

### Input Validation

#### Form Request Validation
```php
// app/Http/Requests/ProductRequest.php
class ProductRequest extends FormRequest
{
    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000'
        ];
    }
}
```

## 📱 Responsive Design Implementation

### Breakpoint System (TailwindCSS)

```css
/* Mobile First Approach */
.sm:flex     /* Small screens (640px+) */
.md:grid     /* Medium screens (768px+) */
.lg:block    /* Large screens (1024px+) */
.xl:hidden   /* Extra large screens (1280px+) */
```

### Responsive Component Example

```jsx
const ResponsiveGrid = ({ products }) => (
    <div className="grid grid-cols-1 
                    xs:grid-cols-2 
                    sm:grid-cols-2 
                    md:grid-cols-3 
                    lg:grid-cols-4 
                    xl:grid-cols-5 
                    gap-4">
        {products.map(product => (
            <ProductCard key={product.id} product={product} />
        ))}
    </div>
);
```

## 🚀 Performance Optimization

### Frontend Optimizations

#### Lazy Loading
```jsx
const AdminPanel = lazy(() => import('./components/Basic/AdminPanel'));

<Route 
    path="/admin" 
    element={
        <Suspense fallback={<LoadingSpinner />}>
            <AdminPanel />
        </Suspense>
    } 
/>
```

#### Memoization
```jsx
const ExpensiveComponent = memo(({ data }) => {
    // Expensive computation
    const processedData = useMemo(() => {
        return data.map(item => processItem(item));
    }, [data]);

    return <div>{processedData}</div>;
});
```

### Backend Optimizations

#### Database Query Optimization
```php
// Eager loading to prevent N+1 queries
$products = Product::with(['category', 'reviews'])
    ->where('active', true)
    ->paginate(20);

// Index optimization
Schema::table('products', function (Blueprint $table) {
    $table->index(['category_id', 'active']);
    $table->index('created_at');
});
```

#### Caching Strategy
```php
// Cache product data
$products = Cache::remember('products_featured', 3600, function () {
    return Product::where('featured', true)
        ->take(10)
        ->get();
});

// Cache user sessions
Cache::put("user_session_{$userId}", $sessionData, 7200);
```

## 🧪 Testing Strategy

### Unit Tests Structure

```
tests/
├── Unit/
│   ├── Services/
│   │   ├── StockServiceTest.php
│   │   └── OrderStockServiceTest.php
│   └── Models/
│       ├── ProductTest.php
│       └── UserTest.php
└── Feature/
    ├── Auth/
    │   ├── RegistrationTest.php
    │   └── LoginTest.php
    └── Api/
        ├── ProductApiTest.php
        └── CartApiTest.php
```

### Example Test Case

```php
// tests/Feature/Auth/RegistrationTest.php
class RegistrationTest extends TestCase
{
    public function test_user_can_register()
    {
        $userData = [
            'nome' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ];

        $response = $this->postJson('/api/basic/register', $userData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com'
        ]);
    }
}
```

## 📈 Monitoring & Logging

### Laravel Logging Configuration

```php
// config/logging.php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['single', 'daily'],
    ],
    
    'daily' => [
        'driver' => 'daily',
        'path' => storage_path('logs/laravel.log'),
        'level' => 'debug',
        'days' => 14,
    ],
],
```

### Custom Logging in Services

```php
class StockService 
{
    public function deductStock($productId, $quantity)
    {
        try {
            // Stock deduction logic
            Log::info('Stock deducted', [
                'product_id' => $productId,
                'quantity' => $quantity,
                'timestamp' => now()
            ]);
        } catch (Exception $e) {
            Log::error('Stock deduction failed', [
                'product_id' => $productId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
```

## 🔧 Deployment Configuration

### Production Environment Setup

#### Server Requirements
- PHP 8.2+
- MySQL 8.0+
- MongoDB 6.0+
- Composer
- Node.js 18+
- Nginx/Apache

#### Deployment Steps

1. **Clone repository**
```bash
git clone repository-url
cd looping
```

2. **Install dependencies**
```bash
# Backend
cd looping-server-laravel
composer install --no-dev --optimize-autoloader

# Frontend
cd ../looping-client
npm install
npm run build
```

3. **Configure environment**
```bash
cp .env.production .env
php artisan key:generate
```

4. **Database setup**
```bash
php artisan migrate --force
php artisan db:seed
```

5. **Storage setup**
```bash
php artisan storage:link
chmod -R 755 storage
```

6. **Web server configuration**

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/looping/looping-server-laravel/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

## 🆘 Troubleshooting Guide

### Common Issues and Solutions

#### Database Connection Errors
```bash
# Check MySQL service
sudo systemctl status mysql

# Check MongoDB service
sudo systemctl status mongod

# Test connections
mysql -u root -p
mongosh --host localhost --port 27017
```

#### Authentication Issues
```php
// Clear cached tokens
php artisan cache:clear
php artisan config:clear

// Regenerate app key
php artisan key:generate
```

#### File Upload Problems
```bash
# Check storage permissions
ls -la storage/app/public/
chmod -R 755 storage/app/public/

# Verify symbolic link
ls -la public/storage
# If broken, recreate:
php artisan storage:link
```

#### API CORS Issues
```php
// config/cors.php
'allowed_origins' => [
    'http://localhost:3000',
    'http://localhost:8000',
    'https://yourdomain.com'
],

'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

---

*Technical Documentation Last Updated: January 9, 2026*
*Architecture Version: 2.1.0*