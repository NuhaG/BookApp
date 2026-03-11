# 📔 MERN Book App

A full-stack **MERN** application for discovering books, writing reviews, and analyzing community ratings.

This project demonstrates **production-style backend architecture** including JWT authentication, role-based authorization, MongoDB aggregation pipelines, advanced query utilities (filtering, sorting, pagination), and a responsive React frontend.

---

# ✨ Features

## ⚙️ Backend

* JWT authentication (register, login, current user)
* Role-based and ownership authorization
* Books CRUD API
* Advanced query features
  * filtering
  * sorting
  * field selection
  * pagination
* Reviews system with nested routes under books
* Aggregation pipelines for analytics
* Trending books endpoint
* Automatic rating cache updates
* Password hashing using **bcrypt**
* Centralized error handling

---

## 🎨 Frontend

* React + Vite
* TailwindCSS UI
* Axios API integration
* Responsive layout
* JWT stored in `localStorage`

### Pages

* Books list
* Book details with reviews
* Reviews page with statistics
* Login / Register

---

# 🛠 Tech Stack

### Backend

* Node.js
* Express 5
* MongoDB
* Mongoose
* JWT
* bcrypt

### Frontend

* React (Vite)
* React Router
* Axios
* TailwindCSS

---

# 📂 Project Structure

```
MERN-BookApp/
├── backend/
│   ├── index.js                  # Express API entry
│   ├── controllers/              # Auth / Book / Review controllers
│   ├── middleware/               # JWT auth, ownership guards, error handler
│   ├── models/                   # Mongoose schemas (User / Book / Review)
│   ├── routes/                   # Express routers
│   └── utils/                    # Helpers (APIFeatures, JWT)
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── api/                  # Axios client
        ├── components/           # Shared UI components
        ├── pages/                # Application pages
        └── utils/                # Session + constants
```

---

# 💻 Setup

## 📋 Prerequisites

* Node.js
* MongoDB connection string (Atlas or local)

---

## 🔑 Environment Variables

Create `backend/.env`

```
MONGO_URI=your_mongodb_connection_string
PORT=5555
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

Optional (`frontend/.env`)

```
VITE_API_URL=http://localhost:5555
```

---

# ▶️ Running the Project

### Start Backend

```
cd backend
npm install
npm run dev
```

### Start Frontend

```
cd frontend
npm install
npm run dev
```

Backend runs at:

```
http://localhost:5555
```

---

# 📖 Documentation

Full API documentation with route details and request/response examples is available in **API.md**.

### Frontend Routes

* `/` → Books list
* `/books/details/:id` → Book details with reviews
* `/reviews` → Reviews list with statistics
* `/login`, `/register` → Authentication pages

---

# 🤝 Contributing

Contributions are welcome!

If you'd like to improve the project:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

Suggestions, improvements, and bug fixes are appreciated.

---

# 📄 License

This project is licensed under the **MIT License**.
