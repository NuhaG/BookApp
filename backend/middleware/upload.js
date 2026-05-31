const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "uploads", "covers");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Only image files are allowed for cover uploads"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadCover = (req, res, next) => {
  // Wrap multer to normalize upload errors into API-friendly messages.
  upload.single("coverImg")(req, res, (err) => {
    if (err) {
      res.status(400);
      if (err.code === "LIMIT_FILE_SIZE") {
        err.message = "Cover image must be 5MB or smaller";
      }
      return next(err);
    }

    next();
  });
};

module.exports = { uploadCover };
