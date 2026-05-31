# API Documentation

## Overview

This backend API supports the MERN Book App with user authentication, book management, chapter publishing, reviews, discussion threads, and nested message replies.

- Base URL: `http://localhost:5555`
- Content-Type: `application/json`
- Authentication: Bearer Token (JWT)

---

## File Storage

Book cover uploads are stored in Cloudinary and normalized as public URLs in the book `coverImg` field.

If you need to access uploaded covers directly, use the returned Cloudinary URL from the API response.

> In local development, the app may still resolve remote URLs from Cloudinary and local `uploads` paths if present.

---

## Auth Header

Protected routes require:

```http
Authorization: Bearer <token>
```

---

## Response Formats

### Success (single resource)

```json
{
  "success": true,
  "data": {
    "item": {}
  }
}
```

### Success (list)

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

### Error

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

# Auth

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
  "user": {
    "id": "...",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "user"
  }
}
```

---

## POST `/auth/login`

Authenticate a user and return a JWT.

### Body

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

### Response

Same structure as `/auth/register`.

---

## GET `/auth/me` (Protected)

Retrieve the current authenticated user.

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Alice",
      "email": "alice@example.com",
      "role": "user"
    }
  }
}
```

---

# Books

## GET `/books`

Retrieve all books. Supports filtering, sorting, field selection, and pagination.

### Query Parameters

- `search=<text>` — case-insensitive title/author search
- `publishedYear[gte]=<year>` — numeric filtering
- `sort=field,-field` — sorting order
- `fields=title,author` — field selection
- `page=<number>&limit=<number>` — pagination

### Example

```http
GET /books?search=dune&sort=-publishedYear&page=1&limit=12
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

---

## POST `/books` (Protected)

Create a new book.

### Body

Supports JSON or `multipart/form-data`.

- For file upload, send a `coverImg` file field in `multipart/form-data`.
- The backend uploads cover images to Cloudinary and saves the returned image URL in `coverImg`.

```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "publishedYear": 1965,
  "description": "A space epic...",
  "genre": ["science-fiction", "adventure"]
}
```

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

Retrieve a single book by ID.

### Response

```json
{
  "success": true,
  "book": {}
}
```

---

## PATCH `/books/:id` (Protected)

Update a book you own or update any book as an admin.

### Body

Supports JSON or `multipart/form-data`.

- To replace a cover image, send a new `coverImg` file field.
- The previous Cloudinary image will be deleted when a new cover is uploaded.

```json
{
  "title": "Dune: Revised",
  "description": "Updated description",
  "genre": ["science-fiction"],
  "coverImg": "https://res.cloudinary.com/.../image.jpg"
}
```

### Response

```json
{
  "success": true,
  "message": "Book updated successfully",
  "book": {}
}
```

---

## DELETE `/books/:id` (Protected)

Delete a book you own or any book as an admin.

### Response

```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

---

## GET `/books/my` (Protected)

Get the authenticated user's books.

### Response

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

Get trending books based on recent review activity.

### Response

```json
{
  "success": true,
  "data": {
    "trending": []
  }
}
```

Each trending entry includes:

- `reviewCount`
- `averageRating`
- `bookDetails`

---

## POST `/books/:id/chapters` (Protected)

Publish a new chapter for a book.

### Body

```json
{
  "title": "Chapter 1: Arrival",
  "content": "Long chapter text...",
  "chapterNumber": 1,
  "isPublished": true
}
```

### Notes

- `chapterNumber` must be unique per book.
- Duplicate chapter numbers are rejected.

### Response

```json
{
  "success": true,
  "message": "Chapter published successfully",
  "book": {}
}
```

---

## PATCH `/books/:id/chapters/:chapterId` (Protected)

Update an existing chapter.

### Body

```json
{
  "title": "Chapter 1: New Title",
  "content": "Updated text",
  "chapterNumber": 2,
  "isPublished": false
}
```

### Response

```json
{
  "success": true,
  "message": "Chapter updated successfully",
  "book": {}
}
```

---

## POST `/books/admin/fix-chapters` (Protected Admin)

Fix missing or invalid chapter publish state across all books.

### Response

```json
{
  "success": true,
  "message": "Fixed publish state for X chapters",
  "updated": 0
}
```

---

# Reviews

## GET `/reviews`

Retrieve all reviews.

### Response

```json
{
  "success": true,
  "results": 3,
  "data": {
    "reviews": []
  }
}
```

Reviews include populated:

- `user` (name, email, role)
- `book` (title, author, publishedYear)

---

## POST `/reviews` (Protected)

Create a review for a book.

### Body

```json
{
  "review": "Great book",
  "rating": 5,
  "book": "<bookId>"
}
```

### Response

```json
{
  "success": true,
  "data": {}
}
```

---

## PATCH `/reviews/:id` (Protected)

Update a review you own or update any review as an admin.

### Response

```json
{
  "success": true,
  "review": {}
}
```

---

## DELETE `/reviews/:id` (Protected)

Soft delete a review.

### Response

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## GET `/reviews/review-stats`

Get aggregated review statistics.

### Response

```json
{
  "success": true,
  "data": {
    "stats": []
  }
}
```

---

## Nested Review Routes

- `GET /books/:bookId/reviews`
- `POST /books/:bookId/reviews` (Protected)

---

# Discussion Threads

## GET `/books/:bookId/threads`

Retrieve all non-deleted threads for a book.

### Response

```json
{
  "success": true,
  "results": 3,
  "data": []
}
```

---

## POST `/books/:bookId/threads` (Protected)

Create a discussion thread.

### Body

```json
{
  "title": "Question about chapter 2",
  "content": "I want to discuss the ending..."
}
```

### Response

```json
{
  "success": true,
  "data": {}
}
```

---

## GET `/threads/:id`

Retrieve a single thread by ID.

### Response

```json
{
  "success": true,
  "data": {}
}
```

---

## PATCH `/threads/:id` (Protected)

Update a thread.

### Response

```json
{
  "success": true,
  "data": {}
}
```

---

## DELETE `/threads/:id` (Protected)

Soft delete a thread.

### Response

```json
{
  "success": true,
  "message": "Thread deleted successfully"
}
```

---

# Thread Messages

## GET `/threads/:threadId/messages`

Retrieve threaded messages for a thread.

### Response

```json
{
  "success": true,
  "results": 2,
  "data": []
}
```

---

## POST `/threads/:threadId/messages` (Protected)

Create a message inside a thread.

### Body

```json
{
  "content": "This is a reply.",
  "parentMessage": "<messageId>"
}
```

### Notes

- `parentMessage` is optional.
- Cannot post in locked threads.

### Response

```json
{
  "success": true,
  "data": {}
}
```

---

## PATCH `/messages/:id` (Protected)

Update a message you own or update any message as an admin.

### Response

```json
{
  "success": true,
  "data": {}
}
```

---

## DELETE `/messages/:id` (Protected)

Soft delete a message.

### Response

```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

# Authorization Rules

- Books → only creator (`createdBy`) or `admin` may update/delete
- Reviews → only author (`user`) or `admin` may update/delete
- Threads → only creator or `admin` may update/delete
- Messages → only creator or `admin` may update/delete
- Banned users are blocked from login and protected actions

---

# Design Notes

- Resource-based routes with nested reviews, threads, and messages
- Consistent JSON response structure
- JWT-based authentication for protected endpoints
- Local file uploads served through Express static middleware
