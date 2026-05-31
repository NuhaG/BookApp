# 📘 MERN Book App

A full-stack MERN application for discovering books, publishing chapters, managing discussion threads, and collecting reader reviews.

---

## ✨ Features

### 👨‍🎓 Reader Experience

- Browse and explore books with search, filters, sorting, and pagination
- Read published chapters from a book details page
- Join book discussions through threaded conversations
- View and post reviews for books
- Login and register with JWT-based authentication

---

### ✍️ Author Experience

- Create books with metadata and optional cover images
- Edit and delete books you own
- Publish and update chapters on your books
- Manage a personal catalog in `My Books`

---

### 💬 Community and Discussions

- Create discussion threads for each book
- Post threaded messages within a thread
- Soft-delete and moderate content via admin/owner controls

---

### ⚙️ Backend Capabilities

- JWT authentication with `/auth/register`, `/auth/login`, and `/auth/me`
- Role-based authorization and ownership guards for books, reviews, threads, and messages
- Nested routes for reviews, threads, and messages
- Query utilities for filtering, sorting, field selection, and pagination
- File upload support for book covers via Multer and Cloudinary
- Cover images stored remotely in Cloudinary and returned as accessible URLs
- Redis caching for books listing, queries, and trending books optimization

---

## 🛠️ Tech Stack

### 🧩 Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcrypt
- multer
- cors
- dotenv
- redis

### 🎨 Frontend

- React
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- React Icons

---

## 📂 Project Structure

```
MERN-BookApp/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── index.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   └── utils/
    ├── package.json
    ├── vite.config.js
    └── index.html
```

---

## ⚙️ Environment Variables

### 🔐 Backend (`backend/.env`)

```
MONGO_URI=your_mongodb_connection_string
PORT=5555
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ALLOWED_ORIGINS=https://book-verse-azure.vercel.app,http://localhost:5173
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash__redis_rest_token
```

> Book cover uploads are stored in Cloudinary. The API saves the Cloudinary image URL in the `coverImg` field on the book document.

---

### 🌐 Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:5555
```

---

## ▶️ Running Locally

### Clone the Repo

```
git clone https://github.com/NuhaG/BookApp.git
cd BookApp
```

### Backend

```
cd backend
npm install
npm run dev
```

### Frontend

```
cd frontend
npm install
npm run dev
```

---

## 📖 Documentation

Detailed backend API documentation is available in `API.md`.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## 📄 License

This project is licensed under the **MIT License**.
