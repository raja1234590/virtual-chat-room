const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const Tesseract = require("tesseract.js");

const MAX_PAGES = 3;          // 🔥 OCR only first 3 pages
const OCR_TIMEOUT = 15000;    // ⏱️ 15 seconds max

// Convert PDF → PNG images
const convertPdfToImages = (pdfPath, outputDir) => {
  return new Promise((resolve, reject) => {
    const cmd = `pdftoppm -png -f 1 -l ${MAX_PAGES} "${pdfPath}" "${outputDir}/page"`;
    exec(cmd, { timeout: OCR_TIMEOUT }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const ocrPdf = async (pdfPath) => {
  const tempDir = path.join(
    __dirname,
    "../temp",
    Date.now().toString()
  );

  let fullText = "";

  try {
    await fs.ensureDir(tempDir);

    // 1️⃣ Convert PDF → images
    await convertPdfToImages(pdfPath, tempDir);

    // 2️⃣ Read generated images
    const files = fs
      .readdirSync(tempDir)
      .filter((f) => f.endsWith(".png"))
      .slice(0, MAX_PAGES);

    if (!files.length) {
      return "[No readable pages found in PDF]";
    }

    // 3️⃣ OCR images (sequential, safer)
    for (const file of files) {
      const imagePath = path.join(tempDir, file);

      const result = await Promise.race([
        Tesseract.recognize(imagePath, "eng", {
          logger: () => {},
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("OCR timeout")), OCR_TIMEOUT)
        ),
      ]);

      fullText += result.data.text + "\n";
    }

    return fullText.trim() || "[OCR completed but no text detected]";
  } catch (err) {
    console.error("OCR ERROR:", err.message);
    return "[OCR failed or timed out]";
  } finally {
    // 🧹 Always cleanup
    await fs.remove(tempDir).catch(() => {});
  }
};

module.exports = ocrPdf;
