import multer from 'multer';

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

export const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RESUME_SIZE_BYTES,
    files: 1,
  },
});
