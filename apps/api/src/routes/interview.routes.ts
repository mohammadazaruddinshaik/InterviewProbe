import { Router } from 'express';
import { create, get, list, update } from '../controllers/interview.controller';

const interviewRouter = Router();

interviewRouter.post('/', create);
interviewRouter.get('/', list);
interviewRouter.get('/:id', get);
interviewRouter.patch('/:id', update);

export default interviewRouter;
