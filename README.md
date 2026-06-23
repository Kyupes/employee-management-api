# Employee Management API

REST API built with Node.js, Express, TypeScript, and PostgreSQL.

The project was created as part of a self-directed backend engineering study roadmap focused on building strong backend fundamentals through practical implementation and architectural understanding.

AI assistance was used as a learning and mentoring tool for explanations, reviews, and guidance, while the application logic, architecture decisions, debugging, and implementation were developed manually as part of the learning process.

---

## Features

* Employee CRUD operations
* PostgreSQL integration with parameterized queries (SQL injection prevention)
* Layered architecture with clear separation of concerns
* Repository pattern for database abstraction
* Runtime validation with Zod schemas
* Validation middleware for request body, params, and query strings
* Centralized error handling with custom error classes
* TypeScript typing throughout the application
* Dynamic SQL filtering with multiple criteria
* Pagination support
* Database aggregation for statistics (COUNT, AVG, MIN, MAX, FILTER, GROUP BY)
* Type coercion and transformation at the HTTP boundary

---

## Tech Stack

* Node.js
* Express
* TypeScript
* PostgreSQL
* node-postgres (`pg`)
* Zod (runtime validation)

---

## Architecture

```text
HTTP Request
    ↓
Validation Middleware (Zod)
    ↓
Controllers (HTTP layer)
    ↓
Services (Business logic)
    ↓
Repositories (Data access)
    ↓
PostgreSQL
    ↓
Global Error Handler
```

### Layer Responsibilities

* Validation Middleware: Validates and sanitizes HTTP input using Zod schemas. Coerces types (e.g., string to number for query params) and strips unknown fields.
* Controllers: Handle HTTP-specific concerns (extracting validated data, setting status codes, sending responses). No business logic.
* Services: Contain business logic and orchestrate operations. Trust that data passed from controllers is already validated.
* Repositories: Own all database concerns. Execute SQL queries and return data. No business logic.
* Global Error Handler: Catches all errors thrown anywhere in the application and formats consistent JSON error responses.

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

```typescript
// Example: GET /employees/search?name=john&minSalary=5000&page=2
SELECT * FROM employees 
WHERE 1=1 
  AND name ILIKE $1 
  AND salary > $2 
LIMIT $3 OFFSET $4
```

### Database Aggregation

Statistics are calculated using SQL aggregate functions, pushing computation to PostgreSQL instead of Node.js:

```sql
SELECT 
    COUNT(*) as "totalCount",
    COUNT(*) FILTER (WHERE active = true) AS "activeCount",
    AVG(salary) as "averageSalary",
    MAX(salary) as "highestSalary",
    MIN(salary) as "lowestSalary"
FROM employees;
```

---

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=employee_management
```

### Running the Project

Development mode:

```bash
npm run dev
```

Build project:

```bash
npm run build
```

Run production build:

```bash
npm start
```

---

## API Endpoints

### Employees

* `GET /employees`
* `GET /employees/:id`
* `POST /employees`
* `PUT /employees/:id`
* `DELETE /employees/:id`

### Search & Statistics

* `GET /employees/search` - Search employees with filters and pagination
  * Query params: `name`, `role`, `minSalary`, `active`, `page` (default: 1), `limit` (default: 10)
* `GET /employees/stats` - Get employee statistics (counts, salary averages, role distribution)

---

## Example Requests

### Create Employee

```bash
POST /employees
Content-Type: application.json

{
  "name": "John Doe",
  "role": "Developer",
  "salary": 5000,
  "active": true
}
```

```bash
GET /employees/search?name=john&minSalary=4000&page=1&limit=10
```

### Planned Improvements

* Authentication and authorization (JWT)
* Role-based access control
* Unit and integration testing
* Docker containerization
* Database migrations
* API documentation (Swagger/OpenAPI)
* Deployment to cloud provider

---
