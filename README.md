# Preorder Manager API

Backend API for managing product preorders. The app is built with NestJS, Prisma 7, PostgreSQL, Swagger, and class-validator.

## Features

- Create preorder
- List preorders with database-level filtering, sorting, and pagination
- Get a single preorder by id
- Update preorder
- Delete preorder
- Swagger API documentation
- Consistent response wrapper with `success`, `statusCode`, `message`, `data`, and optional `meta`

## Tech Stack

- Node.js
- NestJS 11
- Prisma 7
- PostgreSQL
- `@prisma/adapter-pg`
- Swagger
- class-validator / class-transformer

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
PORT=3000
```

Generate Prisma client:

```bash
npx prisma generate
```

Apply database migrations:

```bash
npx prisma migrate dev
```

Seed sample preorder data:

```bash
npm run seed
```

For quick development sync without migrations, you can use:

```bash
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

The API runs at:

```txt
http://localhost:3000
```

Swagger docs:

```txt
http://localhost:3000/docs
```

## Prisma Model

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

## API Endpoints

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

### Get Preorders

```txt
GET /preorder
```

Query parameters:

| Name | Values | Default |
| --- | --- | --- |
| `status` | `all`, `active`, `inactive` | `all` |
| `sortBy` | `name`, `createdAt`, `startsAt`, `endsAt` | `createdAt` |
| `sortOrder` | `asc`, `desc` | `desc` |
| `page` | number, starts from `1` | `1` |
| `limit` | number, max `100` | `10` |

Example:

```txt
GET /preorder?status=all&sortBy=createdAt&sortOrder=desc&page=1&limit=10
```

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Preorder list fetched successfully.",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "itemCount": 10,
    "totalItems": 21,
    "totalPages": 3,
    "from": 1,
    "to": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Pagination notes:

- `itemCount` is the number of records returned on the current page.
- `totalItems` is the total number of database records matching the current filter.
- `from` and `to` are useful for UI text such as `Showing 1 to 10 from 21`.

### Get Single Preorder

```txt
GET /preorder/:id
```

### Update Preorder

```txt
PATCH /preorder/:id
```

Request body supports partial updates:

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

## Useful Commands

```bash
# development
npm run dev

# production build
npm run build

# run compiled app
npm run start:prod

# lint and auto-fix
npm run lint

# format
npm run format

# regenerate Prisma client
npx prisma generate

# apply migrations
npx prisma migrate dev

# seed 15 sample preorders
npm run seed
```

## Notes

- This project uses Prisma 7 with the PostgreSQL driver adapter, so `@prisma/adapter-pg` and `pg` are required.
- Prisma client is generated into `generated/prisma` using `moduleFormat = "cjs"` for NestJS runtime compatibility.
- The database URL is read from `.env`.
