import express from 'express';
import authRouter from './routes/auth.routes';
import healthRouter from './routes/health.routes';
import interviewRouter from './routes/interview.routes';
import { authenticate } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(express.json());
app.use(healthRouter);
app.use('/auth', authRouter);
app.use('/interviews', authenticate, interviewRouter);
app.use(errorHandler);

export default app;
