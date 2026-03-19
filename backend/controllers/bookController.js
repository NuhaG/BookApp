const Book = require("../models/bookModel");
const asyncHandler = require("../utils/asyncHandler");
const fs = require("fs/promises");
const path = require("path");

// utility for filter, sort, field limit, paginate from query params
const APIFeatures = require("../utils/apiFeatures");

// Normalize genre input from either JSON arrays, repeated fields, or plain strings.
const normalizeGenre = (rawGenre) => {
  if (rawGenre === undefined) return undefined;

  if (Array.isArray(rawGenre)) {
    return rawGenre.map((genre) => String(genre).trim()).filter(Boolean);
  }

  if (typeof rawGenre === "string") {
    const trimmed = rawGenre.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((genre) => String(genre).trim()).filter(Boolean);
        }
      } catch (err) {
        console.log(err.message);        
      }
    }

    return [trimmed];
  }

  return [];
};

// Build a MongoDB filter object mirroring APIFeatures.filter().
const buildFilterQuery = (queryString) => {
  const queryObj = { ...queryString };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  let parsed = JSON.stringify(queryObj);
  parsed = parsed.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  return JSON.parse(parsed);
};

// Resolve the public cover path for locally stored uploads.
const getUploadedCoverPath = (req) => {
  if (!req.file) return undefined;
  return `/uploads/covers/${req.file.filename}`;
};

// Remove local cover files only when they belong to our upload directory.
const deleteLocalCover = async (coverPath) => {
  if (
    typeof coverPath !== "string" ||
    !coverPath.startsWith("/uploads/covers/")
  ) {
    return;
  }

  const relativePath = coverPath.replace(/^\/+/, "");
  const absolutePath = path.join(__dirname, "..", relativePath);

  try {
    await fs.unlink(absolutePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
};

// Centralized cleanup for locally stored covers.
const deleteStoredCover = async (coverPath) => {
  await deleteLocalCover(coverPath);
};

// Build payload for create requests (supports JSON and multipart/form-data).
const buildBookPayload = (req) => {
  const { title, author, publishedYear, description, coverImg } = req.body;

  const payload = {
    title,
    author,
    publishedYear,
    description,
    createdBy: req.user?._id,
  };

  const genre = normalizeGenre(req.body.genre);
  if (genre !== undefined) payload.genre = genre;

  const uploadedCover = getUploadedCoverPath(req);
  if (uploadedCover) {
    payload.coverImg = uploadedCover;
  } else if (coverImg !== undefined) {
    payload.coverImg = coverImg;
  }

  return payload;
};

// Build a partial update payload so PATCH only changes provided fields.
const buildBookUpdatePayload = (req) => {
  const payload = {};
  const allowedFields = [
    "title",
    "author",
    "publishedYear",
    "description",
    "coverImg",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      payload[field] = req.body[field];
    }
  });

  const genre = normalizeGenre(req.body.genre);
  if (genre !== undefined) payload.genre = genre;

  const uploadedCover = getUploadedCoverPath(req);
  if (uploadedCover) {
    payload.coverImg = uploadedCover;
  }

  return payload;
};

// create new book
const createBook = asyncHandler(async (req, res) => {
  const { title, author, publishedYear } = req.body;

  if (!title || !author || !publishedYear) {
    res.status(400);
    throw new Error("title, author, publishedYear are required");
  }

  // createdBy is set from the authenticated user (not trusted from client).
  const newBook = await Book.create(buildBookPayload(req));

  res.status(201).json({
    success: true,
    message: "Book created successfully",
    book: newBook,
  });
});

// get all books (query param features)
const getBooks = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 100;
  const filterQuery = buildFilterQuery(req.query);

  const total = await Book.countDocuments(filterQuery);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Build Mongoose query with filtering, sorting, field limiting, and pagination.
  const features = new APIFeatures(Book.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const books = await features.query;

  res.status(200).json({
    success: true,
    results: books.length,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    data: { books },
  });
});

// get books created by authenticated user
const getMyBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ createdBy: req.user._id }).sort("-createdAt");

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
  const updates = buildBookUpdatePayload(req);

  if (!updates || Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error("At least one field is required to update");
  }

  const existingBook = await Book.findById(req.params.id);

  if (!existingBook) {
    res.status(404);
    throw new Error("Book not found");
  }

  const book = await Book.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  // If a new file upload was accepted, remove the old stored asset.
  if (req.file) {
    await deleteStoredCover(existingBook.coverImg);
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

  await deleteStoredCover(book.coverImg);

  res.status(200).json({
    success: true,
    message: "Book deleted successfully",
  });
});

// publish a chapter for a book (creator/admin only via route guard)
const addChapter = asyncHandler(async (req, res) => {
  const { title, content, chapterNumber } = req.body;

  if (!title || !content || !chapterNumber) {
    res.status(400);
    throw new Error("title, content, chapterNumber are required");
  }

  const parsedChapterNumber = Number(chapterNumber);
  if (!Number.isInteger(parsedChapterNumber) || parsedChapterNumber < 1) {
    res.status(400);
    throw new Error("chapterNumber must be a positive integer");
  }

  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  // Keep chapter numbers unique per book for deterministic reading order.
  const duplicateNumber = (book.chapters || []).some(
    (chapter) => Number(chapter.chapterNumber) === parsedChapterNumber,
  );

  if (duplicateNumber) {
    res.status(400);
    throw new Error("A chapter with this chapterNumber already exists");
  }

  book.chapters.push({
    title,
    content,
    chapterNumber: parsedChapterNumber,
    isPublished: req.body.isPublished !== false,
    publishedAt: new Date(),
  });

  book.chapters.sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber));
  await book.save();

  res.status(201).json({
    success: true,
    message: "Chapter published successfully",
    book,
  });
});

module.exports = {
  createBook,
  getBooks,
  getMyBooks,
  getBook,
  updateBook,
  deleteBook,
  addChapter,
};
