const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  summarizeUnifiedContext,
} = require("../controllers/aiSummaryController");

const router = express.Router();

router.get("/summarize/:chatId", protect, summarizeUnifiedContext);

module.exports = router;
