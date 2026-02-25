require("dotenv").config({ path: __dirname + "/.env", override: true });
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5555;
const booksRoute = require("./routes/booksRoute");
const cors = require("cors");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to Book Store" });
});
app.use("/books", booksRoute);

mongoose
  .connect(process.env.MONGO_URI, { dbName: "books" })
  .then(() => {
    console.log("Connected to MongoDB...");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}...`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));
