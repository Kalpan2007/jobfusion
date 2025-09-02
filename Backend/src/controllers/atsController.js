const pdfParse = require("pdf-parse");
const fs = require("fs");

// Simple file processing controller - AI analysis will be done in frontend
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Read and parse the uploaded PDF
    const fileData = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(fileData);
    const pdfText = pdfData.text;
    const numPages = pdfData.numpages;

    // Delete file after processing
    fs.unlinkSync(req.file.path);

    // Return the extracted text for frontend AI analysis
    res.json({
      success: true,
      message: "Resume processed successfully",
      data: {
        text: pdfText,
        pageCount: numPages,
        wordCount: pdfText.split(/\s+/).length
      }
    });
  } catch (error) {
    console.error("Error processing resume:", error);
    res.status(500).json({ success: false, message: "Error processing resume" });
  }
};

module.exports = { analyzeResume };