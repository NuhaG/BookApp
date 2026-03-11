# MERN Book App (Frontend)

Vite + React UI for the MERN Book App backend.

## Setup

Create `frontend/.env` (optional):

```env
VITE_API_URL=http://localhost:5555
```

## Run

```bash
npm install
npm run dev
```

## Auth

- Login: `POST /auth/login`
- Register: `POST /auth/register`
- The JWT is stored in `localStorage` and sent as `Authorization: Bearer <token>` on protected requests (books and reviews writes).

## Features

- Books list uses backend query params (`page`, `limit`, `sort`, and year range filters).
- Trending books panel uses `GET /books/trending`.
- Reviews page uses `GET /reviews` and `GET /reviews/review-stats`.
