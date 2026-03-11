const Book = require("../models/bookModel");
const asyncHandler = require("../utils/asyncHandler");

// utility for filter, sort, field limit, paginate from query params
const APIFeatures = require("../utils/apiFeatures");

// create new book
const createBook = asyncHandler(async (req, res) => {
  const { title, author, publishedYear } = req.body;

  if (!title || !author || !publishedYear) {
    res.status(400);
    throw new Error("title, author, publishedYear are required");
  }

  // createdBy is set from the authenticated user (not trusted from client).
  const newBook = await Book.create({
    ...req.body,
    title,
    author,
    publishedYear,
    createdBy: req.user?._id,
  });

  res.status(201).json({
    success: true,
    message: "Book created successfully",
    book: newBook,
  });
});

// get all books (query param features)
const getBooks = asyncHandler(async (req, res) => {
  // build query by chaning api feature func
  const features = new APIFeatures(Book.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const books = await features.query;

  res.status(200).json({
    success: true,
    results: books.length,
    data: { books },
  });
});

// get one book
const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  res.status(200).json({ success: true, book });
});

// patch a book
const updateBook = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
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

// delete a book
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
