require("dotenv").config({ path: __dirname + "/.env", override: true });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// route modules
const booksRoute = require("./routes/booksRoute");
const reviewRoute = require("./routes/reviewRoute");

// error middleware
const errorHandler = require("./middleware/errorHandler");

// mock auth middleware
const mockAuth = require("./middleware/mockAuth");

const app = express();
app.set("query parser", "extended");
const PORT = process.env.PORT || 5555;

// middlewares
app.use(express.json());
app.use(mockAuth);
app.use(cors());

// routes
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to Book Store" });
});
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
