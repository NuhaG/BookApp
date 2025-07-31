# Books App (MERN)

A simple MERN (MongoDB, Express, React, Node.js) application for managing books. This app allows users to create, view, edit, and delete books with basic details (Title, Author, Year).

---

## 🚀 Features
- Add new books with Title, Author, and Published Year.
- Fully Responsive with Toggle Table and Card View.
- Quick View Modal in Card View for fast book info preview.
- Edit existing book details.
- Delete books with confirmation prompt.
- View detailed book info (ID, created & updated timestamps).
- Data is persisted in MongoDB.

---

## 🛠 Tech Stack
Frontend:
- React (Vite)
- Axios (API calls)
- TailwindCSS (UI styling)

Backend:
- Node.js
- Express.js
- MongoDB & Mongoose

---

## ⚡ Getting Started
### Clone the repository  
```bash
git clone https://github.com/NuhaG/BookApp.git
```

### Install dependencies (frontend & backend):  
*Backend:*
```bash
cd backend  
npm install  
```
*Frontend:*
```bash
cd frontend  
npm install  
```

### Set up environment variables (in backend):  
```bash
PORT=5555  
MONGO_URI=your_mongodb_connection_string  
```

### Run the app
#### Start backend (Express)  
```bash
cd backend  
npm run dev  
```

Backend runs at: http://localhost:5555

#### Backend Routes  
```GET /books``` → Fetch all books.  
```GET /books/:id``` → Fetch a single book by ID.  
```POST /books``` → Add a new book (JSON body: title, author, year).  
```PATCH /books/:id``` → Update an existing book by ID.  
```DELETE /books/:id``` → Delete a book by ID.

#### Start frontend (React)  
```bash
cd frontend  
npm run dev  
```

App runs at: http://localhost:5173

---

## 🔮 Future Improvements
- User authentication (login/signup)
- Search and filter books by title/author/year
- Book cover image uploads
- Pagination for large lists
- Deployment to Vercel & Render
