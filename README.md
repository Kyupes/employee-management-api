# Employee Management API

REST API built with Node.js, Express, TypeScript, and PostgreSQL.

The project was created as part of a self-directed backend engineering study roadmap focused on building strong backend fundamentals through practical implementation and architectural understanding.

AI assistance was used as a learning and mentoring tool for explanations, reviews, and guidance, while the application logic, architecture decisions, debugging, and implementation were developed manually as part of the learning process.

---

## Features

* Employee CRUD operations
* PostgreSQL integration
* Layered architecture
* Repository pattern
* Centralized error handling
* TypeScript typing
* Query filtering
* Statistics endpoints

---

## Tech Stack

* Node.js
* Express
* TypeScript
* PostgreSQL
* node-postgres (`pg`)

---

## Architecture

```text
controllers
  ↓
services
  ↓
repositories
  ↓
PostgreSQL
```

### Responsibilities

* Controllers: HTTP layer and request handling
* Services: business logic and validation
* Repositories: database access and SQL queries

---

## Installation

```bash
npm install
```

---

## Environment Variables

Create a `.env` file:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=employee_management
```

---

## Running the Project

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

### Additional Endpoints

* `GET /employees/search`
* `GET /employees/stats`

---

## Planned Improvements

* Runtime validation with Zod
* Validation middleware
* Pagination
* SQL-based filtering
* Authentication
* Docker support
* Database migrations

---
