import type { NextFunction, Request, Response } from 'express';
import { ingestResume } from '../services/resume.service';

export async function upload(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const interviewId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    const resume = await ingestResume(request.userId!, interviewId, request.file);
    response.status(201).json({ resume });
  } catch (error) {
    next(error);
  }
}
