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
  // simple query
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);
  // let query = Book.find(queryObj);

  // adv query
  let queryString = JSON.stringify(queryObj);
  queryString = queryString.replace(
    /\b(gte|gt|lte|lt)\b/g,
    (match) => `$${match}`,
  );
  let query = Book.find(JSON.parse(queryString));

  // sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  if (req.query.page) {
    const numBooks = await Book.countDocuments();
    if (skip >= numBooks) {
      return res.status(404).json({
        success: false,
        message: "This page does not exist",
      });
    }

    query = query.skip(skip).limit(limit);
  }

  const books = await query;

  res.status(200).json({
    success: true,
    results: books.length,
    page,
    limit,
    data: books,
  });
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
