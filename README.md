# 🛒 Microservices-Based E-commerce Platform Backend

A scalable, modular e-commerce backend built using the **MERN ecosystem** and a microservices architecture. The platform separates authentication, product management, and order processing into independent services, with a centralized API Gateway and MongoDB for data persistence.

<!-- Technology Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm" />
</p>

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Future Improvements](#-future-improvements)
- [Important Limitations](#-important-limitations)
- [License](#-license)

## 📌 Overview

This project demonstrates how to structure an e-commerce backend using **microservices** instead of a single monolithic application.

Each service has a specific responsibility and can be developed, maintained, and deployed independently.

The API Gateway provides a single entry point for client requests and forwards them to the appropriate backend service.

### Key Highlights

- Microservices-based backend architecture
- RESTful APIs using Node.js and Express.js
- MongoDB with separate logical databases for each service
- JWT-based authentication
- Password hashing using bcrypt
- Product catalog management
- Order creation and order history
- Inter-service communication using HTTP
- Dockerized services with Docker Compose

## 🏗️ Architecture

```text
                    Client / Postman
                           |
                           v
                  +-------------------+
                  |    API Gateway    |
                  |     Port 8080     |
                  +-------------------+
                     /      |      \
                    /       |       \
                   v        v        v
             +---------+ +---------+ +---------+
             |  Auth   | | Product | |  Order  |
             | Service | | Service | | Service |
             |  :4001  | |  :4002  | |  :4003  |
             +---------+ +---------+ +---------+
                  |           |          |
                  v           v          v
             +---------+ +---------+ +---------+
             |  Auth   | | Product | |  Order  |
             | Database| | Database| | Database|
             +---------+ +---------+ +---------+

                 Order Service
                       |
                       | HTTP product lookup
                       v
                 Product Service
```

### Services

| Service | Port | Responsibility |
|---|---:|---|
| API Gateway | 8080 | Routes incoming API requests |
| Auth Service | 4001 | Registration, login, and JWT issuance |
| Product Service | 4002 | Product listing and administration |
| Order Service | 4003 | Order creation and order history |
| MongoDB | 27017 | Persistent data storage |

Each service uses its own logical MongoDB database:

- `ecommerce_auth`
- `ecommerce_products`
- `ecommerce_orders`

## ✨ Features

### 🔐 Authentication Service

- User registration and login
- Password hashing with bcrypt
- JWT access tokens
- Email validation
- Duplicate email detection
- Token expiration

### 📦 Product Service

- Create products (admin only)
- Retrieve a single product
- List and search products
- Pagination
- Filter products by category
- Update product information (admin only)
- Soft-delete products (admin only)
- Product price and stock validation

### 🛍️ Order Service

- Create orders for authenticated users
- Validate product IDs and quantities
- Retrieve product details from the Product Service
- Calculate order totals
- Check available stock before order creation
- Retrieve a customer's order history
- Retrieve an individual order belonging to the authenticated customer

### 🌐 API Gateway

- Single entry point for backend APIs
- Routes requests to the relevant service
- Simplifies client-side API integration

### 🐳 Docker Support

- Separate Dockerfiles for each service
- Docker Compose orchestration
- Shared MongoDB container
- Persistent MongoDB volume

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | NoSQL database |
| Mongoose | MongoDB object modeling |
| JavaScript | Application programming language |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| Axios | HTTP communication between services |
| http-proxy-middleware | API Gateway routing |
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| npm | Dependency management |

## 📁 Project Structure

```text
microservices-ecommerce/
│
├── api-gateway/
│   ├── src/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── auth-service/
│   ├── src/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── product-service/
│   ├── src/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── order-service/
│   ├── src/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── docs/
│   └── architecture.md
│
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Install the following tools:

- [Node.js](https://nodejs.org/) 20 or later
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)
- [Postman](https://www.postman.com/) or another HTTP client

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd microservices-ecommerce
```

Replace `<your-repository-url>` with your actual GitHub repository URL.

### 2. Configure Environment Variables

For local development, copy the example environment file.

**Windows Command Prompt:**

```cmd
copy .env.example .env
```

**PowerShell:**

```powershell
Copy-Item .env.example .env
```

Update the values as needed. Never commit your real secrets to GitHub.

### 3. Start the Backend

Make sure Docker Desktop is running, then execute:

```bash
docker compose up --build
```

Docker Compose will build the four services, start MongoDB, and connect the services through the configured Docker network.

### 4. Verify the API Gateway

Open this URL in your browser:

```text
http://localhost:8080/health
```

Expected response:

```json
{
  "service": "api-gateway",
  "status": "ok"
}
```

### 5. Stop the Services

```bash
docker compose down
```

To remove the MongoDB volume and its stored data as well:

```bash
docker compose down -v
```

**Warning:** The second command deletes the project's persisted database data.

## ⚙️ Environment Variables

| Variable | Description | Default for Docker |
|---|---|---|
| `PORT` | Port used by each service | Service-specific |
| `MONGO_URL` | MongoDB connection URL | `mongodb://mongo:27017` |
| `JWT_SECRET` | Secret used to sign and verify tokens | `dev-only-change-me` |
| `AUTH_URL` | Auth Service URL used by the Gateway | `http://auth-service:4001` |
| `PRODUCT_URL` | Product Service URL | `http://product-service:4002` |
| `ORDER_URL` | Order Service URL | `http://order-service:4003` |

The Order Service also uses `PRODUCT_URL` to retrieve product information.

> **Security:** The default JWT secret is for local development only. Replace it with a strong, randomly generated secret before any deployment. Keep secrets out of source control.

## 🔌 API Endpoints

All requests below use the API Gateway base URL:

```text
http://localhost:8080
```

### Authentication APIs

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/auth/register` | Register a user | Not required |
| POST | `/api/auth/login` | Log in a user | Not required |

**Register a user**

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Asha",
  "email": "asha@example.com",
  "password": "StrongPass123!"
}
```

**Log in**

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "asha@example.com",
  "password": "StrongPass123!"
}
```

The response includes a JWT token that can be used for authenticated requests.

### Product APIs

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/api/products` | List products | Not required |
| GET | `/api/products/:id` | Get a product by ID | Not required |
| POST | `/api/products` | Create a product | Admin |
| PATCH | `/api/products/:id` | Update a product | Admin |
| DELETE | `/api/products/:id` | Soft-delete a product | Admin |

**List products**

```http
GET /api/products?page=1&limit=20
```

**Search products**

```http
GET /api/products?q=keyboard
```

**Filter by category**

```http
GET /api/products?category=Accessories
```

**Create a product**

```http
POST /api/products
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

```json
{
  "name": "Mechanical Keyboard",
  "description": "Compact mechanical keyboard",
  "price": 79.99,
  "stock": 20,
  "category": "Accessories"
}
```

The product-management endpoints require an authenticated user with the `admin` role. The registration endpoint creates customer accounts by default; an admin account must be provisioned securely for administration.

### Order APIs

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/orders` | Create an order | Required |
| GET | `/api/orders` | Retrieve your orders | Required |
| GET | `/api/orders/:id` | Retrieve one of your orders | Required |

**Create an order**

```http
POST /api/orders
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

```json
{
  "items": [
    {
      "productId": "<PRODUCT_ID>",
      "quantity": 2
    }
  ]
}
```

Replace `<PRODUCT_ID>` with the ID of an existing product.

**Retrieve your orders**

```http
GET /api/orders
Authorization: Bearer <JWT_TOKEN>
```

The Order Service associates orders with the authenticated user's ID.

## 🔑 Authentication

The authentication flow works as follows:

1. A user registers or logs in through the Auth Service.
2. The service verifies the credentials and issues a signed JWT.
3. The client sends the token in the `Authorization` header.
4. Protected services verify the token and use its claims to authorize requests.

Example header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Tokens expire after two hours in this starter implementation. Refresh-token rotation, password reset, email verification, and other account-management features are not yet implemented.

## 🔮 Future Improvements

Potential enhancements for a more complete, production-oriented platform:

- Inventory Service with atomic stock reservation
- Payment Service with a payment-provider sandbox
- Cart Service and persistent shopping carts
- Redis caching
- RabbitMQ or Kafka for asynchronous events
- Saga pattern and transactional outbox
- Refresh tokens and token rotation
- Role-based authorization improvements
- Rate limiting and request validation
- Centralized logging and distributed tracing
- Unit and integration tests
- API documentation using Swagger / OpenAPI
- CI/CD pipeline using GitHub Actions
- Deployment to a cloud platform
- Monitoring, metrics, and health checks for all services

## ⚠️ Important Limitations

This repository is a learning and portfolio starter, not a production-ready e-commerce system.

- **Inventory:** Orders check stock but do not reserve or decrement inventory. Concurrent orders can oversell.
- **Payments:** No payment processing or payment verification is implemented.
- **Distributed consistency:** Product lookup and order creation are separate operations without a distributed transaction.
- **Authorization:** Admin product management requires an admin JWT, but a secure admin provisioning workflow is not included.
- **Production security:** Rate limiting, comprehensive validation, secret management, and automated security testing still need to be added.
- **Testing:** Automated test suites are not included yet.

Do not use this starter to process real payments or sensitive customer data without implementing and reviewing the required production safeguards.

## 📄 License

This project is available under the MIT License if you choose to distribute it under those terms. Add a `LICENSE` file to the repository before presenting it as an officially MIT-licensed project.

## 👨‍💻 Author

**Ajinkya Dhatrak**

GitHub: [ajinkya029](https://github.com/ajinkya029)

---

**Built with Node.js, Express.js, and MongoDB.**