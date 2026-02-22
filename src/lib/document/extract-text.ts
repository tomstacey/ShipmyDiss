// Import from lib directly — avoids pdf-parse v1's index.js trying to load a
// test PDF at import time, which fails in serverless/bundler environments.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  dataBuffer: Buffer
) => Promise<{ text: string; numpages: number; info: unknown }>;
import mammoth from "mammoth";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB — Vercel free tier body limit
const MAX_TEXT_LENGTH = 50_000; // ~12k tokens — keeps AI costs/latency reasonable

export class ExtractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtractError";
  }
}

const SUPPORTED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

/**
 * Extract plain text from a PDF or DOCX file.
 * Returns the extracted text, truncated to MAX_TEXT_LENGTH chars.
 */
export async function extractText(file: File): Promise<string> {
  // Validate file type
  const fileType = SUPPORTED_TYPES[file.type];
  const extFromName = file.name.split(".").pop()?.toLowerCase();

  if (!fileType && extFromName !== "pdf" && extFromName !== "docx") {
    throw new ExtractError(
      "Unsupported file type. Please upload a PDF or DOCX file."
    );
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    throw new ExtractError(
      `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 4 MB.`
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  // Prefer MIME type, fall back to extension
  const ext = fileType === "pdf" || extFromName === "pdf" ? "pdf" : "docx";

  let text: string;

  if (ext === "pdf") {
    text = await extractFromPdf(buffer);
  } else {
    text = await extractFromDocx(buffer);
  }

  // Clean up whitespace
  text = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();

  if (!text || text.length < 50) {
    throw new ExtractError(
      "Couldn't extract enough text from this file. It might be a scanned document or image-based PDF. Try uploading a text-based version."
    );
  }

  // Truncate to keep AI costs down
  if (text.length > MAX_TEXT_LENGTH) {
    text =
      text.slice(0, MAX_TEXT_LENGTH) +
      "\n\n[Document truncated — first ~50,000 characters analysed]";
  }

  return text;
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  try {
    const result = await pdfParse(buffer);
    return result.text;
  } catch (err) {
    throw new ExtractError(
      `Failed to read PDF: ${err instanceof Error ? err.message : "unknown error"}`
    );
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (err) {
    throw new ExtractError(
      `Failed to read DOCX: ${err instanceof Error ? err.message : "unknown error"}`
    );
  }
}
