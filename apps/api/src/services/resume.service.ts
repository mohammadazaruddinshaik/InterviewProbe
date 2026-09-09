import path from 'node:path';
import { prisma } from './database.service';
import { extractPdfText } from './pdf-extraction.service';
import { AppError } from '../utils/errors';

function assertInterviewId(id: string): void {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new AppError(400, 'Interview ID is invalid');
  }
}

function safeFileName(originalName: string): string {
  const baseName = path.basename(originalName).replace(/[\u0000-\u001f]/g, '').trim();
  return baseName || 'resume.pdf';
}

export async function ingestResume(userId: string, interviewId: string, file?: Express.Multer.File) {
  assertInterviewId(interviewId);
  if (!file) {
    throw new AppError(400, 'Exactly one resume PDF is required');
  }

  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, userId },
    select: { id: true },
  });
  if (!interview) {
    throw new AppError(404, 'Interview not found');
  }

  const rawText = await extractPdfText(file);
  const resume = await prisma.resume.upsert({
    where: { interviewId },
    create: {
      interviewId,
      fileName: safeFileName(file.originalname),
      rawText,
    },
    update: {
      fileName: safeFileName(file.originalname),
      rawText,
    },
    select: {
      id: true,
      interviewId: true,
      fileName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    ...resume,
    textLength: rawText.length,
  };
}
