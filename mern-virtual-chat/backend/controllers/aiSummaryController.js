const Message = require("../models/messageModel");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const groq = require("../groq");

/**
 * Convert stored URL → local disk path
 * Example:
 *  http://localhost:5000/uploads/abc.pdf
 *  → backend/uploads/abc.pdf
 */
function resolveLocalPdfPath(content) {
  if (content.startsWith("http")) {
    const filename = content.split("/uploads/")[1];
    return path.join(process.cwd(), "uploads", filename);
  }
  return path.join(process.cwd(), content);
}

const summarizeUnifiedContext = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    if (!messages.length) {
      return res.status(404).json({ message: "No messages found" });
    }

    let context = "STUDY CHAT CONTEXT:\n\n";

    // Temp folder (safe on D drive if you want later)
    const TEMP_ROOT = path.join(process.cwd(), "temp");
    if (!fs.existsSync(TEMP_ROOT)) {
      fs.mkdirSync(TEMP_ROOT, { recursive: true });
    }

    for (const msg of messages) {
      // ---------- PDF ----------
      if (
        msg.messageType === "file" &&
        msg.fileName?.toLowerCase().endsWith(".pdf")
      ) {
        const pdfPath = resolveLocalPdfPath(msg.content);

        if (!fs.existsSync(pdfPath)) {
          console.error("PDF NOT FOUND:", pdfPath);
          context += `\n📄 PDF (${msg.fileName}): [File not found]\n`;
          continue;
        }

        try {
          const jobId = Date.now().toString();
          const outputBase = path.join(TEMP_ROOT, jobId, "page");

          fs.mkdirSync(path.dirname(outputBase), { recursive: true });

          // Convert PDF → images
          await new Promise((resolve, reject) => {
            exec(
              `pdftoppm "${pdfPath}" "${outputBase}" -png`,
              (err) => {
                if (err) return reject(err);
                resolve();
              }
            );
          });

          const images = fs
            .readdirSync(path.join(TEMP_ROOT, jobId))
            .filter((f) => f.endsWith(".png"));

          if (images.length === 0) {
            context += `\n📄 PDF (${msg.fileName}): [No pages extracted]\n`;
            continue;
          }

          // ⚠️ OCR placeholder (text PDFs will still work via chat context)
          context += `\n📄 PDF (${msg.fileName}): [Scanned PDF detected – OCR required]\n`;

        } catch (err) {
          console.error(`PDF ERROR (${msg.fileName}):`, err.message);
          context += `\n📄 PDF (${msg.fileName}): [PDF processing failed]\n`;
        }
      }
      // ---------- NORMAL MESSAGE ----------
      else {
        context += `${msg.sender.name}: ${msg.content}\n`;
      }
    }

    // ---------- AI PROMPT ----------
    const prompt = `
You are an AI study assistant.

Summarize the following combined chat messages and PDFs.

Return clearly structured sections:
- Key Concepts
- Important Doubts
- Conclusions
- Action Items

CONTENT:
${context}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    res.json({
      summary: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error("AI SUMMARY ERROR:", err);
    res.status(500).json({ error: "AI summarization failed" });
  }
};

module.exports = { summarizeUnifiedContext };
