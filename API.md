# API Documentation (Backend)

Base URL (default): `http://localhost:5555`

Uploaded cover files are served from:

- `GET /uploads/covers/<filename>`

Upload storage:

- Cover uploads are stored locally under `/uploads/covers`.

## Conventions

### Auth header

Protected routes require:

```http
Authorization: Bearer <token>
```

### Error format

```json
{ "success": false, "message": "..." }
```

### Success formats

- List responses usually follow:

```json
{ "success": true, "results": 0, "data": { "items": [] } }
```

- Single item responses usually follow:

```json
{ "success": true, "item": {} }
```

Note: naming varies by route (e.g. `data.books`, `data.reviews`, `book`).

## Auth (`/auth`)

### `POST /auth/register`

Body:

```json
{ "name": "Alice", "email": "alice@example.com", "password": "password123" }
```

Response:

```json
{
  "success": true,
  "token": "…",
  "user": { "id": "…", "name": "…", "email": "…", "role": "user" }
}
```

### `POST /auth/login`

Body:

```json
{ "email": "alice@example.com", "password": "password123" }
```

Response matches `/auth/register`.

### `GET /auth/me` (protected)

Response:

```json
{
  "success": true,
  "user": { "id": "…", "name": "…", "email": "…", "role": "user" }
}
```

## Books (`/books`)

### `GET /books`

Response:

```json
{
  "success": true,
  "results": 10,
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 120,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": { "books": [] }
}
```

Each book can include:

- `chapters` (array) with objects:
  - `title`
  - `content`
  - `chapterNumber`
  - `isPublished`
  - `publishedAt`

#### Query features

Books listing supports:

- Filtering (Mongo-style operators via query string): `gte`, `gt`, `lte`, `lt`
  - Example: `publishedYear[gte]=2015`
- Sorting: `sort=field,-otherField` (default: `-createdAt`)
- Field selection: `fields=title,author,publishedYear` (default excludes `__v`)
- Pagination: `page=1&limit=10` (default `limit=100`)

Example:

```http
GET /books?publishedYear[gte]=2015&sort=-publishedYear&fields=title,author,publishedYear&page=1&limit=10
```

### `POST /books` (protected)

Creates a book. `createdBy` is derived from the authenticated user (not trusted from the client).

Body can be either JSON or `multipart/form-data`.

Required fields:

```json
{ "title": "Dune", "author": "Frank Herbert", "publishedYear": 1965 }
```

Optional fields:

- `description` (string)
- `genre` (string[])
- `coverImg`:
  - string URL/path in JSON requests, or
  - uploaded image file in `multipart/form-data` (field name: `coverImg`, max 5MB)

Response:

```json
{ "success": true, "message": "Book created successfully", "book": {} }
```

### `GET /books/:id`

Response:

```json
{ "success": true, "book": {} }
```

### `PATCH /books/:id` (protected + creator/admin)

Updates any provided fields. Accepts JSON or `multipart/form-data` (same `coverImg` rules as create).

Response:

```json
{ "success": true, "message": "Book updated successfully", "book": {} }
```

### `GET /books/my` (protected)

Returns books created by the authenticated user.

Response:

```json
{ "success": true, "results": 3, "data": { "books": [] } }
```

### `POST /books/:id/chapters` (protected + creator/admin)

Publishes a chapter for the given book.

Body:

```json
{
  "title": "Chapter 1: Arrival",
  "content": "Long chapter text...",
  "chapterNumber": 1
}
```

Notes:

- `chapterNumber` must be a positive integer and must be unique per book.

Response:

```json
{ "success": true, "message": "Chapter published successfully", "book": {} }
```

### `DELETE /books/:id` (protected + creator/admin)

Response:

```json
{ "success": true, "message": "Book deleted successfully" }
```

### `GET /books/trending`

Trending books based on review activity in the last 30 days.

Response:

```json
{ "success": true, "data": { "trending": [] } }
```

Each entry includes `reviewCount`, `averageRating`, and `bookDetails` (via aggregation lookup).

## Reviews (`/reviews` and nested under books)

### `GET /reviews`

Response:

```json
{ "success": true, "results": 3, "data": { "reviews": [] } }
```

Notes:

- Reviews are populated with:
  - `user` (name/email/role)
  - `book` (title/author/publishedYear)
- Reviews marked `inappropriate=true` are filtered out by query/aggregation middleware.

### `POST /reviews` (protected)

Creates a review. `user` is derived from the authenticated user.

Body:

```json
{ "review": "Great book", "rating": 5, "book": "<bookId>" }
```

Response:

```json
{ "success": true, "data": {} }
```

### `PATCH /reviews/:id` (protected + author/admin)

Response:

```json
{ "success": true, "review": {} }
```

### `DELETE /reviews/:id` (protected + author/admin)

Response:

```json
{ "success": true, "message": "Review deleted successfully" }
```

### `GET /reviews/review-stats`

Aggregated stats grouped by rating.

Response:

```json
{ "success": true, "data": { "stats": [] } }
```

### Nested Routes: `/books/:bookId/reviews`

- `GET /books/:bookId/reviews` - list reviews for a specific book
- `POST /books/:bookId/reviews` (protected) - create a review for that book

## Authorization Rules

- **Books:** only the creator (`createdBy`) or an `admin` can `PATCH` and `DELETE`.
- **Reviews:** only the review author (`user`) or an `admin` can `PATCH` and `DELETE`.
- **Banned users:** `isBanned=true` blocks login and protected actions.
