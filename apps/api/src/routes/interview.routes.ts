import { Router } from 'express';
import { create, get, list, update } from '../controllers/interview.controller';
import { upload } from '../controllers/resume.controller';
import { uploadResume } from '../middleware/upload.middleware';

const interviewRouter = Router();

interviewRouter.post('/', create);
interviewRouter.get('/', list);
interviewRouter.get('/:id', get);
interviewRouter.patch('/:id', update);
interviewRouter.post('/:id/resume', uploadResume.single('resume'), upload);

export default interviewRouter;
