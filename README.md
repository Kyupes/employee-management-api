# Employee Management API

A REST API built with Node.js, Express, TypeScript, PostgreSQL, and Redis as part of a self-directed backend engineering roadmap.

The project focuses on backend fundamentals: HTTP APIs, layered architecture, authentication and authorization, relational data, validation, automated testing, caching, documentation, migrations, and containerization. It is a learning project intended to run locally rather than a service planned for public deployment.

> AI assistance was used as a mentoring tool for architectural reviews, concept explanations, and guidance. The application logic, implementation, debugging, and architectural decisions were developed manually.

## Features

- Employee CRUD operations with ownership-aware access.
- Search, filtering, and pagination using dynamic parameterized SQL.
- PostgreSQL aggregations for employee and salary statistics.
- JWT authentication with registration and login endpoints.
- Role-based authorization, including admin-only deletion.
- Runtime request and environment validation with Zod.
- Centralized application errors and consistent JSON error responses.
- Redis cache-aside reads for employee lists and individual employees.
- Versioned cache invalidation after create, update, and delete operations.
- Graceful PostgreSQL and Redis connection shutdown.
- Version-controlled PostgreSQL migrations and database seeding.
- OpenAPI generation from Zod schemas with Swagger UI in non-production environments.
- Unit tests with mocked dependencies and integration tests against a real test database.
- A multi-stage Docker image and Docker Compose stack for the API, PostgreSQL, and Redis.

## Technology Stack

- **Runtime:** Node.js 22 in Docker
- **Framework:** Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL 16 and `node-postgres`
- **Cache:** Redis and `node-redis`
- **Validation:** Zod
- **Authentication:** JSON Web Tokens and bcrypt
- **Database migrations:** node-pg-migrate
- **API documentation:** OpenAPI, zod-to-openapi, and Swagger UI
- **Testing:** Vitest and Supertest
- **Containerization:** Docker and Docker Compose

## Architecture

```text
HTTP request
    ↓
Authentication / authorization
    ↓
Zod validation middleware
    ↓
Controllers
    ↓
Services ─────────── Redis cache
    ↓
Repositories
    ↓
PostgreSQL

Errors from the request pipeline
    ↓
Global error handler
```

### Layer responsibilities

- **Middleware:** Authenticates users, enforces roles, validates request input, and attaches validated data to the request.
- **Controllers:** Translate HTTP requests into service calls and return the appropriate status codes and response bodies.
- **Services:** Apply business rules, coordinate repositories, and manage cache-aside reads and invalidation.
- **Repositories:** Own SQL queries and PostgreSQL access without containing HTTP concerns.
- **Cache services:** Serialize cached values, manage version metadata, and degrade to PostgreSQL when Redis is unavailable.
- **Global error handler:** Converts application and validation errors into consistent JSON responses.

## Authentication and authorization

Registering or logging in returns the data required to authenticate protected requests. Send the JWT using the `Authorization` header:

```http
Authorization: Bearer <token>
```

Regular users can access only their own employee records. Administrators can access records across users, and employee deletion is restricted to administrators.

## Caching strategy

Employee list and detail reads use Redis as an optional cache. PostgreSQL remains the source of truth.

Cached values use a five-minute TTL and versioned namespaces. The keys include the authorization scope (`userId` and role) so a cached response cannot cross ownership or role boundaries.

Mutation invalidation follows this model:

| Mutation | List version | Detail version |
| --- | --- | --- |
| Create employee | Incremented | Not applicable for a new ID |
| Update employee | Incremented | Incremented for that employee |
| Delete employee | Incremented | Incremented for that employee |

Old versioned values are not deleted immediately. They become unreachable and expire naturally through their TTL. Redis errors are logged and treated as cache misses so database-backed operations can continue.

## Getting started

### Prerequisites

- Docker Desktop with Docker Compose, recommended for the complete stack.
- Node.js and npm if running commands directly on the host.

### Environment variables

Copy [`.env.example`](.env.example) to `.env`, then replace its placeholder credentials with strong, private values. The required variables are shown below for reference.

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=replace_with_a_database_password
DB_NAME=employee_management
DATABASE_URL=postgres://postgres:replace_with_a_database_password@localhost:5432/employee_management

JWT_SECRET=replace_with_a_secret_of_at_least_32_characters
JWT_EXPIRES_IN=1h
SALT_ROUNDS=10

REDIS_PASSWORD=replace_with_a_redis_password
REDIS_URL=redis://:replace_with_a_redis_password@redis:6379
```

When the API runs directly on the host, use `localhost` instead of the Docker service name `redis` in `REDIS_URL`.

### Run with Docker

Build and start the API, PostgreSQL, and Redis:

```bash
docker compose up --build
```

On the first run, leave the containers running and apply the database migration from the host:

```bash
npm install
npm run migrate:up
```

For this command, `DATABASE_URL` must use `localhost:5432`, as shown in `.env.example`. Migrations are explicit and are not run automatically when the containers start.

The API is available at `http://localhost:3000`.

Stop the stack without deleting the PostgreSQL volume:

```bash
docker compose down
```

### Run locally

Install dependencies:

```bash
npm install
```

Start PostgreSQL and Redis with values matching `.env`, apply the database migration, and start the development server:

```bash
npm run migrate:up
npm run dev
```

## Database migrations and seed data

Apply pending migrations:

```bash
npm run migrate:up
```

Roll back the latest migration:

```bash
npm run migrate:down
```

Populate development data:

```bash
npm run db:seed
```

Migration commands use `DATABASE_URL` from `.env`.

## API documentation

In a non-production environment, interactive Swagger documentation is available at:

```text
http://localhost:3000/api-docs
```

The generated OpenAPI document is available at:

```text
http://localhost:3000/api-docs/openapi.json
```

## API endpoints

### Public endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Basic server health response |
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | Authenticate and receive a JWT |

### Authenticated employee endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/employees` | List accessible employees with pagination |
| `GET` | `/employees/:id` | Get an accessible employee by ID |
| `POST` | `/employees` | Create an employee for the authenticated user |
| `PUT` | `/employees/:id` | Update an accessible employee |
| `DELETE` | `/employees/:id` | Delete an employee; admin only |
| `GET` | `/employees/search` | Search and filter accessible employees |
| `GET` | `/employees/stats` | Return aggregate statistics for accessible employees |

`GET /employees` accepts `page` and `limit`. The search endpoint accepts `name`, `role`, `minSalary`, `active`, `page`, and `limit`.

## Testing

Run tests in watch mode:

```bash
npm test
```

Run the test suite once:

```bash
npm run test:run
```

Run only local unit tests, which mock PostgreSQL and Redis dependencies:

```bash
npm run test:run -- src/tests/unit
```

Integration tests require the PostgreSQL test database configured in `.env.test`. `DB_NAME` and the database name at the end of `DATABASE_URL` must refer to that same test database, and its migrations must be applied before the suite runs. Redis behavior is unit-tested through mocked client responses and can be smoke-tested with the Docker Compose stack.

## Build and start

Create the production JavaScript output:

```bash
npm run build
```

Start the compiled application:

```bash
npm start
```

Tests are excluded from `dist`; Vitest discovers the TypeScript tests under `src/tests` directly.

## Project scope

This repository is considered complete when its existing behavior is documented and verified locally. Public deployment, cloud infrastructure, CI/CD, and additional product features are intentionally outside its scope.
