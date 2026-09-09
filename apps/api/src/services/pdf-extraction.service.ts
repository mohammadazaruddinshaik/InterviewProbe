import pdfParse from 'pdf-parse';
import path from 'node:path';
import { AppError } from '../utils/errors';

const PDF_SIGNATURE = Buffer.from('%PDF-');

export async function extractPdfText(file: Express.Multer.File): Promise<string> {
  if (file.mimetype !== 'application/pdf' || path.extname(file.originalname).toLowerCase() !== '.pdf') {
    throw new AppError(415, 'Resume must be uploaded as a PDF');
  }

  if (!file.buffer.subarray(0, PDF_SIGNATURE.length).equals(PDF_SIGNATURE)) {
    throw new AppError(415, 'Uploaded file is not a valid PDF');
  }

  let parsedPdf: Awaited<ReturnType<typeof pdfParse>>;
  try {
    parsedPdf = await pdfParse(file.buffer);
  } catch {
    throw new AppError(422, 'PDF could not be processed');
  }

  const rawText = parsedPdf.text.replace(/\u0000/g, '').trim();
  if (!rawText || !/[\p{L}\p{N}]/u.test(rawText)) {
    throw new AppError(422, 'PDF does not contain meaningful extractable text');
  }

  return rawText;
}
