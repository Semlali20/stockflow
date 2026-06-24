# StockFlow

A fullstack inventory management system built with a Spring Boot microservices backend, React/TypeScript frontend, and Flutter mobile app.

## Architecture overview

```
                        ┌─────────────────┐
  Browser / Mobile ────▶│   API Gateway   │ :8080
                        │  (Spring Cloud) │
                        └────────┬────────┘
                                 │ routes to
          ┌──────────────────────┼──────────────────────┐
          │                      │                       │
  ┌───────▼──────┐   ┌───────────▼───────┐   ┌──────────▼───────┐
  │ auth-service │   │ product-service   │   │ inventory-service │
  │    :8083     │   │     :8082         │   │     :8086         │
  └──────────────┘   └───────────────────┘   └──────────────────┘
  ┌───────────────┐   ┌──────────────────┐   ┌──────────────────┐
  │location-svc   │   │ movement-service │   │  alert-service   │
  │    :8085      │   │     :8084        │   │     :8088        │
  └───────────────┘   └──────────────────┘   └──────────────────┘
  ┌───────────────┐   ┌──────────────────┐
  │purchase-svc   │   │  sales-service   │
  │    :8089      │   │     :8090        │
  └───────────────┘   └──────────────────┘

  Infrastructure: Kafka · Zookeeper · Redis · PostgreSQL (one DB per service)
```

### Services

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| api-gateway | 8080 | — | JWT validation, routing, CORS |
| auth-service | 8083 | postgres-user :5437 | Login, JWT issuance, RBAC, users & roles |
| product-service | 8082 | postgres-product :5432 | Items, categories, item variants |
| inventory-service | 8086 | postgres-inventory :5433 | Stock levels, lots, serials |
| location-service | 8085 | postgres-location :5435 | Sites, warehouses, locations |
| movement-service | 8084 | postgres-movement :5434 | Stock movements (receipts, transfers, issues) |
| alert-service | 8088 | postgres-alert :5436 | Low-stock and system alerts |
| purchase-service | 8089 | postgres-purchase :5438 | Suppliers, purchase orders |
| sales-service | 8090 | postgres-sales :5439 | Customers, quotes, delivery notes |
| config-server | 8888 | — | Centralised Spring Cloud config |

Inter-service events are published over **Apache Kafka** (topic per domain). The api-gateway validates JWT signatures using the auth-service JWKS endpoint.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3, Spring Cloud Gateway, Spring Security, Spring Data JPA |
| Messaging | Apache Kafka + Zookeeper |
| Cache | Redis |
| Database | PostgreSQL 15 (isolated per service) |
| Frontend | React 18, TypeScript, Vite, TailwindCSS, React Query |
| Mobile | Flutter / Dart |
| API docs | SpringDoc OpenAPI (Swagger UI per service) |
| Testing | Playwright 182 E2E tests (mocked + real backend + fullstack) |
| Containers | Docker, Docker Compose |

---

## Prerequisites

- **Docker & Docker Compose** v2+
- **Java 17+** (for running services locally without Docker)
- **Node.js 18+** and **npm** (for the frontend)
- **Flutter SDK 3+** (for the mobile app)
- **Maven 3.8+** (for building Java services)

---

## Quick start with Docker Compose

```bash
# Clone the repo
git clone <repo-url>
cd stockflow

# Start all infrastructure + services
cd docker-compose
docker compose up -d

# Check everything is up
docker compose ps
```

Wait ~60 seconds for all services to become healthy (Kafka takes the longest). Then open:

- **Frontend** → http://localhost:3000
- **API Gateway** → http://localhost:8080
- **Swagger UI (product-service)** → http://localhost:8082/swagger-ui.html

Default admin credentials:

```
Username: admin
Password: Admin@123
```

---

## Local development (without Docker)

### 1 — Start infrastructure only

```bash
cd docker-compose
docker compose up -d zookeeper kafka postgres-product postgres-inventory postgres-movement postgres-location postgres-user postgres-alert postgres-purchase postgres-sales redis
```

### 2 — Start backend services

Each service is a standard Spring Boot app. Run them in order (auth-service first, then the rest in any order):

```bash
# Example for auth-service
cd auth-service
mvn spring-boot:run

# Repeat for each service directory:
# product-service, inventory-service, location-service,
# movement-service, alert-service, purchase-service,
# sales-service, api-gateway
```

Or build and run a JAR:

```bash
cd product-service
mvn clean package -DskipTests
java -jar target/product-service-*.jar
```

### 3 — Start the frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

The Vite dev server proxies `/api/*` → `http://localhost:8080` automatically.

### 4 — Mobile app (optional)

```bash
cd stockflow_mobile
flutter pub get
flutter run
```

---

## Project structure

```
stockflow/
├── api-gateway/          # Spring Cloud Gateway — entry point for all clients
├── auth-service/         # Authentication, JWT, RBAC (43 granular permissions)
├── product-service/      # Items, categories, item variants
├── inventory-service/    # Stock levels, lots (batch tracking), serials
├── location-service/     # Sites, warehouses, bin locations
├── movement-service/     # Receipt / transfer / issue movements
├── alert-service/        # Low-stock alerts, notifications
├── purchase-service/     # Supplier management, purchase orders
├── sales-service/        # Customer management, quotes, delivery notes
├── common-lib/           # Shared DTOs and utilities
├── config-server/        # Spring Cloud Config Server
├── frontend/             # React + TypeScript SPA (32 pages, 67 components)
│   └── e2e/              # 182 Playwright E2E tests
├── stockflow_mobile/     # Flutter mobile app (49 screens)
└── docker-compose/       # docker-compose.yml for full stack
```

---

## API documentation

Each service exposes a Swagger UI at `/swagger-ui.html`:

| Service | Swagger UI |
|---------|-----------|
| auth-service | http://localhost:8083/swagger-ui.html |
| product-service | http://localhost:8082/swagger-ui.html |
| inventory-service | http://localhost:8086/swagger-ui.html |
| location-service | http://localhost:8085/swagger-ui.html |
| movement-service | http://localhost:8084/swagger-ui.html |
| alert-service | http://localhost:8088/swagger-ui.html |
| purchase-service | http://localhost:8089/swagger-ui.html |
| sales-service | http://localhost:8090/swagger-ui.html |

All list endpoints return a paginated response:

```json
{
  "content": [...],
  "totalElements": 42,
  "totalPages": 3,
  "size": 20,
  "number": 0
}
```

Common query parameters: `page`, `size`, `sort` (e.g. `?page=0&size=20&sort=name,asc`).

---

## Authentication

The API uses **JWT Bearer tokens**. To authenticate:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail": "admin", "password": "Admin@123"}'
```

Response:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "...", "username": "admin", "roles": ["ADMIN"] }
}
```

Use the `accessToken` as a Bearer header on all subsequent requests:

```bash
curl http://localhost:8080/api/items \
  -H "Authorization: Bearer eyJ..."
```

Refresh an expired token:

```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJ..."}'
```

---

## Running the tests

### E2E tests (Playwright)

The test suite has 182 tests across 11 spec files. Specs 01–09 use mocked API responses and run without the backend. Specs 10–11 require the real backend running on port 8080.

```bash
cd frontend
npm install

# Run all tests (requires backend on :8080 for specs 10-11)
npx playwright test

# Run only mocked frontend tests (no backend needed)
npx playwright test e2e/01 e2e/02 e2e/03 e2e/04 e2e/05 e2e/06 e2e/07 e2e/08 e2e/09

# Run with UI
npx playwright test --ui

# Run a specific spec
npx playwright test e2e/10-backend-api.spec.ts
```

| Spec file | Tests | Requires backend |
|-----------|-------|-----------------|
| 01-auth | 10 | No |
| 02-dashboard | 8 | No |
| 03-inventory | 8 | No |
| 04-products | 10 | No |
| 05-movements | 10 | No |
| 06-locations | 10 | No |
| 07-purchase | 10 | No |
| 08-sales | 12 | No |
| 09-alerts-profile-settings | 16 | No |
| 10-backend-api | 55 | **Yes** |
| 11-fullstack | 33 | **Yes** |

---

## Environment variables

### Backend services

Each service reads configuration from `src/main/resources/application.yml`. Key variables for production deployment:

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL | per-service localhost URL |
| `SPRING_KAFKA_BOOTSTRAP_SERVERS` | Kafka broker address | `localhost:9092` |
| `JWT_JWKS_URL` | Auth-service JWKS endpoint (api-gateway) | `http://localhost:8083/.well-known/jwks.json` |
| `SPRING_REDIS_HOST` | Redis host | `localhost` |

### Frontend

Create `frontend/.env.local` to override the API base URL:

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## Features

- **Inventory tracking** — real-time stock levels per warehouse, lot tracking, serial number tracking
- **Multi-site** — sites, warehouses, bin locations with full hierarchy
- **Movements** — receipts, inter-warehouse transfers, issues with full audit trail
- **Purchase** — supplier management, purchase orders, reception workflow
- **Sales** — customer management, quotes (DRAFT → SENT → CONFIRMED → CONVERTED), delivery notes
- **Alerts** — configurable low-stock alerts, acknowledgement workflow
- **RBAC** — role-based access with 43 granular permissions, admin and custom roles
- **Dark mode** — full dark/light theme support in the frontend
- **Mobile** — Flutter app covering all major workflows (49 screens)
