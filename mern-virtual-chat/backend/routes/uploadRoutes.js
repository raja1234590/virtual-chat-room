const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");

router.post(
  "/",
  protect,
  (req, res, next) => {
    upload.single("file")(req, res, function (err) {
      if (err) {
        return res.status(400).json({
          message: err.message || "File upload error",
        });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({
      fileUrl: `http://localhost:5000/uploads/${req.file.filename}`,

      fileName: req.file.originalname,
    });
  }
);

module.exports = router;
