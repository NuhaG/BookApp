# API Documentation (Backend)
## Overview

This API powers the Book Discussion Platform backend, enabling authentication, book management, chapter publishing, and reviews.

- Base URL: `http://localhost:5555`
- Content-Type: `application/json`
- Authentication: Bearer Token (JWT)

---
## File Storage

- Covers stored at: `/uploads/covers`

Public access:

```http
GET /uploads/covers/<filename>
```

---

## Conventions

### Auth Header

Protected routes require:

```http
Authorization: Bearer <token>
```

---

### Response Format

#### Success (Single Resource)

```json
{
  "success": true,
  "data": {
    "item": {}
  }
}
```

#### Success (List)

```json
{
  "success": true,
  "results": 0,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "data": {
    "items": []
  }
}
```

#### Error

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## HTTP Status Codes

| Code | Meaning      |
| ---- | ------------ |
| 200  | OK           |
| 201  | Created      |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 403  | Forbidden    |
| 404  | Not Found    |
| 500  | Server Error |

---

# Auth (`/auth`)

## POST `/auth/register`

Register a new user.

### Body

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "success": true,
  "token": "...",
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "user"
    }
  }
}
```

---

## POST `/auth/login`
Authenticate user and return token.

### Body

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

### Response

Same as `/auth/register`.

---

## GET `/auth/me` (Protected)

Get current authenticated user.

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "user"
    }
  }
}
```

---

# Books (`/books`)

## GET `/books`

Retrieve all books (public).

### Query Features

- Filtering: `publishedYear[gte]=2015`
- Sorting: `sort=field,-otherField` (default: `-createdAt`)
- Field selection: `fields=title,author,publishedYear`
- Pagination: `page=1&limit=10`

### Example

```http
GET /books?publishedYear[gte]=2015&sort=-publishedYear&fields=title,author,publishedYear&page=1&limit=10
```

### Response

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
  "data": {
    "books": []
  }
}
```

### Book Structure

Each book may include:

- `title`
- `author`
- `publishedYear`
- `description`
- `genre`
- `coverImg`
- `chapters`:
  - `title`
  - `content`
  - `chapterNumber`
  - `isPublished`
  - `publishedAt`

---

## POST `/books` (Protected)

Create a book.

### Body

```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "publishedYear": 1965
}
```

### Notes

- `createdBy` is derived from authenticated user
- Supports JSON and `multipart/form-data` (`coverImg`, max 5MB)

### Response

```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "book": {}
  }
}
```

---

## GET `/books/:id`

```json
{
  "success": true,
  "data": {
    "book": {}
  }
}
```

---

## PATCH `/books/:id` (Protected)

```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    "book": {}
  }
}
```

---

## DELETE `/books/:id` (Protected)

```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

---

## GET `/books/my` (Protected)

```json
{
  "success": true,
  "results": 3,
  "data": {
    "books": []
  }
}
```

---

## GET `/books/trending`

```json
{
  "success": true,
  "data": {
    "trending": []
  }
}
```

Each entry includes:

- `reviewCount`
- `averageRating`
- `bookDetails`

---

## POST `/books/:id/chapters` (Protected)

```json
{
  "title": "Chapter 1: Arrival",
  "content": "Long chapter text...",
  "chapterNumber": 1
}
```

### Rules

- `chapterNumber` must be unique per book

---

## PATCH `/books/:id/chapters/:chapterId` (Protected)

```json
{
  "success": true,
  "message": "Chapter updated successfully",
  "data": {
    "book": {}
  }
}
```

---

## POST `/books/admin/fix-chapters` (Admin)

```json
{
  "success": true,
  "message": "Fixed publish state for X chapters",
  "updated": 0
}
```

---

# Reviews (`/reviews`)

## GET `/reviews`

```json
{
  "success": true,
  "results": 3,
  "data": {
    "reviews": []
  }
}
```

### Notes

- Populated:
  - `user` (name, email, role)
  - `book` (title, author, publishedYear)

- `inappropriate=true` reviews are filtered out

---

## POST `/reviews` (Protected)

```json
{
  "review": "Great book",
  "rating": 5,
  "book": "<bookId>"
}
```

```json
{
  "success": true,
  "data": {}
}
```

---

## PATCH `/reviews/:id` (Protected)

```json
{
  "success": true,
  "data": {
    "review": {}
  }
}
```

---

## DELETE `/reviews/:id` (Protected)

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## GET `/reviews/review-stats`

```json
{
  "success": true,
  "data": {
    "stats": []
  }
}
```

---

## Nested Routes

- `GET /books/:bookId/reviews`
- `POST /books/:bookId/reviews` (Protected)

---

# 🔐 Authorization Rules
- Books → only creator (`createdBy`) or `admin` can update/delete
- Reviews → only author (`user`) or `admin` can update/delete
- Banned users → `isBanned=true` blocks login and protected actions

---

# ⚙️ Design Conventions

- Resource-based URLs (nouns, not verbs)
- Plural naming (`/books`, `/reviews`)
- Consistent response structure
- Stateless requests
- Pagination support
- JWT-based authentication
