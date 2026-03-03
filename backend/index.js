require("dotenv").config({ path: __dirname + "/.env", override: true });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const booksRoute = require("./routes/booksRoute");
const reviewRoute = require("./routes/reviewRoute"); // 1. Import Review Route
const errorHandler = require("./middleware/errorHandler");
const mockAuth = require('./middleware/mockAuth');

const app = express();
app.set("query parser", "extended");
const PORT = process.env.PORT || 5555;

app.use(express.json());
app.use(mockAuth);
app.use(cors());

// --- ROUTES ---

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to Book Store" });
});

// 2. Direct Review Routes (e.g., DELETE /reviews/123)
app.use("/reviews", reviewRoute);

// 3. Book Routes & Nested Review Routes
// This handles /books and /books/:bookId/reviews
app.use("/books", booksRoute);

// --- ERROR HANDLING ---
app.use(errorHandler);

// --- DATABASE CONNECTION ---
mongoose
  .connect(process.env.MONGO_URI, { dbName: "books" })
  .then(() => {
    console.log("Connected to MongoDB...");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}...`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));