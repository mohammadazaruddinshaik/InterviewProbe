import app from './app';
import { env, validateEnvironment } from './config/env';
import { connectDatabase } from './services/database.service';

async function startServer(): Promise<void> {
  try {
    validateEnvironment();
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`InterviewProbe API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Unable to connect to PostgreSQL', error);
    process.exit(1);
  }
}

void startServer();
