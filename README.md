# Employee Management API

A production-grade REST API built with Node.js, Express, TypeScript, and PostgreSQL.

The project was created as part of a self-directed backend engineering study roadmap focused on building strong backend fundamentals through practical implementation and architectural understanding.

*Note: AI assistance was used strictly as a learning and mentoring tool for architectural reviews, concept explanations, and guidance. All application logic, architecture decisions, debugging, and implementation were developed manually.*

---

## Features

* **Core CRUD Operations:** Comprehensive employee management with dynamic SQL filtering and pagination.
* **Advanced Database Operations:** SQL aggregation (COUNT, AVG, MIN, MAX, FILTER, GROUP BY) pushing computation to PostgreSQL.
* **Security & Validation:** Parameterized queries (SQL injection prevention), runtime validation with Zod, and type coercion at the HTTP boundary.
* **Authentication & Authorization:** Stateless JWT-based authentication and Role-Based Access Control (RBAC) with resource ownership checks.
* **Automated Testing:** Unit tests (with service-layer mocking) and integration tests (with a real test database) using Vitest and Supertest.
* **Containerization:** Fully Dockerized development and production environments using multi-stage builds for optimized image size and security.
* **Layered Architecture:** Strict separation of concerns (Controllers → Services → Repositories) with centralized error handling.

---

## Tech Stack

* **Runtime & Framework:** Node.js, Express
* **Language:** TypeScript
* **Database:** PostgreSQL, `node-postgres` (`pg`)
* **Validation:** Zod
* **Testing:** Vitest, Supertest
* **Security:** `bcrypt`, `jsonwebtoken`
* **DevOps:** Docker, Docker Compose

---

## Architecture

```text
HTTP Request
    ↓
Validation Middleware (Zod)
    ↓
Controllers (HTTP layer, request/response handling)
    ↓
Services (Business logic)
    ↓
Repositories (Data access, SQL execution)
    ↓
PostgreSQL
    ↓
Global Error Handler
```

### Layer Responsibilities

* **Validation Middleware:** Validates and sanitizes HTTP input using Zod schemas. Coerces types (e.g., string to number for query params) and strips unknown fields.
* **Controllers:** Handle HTTP-specific concerns (extracting validated data, setting status codes, sending responses). No business logic.
* **Services:** Contain business logic and orchestrate operations. Trust that data passed from controllers is already validated.
* **Repositories:** Own all database concerns. Execute SQL queries and return data. No business logic.
* **Global Error Handler:** Catches all errors thrown anywhere in the application and formats consistent JSON error responses.

---

## Validation & Error Handling

### Runtime Validation 

All HTTP input is validated using Zod schemas before reaching the controller:

```typescript
// Example schema
export const createEmployeeSchema = z.object({
    name: z.string().min(2).max(100),
    role: z.string().min(1),
    salary: z.number().min(1000),
    active: z.boolean(),
});
```

### Validation Middleware

The validation middleware intercepts requests, validates the specified part (body, params or query), and attaches validated data to req.validated:

```typescript
router.post("/employees", validate(createEmployeeSchema, 'body'), controllers.createEmployee);
```

### Centralized Error Handling

Custom error classes extend the native Error class and include HTTP status codes. The global error handler catches all errors and returns consisten JSON responses:

```json
{
    "status": "Error",
    "statusCode": 400,
    "message": "Validation failed",
    "errors": [
        { "field": "salary", "message": "Number must be greater than or equal to 1000" }
    ]
}
```

---

## Database Optimization

### Dynamic SQL Filtering

The search endpoint builds SQL queries dynamically based on provided filters, using parameterized queries to prevent SQL injection:

```sql
// Example: GET /employees/search?name=john&minSalary=5000&page=2
SELECT * FROM employees 
WHERE 1=1 
  AND name ILIKE $1 
  AND salary > $2 
LIMIT $3 OFFSET $4
```

---

## Getting Started

### Prerequisites

 * **Node.js** (v20+ LTS recommended)
 * **Docker & Docker Compose** (Recommended for local development)

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost # Change to 'db' if running via Docker Compose
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_sercure_password
DB_NAME=employee_management
```

### Running with Docker

This project is fully containerized to ensure environment parity. To run both the API and PostgreSQL database locally without installing dependencies on your host machine:

1. Ensure Docker Desktop is running.
2. Run the following command in the project root:
```bash
docker compose up --build
```
3. The API will be vailable at `http://localhost:3000`.

### Running Locally (Without Docker)

1. Install dependencies: `npm install`
2. Ensure a local PostgreSQL instance is running and matches your `.env` configuration.
3. Start development server: `npm run dev`

---

## API Endpoints

### Employees

* `GET /employees` - List all employees
* `GET /employees/:id` - Get a specific employee
* `POST /employees` - Create a new employee
* `PUT /employees/:id` - Update an existing employee
* `DELETE /employees/:id` - Delete an employee

### Search & Statistics

* `GET /employees/search` - Search employees with dynamic filters and pagination
    * Query params: `name`, `role`, `minSalary`, `active`, `page` (default: 1), `limit` (default: 10)
* `GET /employees/stats` - Get aggregated employee statistics (counts, salary averages, role distribution)

---

## Example Requests

### Create Employee

```json
POST /employees
Content-Type: application/json

{
    "name": "John Doe",
    "role": "Backend Engineer",
    "salary": 5000,
    "active": true
}
```

### Search Employees

```http
GET /employees/search?name=john&minSalary=4000
```

---

## Planned Improvements

* **Database Migrations:** Implement version-controlled schema changes (e.g., `node-pg-migrate` or `Prisma`)
* **API Documentation:** Auto-generated OpenAPI/Swagger documentation.
* **CI/CD Pipeline:** Automated testing and building via GitHub Actions.

----