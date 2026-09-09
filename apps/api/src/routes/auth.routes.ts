import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { login, me, register } from '../controllers/auth.controller';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', authenticate, me);

export default authRouter;
