const Book = require("../models/bookModel");
const asyncHandler = require("../utils/asyncHandler");

const createBook = asyncHandler(async (req, res) => {
  const { title, author, publishedYear } = req.body;

  if (!title || !author || !publishedYear) {
    res.status(400);
    throw new Error("title, author, publishedYear are required");
  }

  const newBook = await Book.create({ title, author, publishedYear });

  res.status(201).json({
    success: true,
    message: "Book created successfully",
    book: newBook,
  });
});

const getBooks = asyncHandler(async (req, res) => {
  const books = await Book.find();
  res.status(200).json({ success: true, books });
});

const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  res.status(200).json({ success: true, book });
});

const updateBook = asyncHandler(async (req, res) => {
  const { title, author, publishedYear } = req.body;

  if (!title && !author && !publishedYear) {
    res.status(400);
    throw new Error("At least one field is required to update");
  }

  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  res.status(200).json({
    success: true,
    message: "Book updated successfully",
    book,
  });
});

const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  res.status(200).json({
    success: true,
    message: "Book deleted successfully",
  });
});

module.exports = { createBook, getBooks, getBook, updateBook, deleteBook };