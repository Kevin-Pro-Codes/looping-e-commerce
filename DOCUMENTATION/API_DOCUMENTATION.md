# Looping API Documentation

## 📋 API Overview

Base URL: `http://localhost:8000/api`

All API requests should include:
- Content-Type: `application/json`
- Accept: `application/json`
- Authorization: `Bearer {token}` (for authenticated endpoints)

## 🔐 Authentication Endpoints

### User Registration
**POST** `/api/basic/register`

Registers a new user account.

#### Request Body
```json
{
    "nome": "John Doe",
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "password_confirmation": "securepassword123",
    "telefone": "+5511999999999",
    "cpf": "123.456.789-00",
    "data_nascimento": "1990-01-01"
}
```

#### Success Response (201)
```json
{
    "success": true,
    "message": "Registration successful",
    "user": {
        "id": 123,
        "nome": "John Doe",
        "email": "john.doe@example.com",
        "telefone": "+5511999999999",
        "cpf": "123.456.789-00",
        "data_nascimento": "1990-01-01",
        "email_verified_at": null,
        "created_at": "2024-01-09T10:00:00.000000Z"
    },
    "token": "123|abcdefghijklmnopqrstuvwxyz"
}
```

#### Error Response (422)
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email has already been taken."],
        "password": ["The password field is required."]
    }
}
```

---

### User Login
**POST** `/api/basic/login`

Authenticate user and receive access token.

#### Request Body
```json
{
    "email": "john.doe@example.com",
    "password": "securepassword123"
}
```

#### Success Response (200)
```json
{
    "success": true,
    "user": {
        "id": 123,
        "nome": "John Doe",
        "email": "john.doe@example.com",
        "email_verified_at": "2024-01-09T10:00:00.000000Z"
    },
    "token": "123|abcdefghijklmnopqrstuvwxyz"
}
```

#### Error Response (401)
```json
{
    "error": "Invalid credentials"
}
```

---

### User Logout
**POST** `/api/basic/logout`

Logout current user (invalidate token).

#### Headers
```
Authorization: Bearer {token}
```

#### Success Response (200)
```json
{
    "message": "Successfully logged out"
}
```

---

### Get Current User
**GET** `/api/basic/user`

Get authenticated user's information.

#### Headers
```
Authorization: Bearer {token}
```

#### Success Response (200)
```json
{
    "id": 123,
    "nome": "John Doe",
    "email": "john.doe@example.com",
    "telefone": "+5511999999999",
    "cpf": "123.456.789-00",
    "data_nascimento": "1990-01-01",
    "avatar": null,
    "email_verified_at": "2024-01-09T10:00:00.000000Z",
    "created_at": "2024-01-09T10:00:00.000000Z",
    "updated_at": "2024-01-09T10:00:00.000000Z"
}
```

---

### Update User Profile
**PUT** `/api/basic/user/{id}`

Update user profile information.

#### Headers
```
Authorization: Bearer {token}
```

#### Request Body
```json
{
    "nome": "John Smith",
    "telefone": "+5511888888888",
    "data_nascimento": "1990-01-02",
    "receber_marketing": true
}
```

#### Success Response (200)
```json
{
    "id": 123,
    "nome": "John Smith",
    "email": "john.doe@example.com",
    "telefone": "+5511888888888",
    "data_nascimento": "1990-01-02",
    "receber_marketing": true,
    "updated_at": "2024-01-09T11:00:00.000000Z"
}
```

---

## 🛍️ Product Endpoints

### Get All Products
**GET** `/api/products`

Retrieve all products from MongoDB.

#### Success Response (200)
```json
[
    {
        "_id": "659d1a2b3c4d5e6f7a8b9c0d",
        "title": "Camiseta Básica Branca",
        "price": 49.90,
        "image": "http://localhost:8000/storage/uploads/camiseta_branca.jpg",
        "description": "Camiseta de algodão 100%, confortável e durável",
        "category": "Roupas",
        "stock": 100,
        "tags": ["verão", "básico", "algodão"],
        "variants": [
            {
                "size": "P",
                "color": "branco",
                "stock": 20,
                "price": 49.90
            },
            {
                "size": "M",
                "color": "branco",
                "stock": 30,
                "price": 49.90
            }
        ],
        "active": true,
        "discount": 0,
        "created_at": "2024-01-09T10:00:00.000Z",
        "updated_at": "2024-01-09T10:00:00.000Z"
    }
]
```

---

### Get Product by ID
**GET** `/api/products/{id}`

Retrieve specific product by ID.

#### Success Response (200)
```json
{
    "_id": "659d1a2b3c4d5e6f7a8b9c0d",
    "title": "Camiseta Básica Branca",
    "price": 49.90,
    "image": "http://localhost:8000/storage/uploads/camiseta_branca.jpg",
    "description": "Camiseta de algodão 100%",
    "category": "Roupas",
    "stock": 100,
    "active": true
}
```

#### Error Response (404)
```json
{
    "error": "Product not found"
}
```

---

### Create New Product
**POST** `/api/products`

Create a new product (admin only).

#### Headers
```
Authorization: Bearer {admin_token}
```

#### Request Body
```json
{
    "title": "Novo Produto",
    "price": 99.99,
    "image": "uploads/novo_produto.jpg",
    "description": "Descrição do novo produto",
    "category": "Eletrônicos",
    "stock": 50,
    "tags": ["novo", "popular"],
    "variants": [
        {
            "size": "único",
            "color": "preto",
            "stock": 50,
            "price": 99.99
        }
    ],
    "active": true,
    "discount": 10
}
```

#### Success Response (201)
```json
{
    "_id": "659d1a2b3c4d5e6f7a8b9c0e",
    "title": "Novo Produto",
    "price": 99.99,
    "image": "http://localhost:8000/storage/uploads/novo_produto.jpg",
    "description": "Descrição do novo produto",
    "category": "Eletrônicos",
    "stock": 50,
    "active": true,
    "discount": 10
}
```

---

### Update Product
**PUT** `/api/products/{id}`

Update existing product (admin only).

#### Headers
```
Authorization: Bearer {admin_token}
```

#### Request Body
```json
{
    "title": "Produto Atualizado",
    "price": 89.99,
    "description": "Descrição atualizada"
}
```

#### Success Response (200)
```json
{
    "_id": "659d1a2b3c4d5e6f7a8b9c0d",
    "title": "Produto Atualizado",
    "price": 89.99,
    "image": "http://localhost:8000/storage/uploads/produto.jpg",
    "description": "Descrição atualizada",
    "category": "Eletrônicos",
    "stock": 50,
    "active": true
}
```

---

### Delete Product
**DELETE** `/api/products/{id}`

Delete product (admin only).

#### Headers
```
Authorization: Bearer {admin_token}
```

#### Success Response (200)
```json
{
    "message": "Product deleted successfully"
}
```

---

## 🛒 Shopping Cart Endpoints

### Get User's Cart
**GET** `/api/basic/cart`

Retrieve current user's shopping cart.

#### Headers
```
Authorization: Bearer {token}
```

#### Success Response (200)
```json
{
    "items": [
        {
            "product_id": "659d1a2b3c4d5e6f7a8b9c0d",
            "quantity": 2,
            "product": {
                "_id": "659d1a2b3c4d5e6f7a8b9c0d",
                "title": "Camiseta Básica Branca",
                "price": 49.90,
                "image": "http://localhost:8000/storage/uploads/camiseta.jpg"
            }
        }
    ],
    "total": 99.80,
    "count": 2
}
```

---

### Add Item to Cart
**POST** `/api/basic/cart/add`

Add product to user's cart.

#### Headers
```
Authorization: Bearer {token}
```

#### Request Body
```json
{
    "product_id": "659d1a2b3c4d5e6f7a8b9c0d",
    "quantity": 2
}
```

#### Success Response (200)
```json
{
    "success": true,
    "message": "Item added to cart",
    "cart": {
        "items": [...],
        "total": 99.80,
        "count": 2
    }
}
```

---

### Update Cart Item Quantity
**PUT** `/api/basic/cart/{product_id}`

Update quantity of item in cart.

#### Headers
```
Authorization: Bearer {token}
```

#### Request Body
```json
{
    "quantity": 3
}
```

#### Success Response (200)
```json
{
    "success": true,
    "message": "Cart updated",
    "cart": {
        "items": [...],
        "total": 149.70,
        "count": 3
    }
}
```

---

### Remove Item from Cart
**DELETE** `/api/basic/cart/{product_id}`

Remove specific item from cart.

#### Headers
```
Authorization: Bearer {token}
```

#### Success Response (200)
```json
{
    "success": true,
    "message": "Item removed from cart",
    "cart": {
        "items": [],
        "total": 0,
        "count": 0
    }
}
```

---

### Clear Entire Cart
**DELETE** `/api/basic/cart`

Remove all items from cart.

#### Headers
```
Authorization: Bearer {token}
```

#### Success Response (200)
```json
{
    "success": true,
    "message": "Cart cleared",
    "cart": {
        "items": [],
        "total": 0,
        "count": 0
    }
}
```

---

## ❤️ Wishlist Endpoints

### Get User's Wishlist
**GET** `/api/basic/wishlist`

Retrieve user's saved products.

#### Headers
```
Authorization: Bearer {token}
```

#### Success Response (200)
```json
[
    {
        "product_id": "659d1a2b3c4d5e6f7a8b9c0d",
        "product": {
            "_id": "659d1a2b3c4d5e6f7a8b9c0d",
            "title": "Camiseta Básica Branca",
            "price": 49.90,
            "image": "http://localhost:8000/storage/uploads/camiseta.jpg"
        },
        "created_at": "2024-01-09T10:00:00.000Z"
    }
]
```

---

### Toggle Wishlist Item
**POST** `/api/basic/wishlist/toggle`

Add or remove product from wishlist.

#### Headers
```
Authorization: Bearer {token}
```

#### Request Body
```json
{
    "product_id": "659d1a2b3c4d5e6f7a8b9c0d"
}
```

#### Success Response (200)
```json
{
    "message": "Product added to wishlist",
    "action": "added",
    "product_id": "659d1a2b3c4d5e6f7a8b9c0d",
    "in_wishlist": true
}
```

---

### Check Wishlist Status
**GET** `/api/basic/wishlist/check/{product_id}`

Check if product is in user's wishlist.

#### Headers
```
Authorization: Bearer {token}
```

#### Success Response (200)
```json
{
    "in_wishlist": true
}
```

---

### Get Wishlist Count
**GET** `/api/basic/wishlist/count`

Get total number of items in wishlist.

#### Headers
```
Authorization: Bearer {token}
```

#### Success Response (200)
```json
{
    "count": 5
}
```

---

## 💳 Payment Endpoints

### Generate PIX Payment
**POST** `/api/basic/pix/generate`

Generate PIX payment for order.

#### Headers
```
Authorization: Bearer {token}
```

#### Request Body
```json
{
    "order_id": "order_123456",
    "amount": 199.90,
    "customer_info": {
        "name": "John Doe",
        "email": "john@example.com",
        "cpf": "123.456.789-00"
    }
}
```

#### Success Response (200)
```json
{
    "success": true,
    "pix_data": {
        "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        "copy_paste": "00020126860014BR.GOV.BCB.PIX...",
        "amount": 199.90,
        "expires_at": "2024-01-09T12:00:00.000Z"
    }
}
```

---

### Check Payment Status
**GET** `/api/basic/pix/status/{order_id}`

Check status of PIX payment.

#### Headers
```
Authorization: Bearer {token}
```

#### Success Response (200)
```json
{
    "status": "paid",
    "order_id": "order_123456",
    "amount": 199.90,
    "paid_at": "2024-01-09T11:30:00.000Z"
}
```

---

## 📦 Order Management Endpoints

### Get All Orders
**GET** `/api/infos`

Retrieve all orders (admin only).

#### Headers
```
Authorization: Bearer {admin_token}
```

#### Success Response (200)
```json
[
    {
        "_id": "659d1a2b3c4d5e6f7a8b9c0d",
        "user_id": 123,
        "customer_info": {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+5511999999999",
            "address": {
                "street": "Rua Exemplo",
                "number": "123",
                "city": "São Paulo",
                "state": "SP",
                "zip_code": "01234-567"
            }
        },
        "items": [
            {
                "product_id": "prod_123",
                "title": "Camiseta Básica",
                "quantity": 2,
                "price": 49.90,
                "subtotal": 99.80
            }
        ],
        "total_amount": 99.80,
        "status": "processing",
        "payment_method": "pix",
        "pix_qr_code": "data:image/png;base64,...",
        "pix_copy_paste": "00020126860014BR.GOV.BCB.PIX...",
        "created_at": "2024-01-09T10:00:00.000Z",
        "updated_at": "2024-01-09T10:30:00.000Z"
    }
]
```

---

### Create New Order
**POST** `/api/infos`

Create a new order.

#### Headers
```
Authorization: Bearer {token}
```

#### Request Body
```json
{
    "customer_info": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+5511999999999",
        "address": {
            "street": "Rua Exemplo",
            "number": "123",
            "complement": "Apto 101",
            "neighborhood": "Centro",
            "city": "São Paulo",
            "state": "SP",
            "zip_code": "01234-567"
        }
    },
    "items": [
        {
            "product_id": "659d1a2b3c4d5e6f7a8b9c0d",
            "quantity": 2,
            "price": 49.90
        }
    ],
    "total_amount": 99.80,
    "payment_method": "pix"
}
```

#### Success Response (201)
```json
{
    "_id": "659d1a2b3c4d5e6f7a8b9c0e",
    "user_id": 123,
    "customer_info": { /* customer data */ },
    "items": [ /* order items */ ],
    "total_amount": 99.80,
    "status": "pending",
    "payment_method": "pix",
    "pix_qr_code": "data:image/png;base64,...",
    "pix_copy_paste": "00020126860014BR.GOV.BCB.PIX...",
    "created_at": "2024-01-09T10:00:00.000Z"
}
```

---

### Update Order Status
**PUT** `/api/infos/{id}/status`

Update order status (admin only).

#### Headers
```
Authorization: Bearer {admin_token}
```

#### Request Body
```json
{
    "status": "shipped"
}
```

#### Success Response (200)
```json
{
    "success": true,
    "message": "Order status updated",
    "order": {
        "_id": "659d1a2b3c4d5e6f7a8b9c0d",
        "status": "shipped",
        "updated_at": "2024-01-09T11:00:00.000Z"
    }
}
```

---

### Delete Order
**DELETE** `/api/infos/{id}`

Delete order (admin only).

#### Headers
```
Authorization: Bearer {admin_token}
```

#### Success Response (200)
```json
{
    "message": "Order deleted successfully"
}
```

---

## 📊 Stock Management Endpoints

### Get Stock Information
**GET** `/api/infos/stock/fetch`

Retrieve stock data for all products.

#### Headers
```
Authorization: Bearer {admin_token}
```

#### Success Response (200)
```json
[
    {
        "_id": "659d1a2b3c4d5e6f7a8b9c0d",
        "product_id": "camiseta_branca",
        "variant": "P",
        "current_stock": 20,
        "reserved_stock": 2,
        "incoming_stock": 30,
        "available_stock": 18,
        "last_updated": "2024-01-09T10:00:00.000Z"
    }
]
```

---

### Sync Stock for Order
**PUT** `/api/infos/stock/sync-order`

Deduct stock when order is confirmed.

#### Headers
```
Authorization: Bearer {admin_token}
```

#### Request Body
```json
{
    "order_id": "order_123456",
    "items": [
        {
            "product_id": "camiseta_branca",
            "variant": "P",
            "quantity": 2
        }
    ]
}
```

#### Success Response (200)
```json
{
    "success": true,
    "message": "Stock synchronized successfully",
    "updated_items": [
        {
            "product_id": "camiseta_branca",
            "variant": "P",
            "previous_stock": 20,
            "new_stock": 18,
            "reserved": 2
        }
    ]
}
```

---

### Reverse Stock for Order
**PUT** `/api/infos/stock/reverse-order`

Return stock when order is canceled.

#### Headers
```
Authorization: Bearer {admin_token}
```

#### Request Body
```json
{
    "order_id": "order_123456"
}
```

#### Success Response (200)
```json
{
    "success": true,
    "message": "Stock reversed successfully"
}
```

---

### Update Stock Manually
**PUT** `/api/infos/stock/{id}/update`

Manually update stock quantity.

#### Headers
```
Authorization: Bearer {admin_token}
```

#### Request Body
```json
{
    "quantity": 25,
    "operation": "set"  // or "add" or "subtract"
}
```

#### Success Response (200)
```json
{
    "success": true,
    "message": "Stock updated successfully",
    "stock_item": {
        "_id": "659d1a2b3c4d5e6f7a8b9c0d",
        "current_stock": 25,
        "available_stock": 23
    }
}
```

---

### Get Low Stock Items
**GET** `/api/infos/stock/low-stock`

Get products with low stock levels.

#### Headers
```
Authorization: Bearer {admin_token}
```

#### Query Parameters
- `threshold` (optional): Minimum stock level (default: 10)

#### Success Response (200)
```json
{
    "low_stock_items": [
        {
            "product_id": "camiseta_branca",
            "variant": "P",
            "current_stock": 5,
            "threshold": 10
        }
    ],
    "total_low_stock": 1
}
```

---

## 📍 Address Management Endpoints

### Get User Addresses
**GET** `/api/basic/addresses`

Retrieve user's saved addresses.

#### Headers
```
Authorization: Bearer {token}
```

#### Success Response (200)
```json
[
    {
        "id": 1,
        "user_id": 123,
        "name": "Casa",
        "recipient": "John Doe",
        "phone": "+5511999999999",
        "street": "Rua Exemplo",
        "number": "123",
        "complement": "Apto 101",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01234-567",
        "is_default": true,
        "created_at": "2024-01-09T10:00:00.000Z"
    }
]
```

---

### Create New Address
**POST** `/api/basic/addresses`

Add new address for user.

#### Headers
```
Authorization: Bearer {token}
```

#### Request Body
```json
{
    "name": "Trabalho",
    "recipient": "John Doe",
    "phone": "+5511999999999",
    "street": "Av. Paulista",
    "number": "1000",
    "complement": "Conjunto 501",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01310-100",
    "is_default": false
}
```

#### Success Response (201)
```json
{
    "id": 2,
    "user_id": 123,
    "name": "Trabalho",
    "recipient": "John Doe",
    "phone": "+5511999999999",
    "street": "Av. Paulista",
    "number": "1000",
    "is_default": false,
    "created_at": "2024-01-09T11:00:00.000Z"
}
```

---

### Update Address
**PUT** `/api/basic/addresses/{id}`

Update existing address.

#### Headers
```
Authorization: Bearer {token}
```

#### Request Body
```json
{
    "name": "Escritório",
    "phone": "+5511888888888"
}
```

#### Success Response (200)
```json
{
    "id": 2,
    "name": "Escritório",
    "phone": "+5511888888888",
    "updated_at": "2024-01-09T12:00:00.000Z"
}
```

---

### Delete Address
**DELETE** `/api/basic/addresses/{id}`

Remove address.

#### Headers
```
Authorization: Bearer {token}
```

#### Success Response (200)
```json
{
    "message": "Address deleted successfully"
}
```

---

## 🔧 Utility Endpoints

### Upload File
**POST** `/api/basic/upload`

Upload image files.

#### Headers
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

#### Form Data
```
image: (file)
folder: products  (optional)
```

#### Success Response (200)
```json
{
    "success": true,
    "path": "uploads/products/image_123456.jpg",
    "url": "http://localhost:8000/storage/uploads/products/image_123456.jpg"
}
```

---

### Password Reset - Send Link
**POST** `/api/forgot-password`

Send password reset email.

#### Request Body
```json
{
    "email": "john@example.com"
}
```

#### Success Response (200)
```json
{
    "message": "Password reset link sent to your email"
}
```

---

### Password Reset - Reset Password
**POST** `/api/reset-password`

Reset user password.

#### Request Body
```json
{
    "token": "reset_token_here",
    "email": "john@example.com",
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
}
```

#### Success Response (200)
```json
{
    "message": "Password reset successfully"
}
```

---

### Resend Email Verification
**POST** `/api/email/verification-resend`

Resend email verification link.

#### Request Body
```json
{
    "email": "john@example.com"
}
```

#### Success Response (200)
```json
{
    "message": "Email de verificação reenviado!"
}
```

---

## 📞 Error Responses

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error - Server error |

### Standard Error Response Format
```json
{
    "error": "Error message",
    "message": "Detailed error description"
}
```

### Validation Error Response
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "field_name": ["Error message 1", "Error message 2"]
    }
}
```

---

## 🛠️ API Testing Examples

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:8000/api/basic/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Get Products:**
```bash
curl -X GET http://localhost:8000/api/products
```

**Add to Cart:**
```bash
curl -X POST http://localhost:8000/api/basic/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"product_id":"659d1a2b3c4d5e6f7a8b9c0d","quantity":2}'
```

### Using JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('/api/basic/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123'
    })
});

const loginData = await loginResponse.json();
const token = loginData.token;

// Get products with auth
const productsResponse = await fetch('/api/products', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
const products = await productsResponse.json();

// More comprehensive fetch example with error handling
const makeAuthenticatedRequest = async (url, options = {}) => {
    // Get CSRF token
    await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include'
    });
    
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
    
    const response = await fetch(url, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
            ...options.headers
        },
        ...options
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
};
```

### Using Fetch with Utility Functions

```javascript
// Create a utility function for API calls
const apiCall = async (endpoint, options = {}) => {
    const baseUrl = 'http://localhost:8000/api';
    const url = `${baseUrl}${endpoint}`;
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API Error');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Usage examples
try {
    // GET request
    const products = await apiCall('/products');
    console.log(products);
    
    // POST request with auth
    const newProduct = await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify({
            title: 'New Product',
            price: 99.99
        })
    });
    
    // PUT request
    const updatedProduct = await apiCall(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({
            title: 'Updated Title'
        })
    });
    
} catch (error) {
    console.error('Request failed:', error.message);
}

---

*API Documentation Last Updated: January 9, 2026*
*API Version: v1.0*