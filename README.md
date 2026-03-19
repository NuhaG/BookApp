# 📘 MERN Book App

A full-stack MERN application for discovering books, publishing chapters, and managing reader reviews — designed with a strong focus on **backend architecture, API design, and real-world application flow**.

---

## ✨ Features

### 👨‍🎓 Reader Experience

* Browse books from the Explore page
* Filter, sort, and paginate results
* Select page size (`6`, `12`, `24`) with proper navigation controls
* Preview books with latest reviews directly from the list view
* View detailed book pages with:

  * chapter reading (modal overlay)
  * reviews
* Create, edit, and delete reviews

---

### ✍️ Author Experience

* Add books with metadata and optional cover upload
* Automatically continue to edit flow after creation
* Manage personal catalog (`My Books`)
* Edit and delete books
* Publish chapters incrementally

---

### ⚙️ Backend Capabilities

* JWT Authentication (`/auth/register`, `/auth/login`, `/auth/me`)
* Role-based authorization and ownership guards
* Advanced query handling:

  * filtering
  * sorting
  * pagination
  * field selection
* Aggregation pipelines:

  * trending books
  * review statistics
* Nested routes for reviews
* Chapter publishing system
* Image uploads using Multer (stored locally in `/uploads/covers`)

---

## 🛠️ Tech Stack

### 🧩 Backend

* Node.js
* Express
* MongoDB + Mongoose
* JWT (`jsonwebtoken`)
* bcrypt
* multer

### 🎨 Frontend

* React (Vite)
* React Router
* Axios
* Tailwind CSS

---

## 📂 Project Structure

```id="ok4c0k"
MERN-BookApp/
├── backend/
│   ├── index.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── api/
        ├── components/
        ├── pages/
        └── utils/
```

---

## ⚙️ Environment Variables

### 🔐 Backend (`.env`)

```id="0qggzj"
MONGO_URI=your_mongodb_connection_string
PORT=5555
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

📌 Cover uploads are stored locally in `backend/uploads/covers`.

---

### 🌐 Frontend (`.env`)

```id="a1m2me"
VITE_API_URL=http://localhost:5555
```

---

## ▶️ Running Locally

### Backend

```id="q5thp3"
cd backend
npm install
npm run dev
```

### Frontend

```id="4yhl6o"
cd frontend
npm install
npm run dev
```

---

# 📖 Documentation

Full API documentation with route details and request/response examples is available in **API.md**.

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
