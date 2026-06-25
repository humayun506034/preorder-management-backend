# Preorder Management Backend

A NestJS backend API for managing product preorder campaigns. It provides CRUD endpoints, search/filter/sort/pagination for preorder lists, Swagger documentation, Prisma/PostgreSQL persistence, and seed utilities for demo data.

Live API:

```txt
https://preorder-management-backend.onrender.com
```

Live frontend:

```txt
https://preorder-management-01.vercel.app/
```

Swagger docs:

```txt
https://preorder-management-backend.onrender.com/docs
```

## Tech Stack

- Node.js
- NestJS 11
- TypeScript
- Prisma 7
- PostgreSQL
- `@prisma/adapter-pg`
- Swagger/OpenAPI
- class-validator and class-transformer

## Features

- Health/root endpoint for checking that the API is running
- Create, read, update, and delete preorders
- List preorders with:
  - text search by `name` or `preorderWhen`
  - active/inactive status filter
  - sorting by selected fields
  - pagination metadata for frontend tables
- Seed sample preorder data from `prisma/seed-data/preorders.json`
- Consistent API response wrapper
- Global validation pipe with DTO whitelisting and query transformation
- CORS configured for local frontend ports and the deployed Vercel frontend

## Project Structure

```txt
src/
  main.ts                         App bootstrap, CORS, validation, Swagger
  app.controller.ts               Root API health/message endpoint
  app.module.ts                   Root Nest module
  common/utils/send-response.ts   Shared response wrapper
  prisma/                         Prisma module and service
  modules/preorder/               Preorder module, controller, service, DTOs

prisma/
  schema.prisma                   Database schema
  migrations/                     Prisma migration history
  seed.ts                         Local seed script
  seed-data/preorders.json        Sample preorder records
```

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
PORT=3001
```

Notes:

- `DATABASE_URL` is required by both Prisma CLI commands and the NestJS runtime.
- If `PORT` is not set, the app listens on `3001`.
- The Prisma client is generated to `generated/prisma` with CommonJS output for NestJS runtime compatibility.

## Local Setup

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Seed sample preorder data:

```bash
npm run seed
```

Start the development server:

```bash
npm run dev
```

Local API:

```txt
http://localhost:3001
```

Local Swagger docs:

```txt
http://localhost:3001/docs
```

## Available Scripts

```bash
npm run dev          # Start NestJS in watch mode
npm run build        # Compile TypeScript to dist/
npm run start        # Start the app with Nest CLI
npm run start:prod   # Run the compiled app from dist/
npm run seed         # Build and insert sample preorder records
```

## API Overview

All preorder routes are grouped under:

```txt
/preorder
```

The API returns a consistent response shape:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request completed successfully.",
  "data": {},
  "meta": {}
}
```

`meta` is included only when an endpoint returns pagination or additional metadata.

## Endpoints

### Root

```txt
GET /
```

Returns a simple running message:

```txt
Preorder Manager API is running. Visit /docs for Swagger documentation.
```

### Create Preorder

```txt
POST /preorder
```

Request body:

```json
{
  "name": "Multi variant 3",
  "products": 1,
  "preorderWhen": "regardless-of-stock",
  "startsAt": "2025-12-15T20:24:00.000Z",
  "endsAt": "2025-12-15T20:27:00.000Z",
  "isActive": true
}
```

Validation:

- `name` is required.
- `products` must be an integer with a minimum value of `1`.
- `preorderWhen` is required.
- `startsAt` must be a valid date string.
- `endsAt` is optional and must be a valid date string when provided.
- `isActive` is optional and defaults to `true`.

### List Preorders

```txt
GET /preorder
```

Query parameters:

| Name | Values | Default |
| --- | --- | --- |
| `search` | text, max 100 characters | none |
| `status` | `all`, `active`, `inactive` | `all` |
| `sortBy` | `name`, `createdAt`, `startsAt`, `endsAt` | `createdAt` |
| `sortOrder` | `asc`, `desc` | `desc` |
| `page` | integer, minimum `1` | `1` |
| `limit` | integer, `1` to `100` | `10` |

Example:

```txt
GET /preorder?search=holiday&status=active&sortBy=createdAt&sortOrder=desc&page=1&limit=10
```

Example response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Preorder list fetched successfully.",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "itemCount": 0,
    "totalItems": 0,
    "totalPages": 0,
    "from": 0,
    "to": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

Pagination notes:

- `itemCount` is the number of records returned on the current page.
- `totalItems` is the total number of matching database records.
- `from` and `to` are useful for UI copy such as `Showing 1 to 10 of 21`.

### Get Single Preorder

```txt
GET /preorder/:id
```

Returns one preorder by id. If the id does not exist, the API returns `404`.

### Update Preorder

```txt
PATCH /preorder/:id
```

The request body supports partial updates:

```json
{
  "name": "Updated preorder",
  "products": 2,
  "preorderWhen": "out-of-stock",
  "startsAt": "2025-12-15T20:24:00.000Z",
  "endsAt": null,
  "isActive": false
}
```

### Delete Preorder

```txt
DELETE /preorder/:id
```

Deletes and returns the removed preorder. If the id does not exist, the API returns `404`.

### Seed Sample Data Through API

```txt
POST /preorder/seed
```

Inserts the 15 sample preorder records from `prisma/seed-data/preorders.json` into the connected database.

Live example:

```txt
POST https://preorder-management-backend.onrender.com/preorder/seed
```

Response:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Sample preorder data seeded successfully.",
  "data": {
    "inserted": 15
  }
}
```

Every seed request inserts a fresh copy of the sample rows.

## Database Model

```prisma
model Preorder {
  id           String   @id @default(uuid())
  name         String
  products     Int      @default(1)
  preorderWhen String
  startsAt     DateTime
  endsAt       DateTime?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Deployment Notes

- Build command: `npm run build`
- Start command: `npm run start:prod`
- `postinstall` runs `prisma generate`, so the Prisma client is generated during install.
- Add `DATABASE_URL` and optional `PORT` to the hosting provider environment.
- Run migrations against the production database before serving production traffic.

## CORS

The API currently allows requests from:

```txt
http://localhost:3000
http://localhost:3001
http://localhost:3002
https://preorder-management-01.vercel.app
```

Allowed methods:

```txt
GET, POST, PUT, PATCH, DELETE, OPTIONS
```
