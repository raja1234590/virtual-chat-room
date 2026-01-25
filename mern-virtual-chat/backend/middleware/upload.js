const multer = require("multer");
const path = require("path");

// Storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(
      null,
      `${Date.now()}-${file.originalname.replace(/\s+/g, "")}`
    );
  },
});

// File filter
function fileFilter(req, file, cb) {
  const allowed = /pdf|jpg|jpeg|png|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
