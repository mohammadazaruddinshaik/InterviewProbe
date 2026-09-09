import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { AppError } from '../utils/errors';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      response.status(413).json({ error: 'Resume file must be 5 MB or smaller' });
      return;
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE' || error.code === 'LIMIT_FILE_COUNT') {
      response.status(400).json({ error: 'Exactly one resume PDF is required' });
      return;
    }

    response.status(400).json({ error: 'Invalid multipart upload' });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  response.status(500).json({ error: 'Internal server error' });
};
