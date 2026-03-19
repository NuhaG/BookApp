require("dotenv").config({ path: __dirname + "/.env", override: true });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// route modules
const booksRoute = require("./routes/booksRoute");
const reviewRoute = require("./routes/reviewRoute");
const authRoute = require("./routes/authRoute");

// error middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();
// Enable nested query parsing so filters like publishedYear[gte]=2020 work.
app.set("query parser", "extended");
const PORT = process.env.PORT || 5555;

// middlewares
app.use(express.json());
app.use(cors());
// Serve locally stored uploads.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to Book Store" });
});
app.use("/auth", authRoute);
app.use("/reviews", reviewRoute);
app.use("/books", booksRoute);

// err handler
app.use(errorHandler);

// db connect
mongoose
  .connect(process.env.MONGO_URI, { dbName: "books" })
  .then(() => {
    console.log("Connected to MongoDB...");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}...`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));
