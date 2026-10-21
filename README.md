# 🔄 Looping — Modern E-Commerce Platform

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Ready-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

**Looping** is a full-stack, enterprise-grade e-commerce application engineered with a **React 19** frontend, **Laravel 12** REST API, a dedicated **Node.js/Express SSR** service, and a hybrid database architecture combining **MySQL** (for relational transactions and user profiles) and **MongoDB** (for dynamic, high-performance catalog management).

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option A: Running with Docker (Recommended)](#option-a-running-with-docker-recommended)
  - [Option B: Running Locally with Script / CLI](#option-b-running-locally-with-script--cli)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [License](#-license)

---

## 🌟 Overview

Looping provides an end-to-end e-commerce experience tailored for scalability and developer ergonomics:
- **Hybrid Storage Strategy**: High-concurrency catalog queries backed by MongoDB; orders, authentications, addresses, and relational records handled by MySQL.
- **Multiple Payment Gateways**: Integrated Pix, Boleto, and card checkout flows.
- **Microservice-ready Design**: Fully decoupled client (`looping-client`), backend engine (`looping-server`), and SSR service (`looping-ssr`).

---

## 🚀 Key Features

### 🛍️ Customer Experience
- **Dynamic Catalog & Search**: Instant full-text product search, category filtering, and real-time inventory checks.
- **Interactive Cart & Wishlist**: Persistent cart state, promo codes, and streamlined checkout workflow.
- **Integrated Payments**: Support for instant **Pix (QR code & Copy-Paste)**, **Boleto Bancário**, and card processing.
- **Account & Orders**: Order history, order tracking, address book, and profile management with email verification.

### 🛡️ Administration & Operations
- **Stock Management**: Automated stock deduction and restoration upon order cancellation or timeout.
- **Catalog Control**: Create, update, toggle flash sales, and manage multi-variant products.
- **Order Dispatch**: Real-time order fulfillment, delivery statuses, and customer insights.

---

## 🏗️ System Architecture

```text
               ┌────────────────────────────────────────────────────────┐
               │                     Web Browser                        │
               └───────────────┬────────────────────────┬───────────────┘
                               │                        │
                    Port 3002 / 3000                 Port 8888
                               │                        │
                               ▼                        ▼
                     ┌──────────────────┐     ┌──────────────────┐
                     │   React Client   │────▶│  Nginx / Laravel │
                     │  (Vite + SPA)    │     │   API Backend    │
                     └──────────────────┘     └─────────┬────────┘
                                                        │
                                         ┌──────────────┴──────────────┐
                                         ▼                             ▼
                               ┌──────────────────┐          ┌──────────────────┐
                               │   MySQL 8.0+     │          │   MongoDB 6.0+   │
                               │  Users, Orders,  │          │ Product Catalog, │
                               │  Transactions    │          │ Attributes, Logs │
                               └──────────────────┘          └──────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TailwindCSS, React Router 7, React Icons, Vitest |
| **Backend** | Laravel 12.x, PHP 8.2+, Laravel Sanctum, PHPUnit |
| **SSR Engine** | Node.js, Express, Inertia.js React, TSX |
| **Databases** | MySQL 9.1 / 8.0+, MongoDB 8.2 / 6.0+ |
| **DevOps / Tools** | Docker Compose, Nginx, Composer, npm |

---

## ⚡ Getting Started

### Prerequisites

Ensure you have installed:
- [Git](https://git-scm.com/)
- [Docker & Docker Compose](https://www.docker.com/) *(for Docker setup)*
- [PHP 8.2+](https://www.php.net/) & [Composer](https://getcomposer.org/) *(for manual setup)*
- [Node.js 18+](https://nodejs.org/) & [npm](https://npmjs.com)

---

### Option A: Running with Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/looping.git
   cd looping
   ```

2. **Configure environment files:**
   ```bash
   # Server environment
   cp looping-server/.env.example looping-server/.env
   
   # Client environment (if applicable)
   cp looping-client/.env.example looping-client/.env
   ```

3. **Build and spin up the containers:**
   ```bash
   docker compose up --build -d
   ```

4. **Access the services:**
   - **Frontend:** [http://localhost:3002](http://localhost:3002)
   - **Backend API:** [http://localhost:8888](http://localhost:8888)
   - **SSR Service:** [http://localhost:3003](http://localhost:3003)
   - **MySQL:** `localhost:3308`
   - **MongoDB:** `localhost:27018`

---

### Option B: Running Locally on Windows with Batch Script (`looping.bat`)

The repository includes a ready-to-run automation script [`looping.bat`](file:///looping.bat) that coordinates and opens all services in separate terminal windows with a single command:

1. **First-time dependency setup:**
   ```bash
   # Install backend dependencies
   cd looping-server
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   cd ..

   # Install frontend dependencies
   cd looping-client
   npm install
   cd ..

   # Install SSR dependencies
   cd looping-ssr
   npm install
   cd ..
   ```

2. **Execute the batch script:**
   - Double click `looping.bat` in File Explorer, or
   - Run in PowerShell / CMD:
     ```cmd
     .\looping.bat
     ```

#### What `looping.bat` does automatically:
- 🐘 **Starts WAMP Server** with Administrator privileges (Apache & MySQL service).
- 🍃 **Launches Mongo Shell (`mongosh`)** connected to the local MongoDB database (`looping`).
- ⚡ **Starts the Laravel API server** on `http://localhost:8888`.
- ⚛️ **Starts the React Client (Vite)** dev server on `http://localhost:3000`.
- 🌐 **Starts the Node SSR engine** dev server on `http://localhost:3001`.

---

### Option C: Running Services Manually via CLI

If you prefer full terminal control over each process individually:

```bash
# 1. Start Laravel Backend (Port 8888)
cd looping-server
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8888

# 2. Start React Frontend (Port 3000 / Vite dev)
cd ../looping-client
npm install
npm run dev

# 3. Start SSR Node Service (Port 3001)
cd ../looping-ssr
npm install
npm run dev
```

---

## 🔐 Environment Variables

Make sure to set up your `.env` files. Sensitive credentials are kept out of source control.

Key variables in `looping-server/.env`:
```ini
APP_NAME=Looping
APP_ENV=local
APP_KEY=base64:...
APP_URL=http://localhost:8888

# MySQL Connection
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3308
DB_DATABASE=looping
DB_USERNAME=root
DB_PASSWORD=your_password

# MongoDB Connection
MONGO_DB_HOST=127.0.0.1
MONGO_DB_PORT=27018
MONGO_DB_DATABASE=looping
MONGO_DB_USERNAME=admin
MONGO_DB_PASSWORD=your_password
```

---

## 📂 Project Structure

```text
Looping/
├── docker/                 # Nginx, PHP, React & Node Docker configurations
├── docker-compose.yml      # Multi-container orchestration definition
├── DOCUMENTATION/          # In-depth architectural & API specifications
├── looping-client/         # React 19 Frontend SPA (Vite)
│   ├── src/components/     # UI, Admin dashboard, Checkout, User tabs
│   └── tests/              # Vitest test suites
├── looping-server/         # Laravel 12 API Engine
│   ├── app/Http/           # Controllers, Middlewares, Requests
│   ├── app/Services/       # Stock, Payment & Queue Services
│   └── tests/              # PHPUnit Feature & Unit tests
├── looping-ssr/            # Express & React SSR microservice
└── looping.bat             # Quick launch script for Windows local dev
```

---

## 🧪 Testing

### Backend Tests (PHPUnit)
```bash
cd looping-server
php artisan test
```

### Frontend Tests (Vitest)
```bash
cd looping-client
npm run test
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
