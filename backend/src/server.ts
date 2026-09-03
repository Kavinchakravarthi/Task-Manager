import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { config } from './config/env';
import { sendError } from './utils/response';

const app = express();

const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use((err: any, _req: any, res: any, _next: any) => {
  if (err) {
    return sendError(res, 500, 'Internal server error', err.message);
  }
});

export const connectDatabase = async () => {
  if (config.mongoUri) {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected successfully');
    return;
  }

  const memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();

  await mongoose.connect(uri);
  console.log('In-memory MongoDB connected for local/testing use');
};

export const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (error: any) {
    console.error('Database connection failed:', error.message);
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port} without DB connection`);
    });
  }
};

if (process.env.NODE_ENV !== 'test' && require.main === module) {
  startServer();
}

export default app;
