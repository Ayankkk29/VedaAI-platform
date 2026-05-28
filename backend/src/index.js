import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db.js';
import { checkRedisConnection } from './config/redis.js';
import { initQueue } from './queues/assignment.queue.js';
import { initWorker } from './workers/assignment.worker.js';
import { initSocketServer } from './sockets/socket.manager.js';
import assignmentRoutes from './routes/assignment.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Body parser
app.use(express.json());

// Base Route
app.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'healthy',
    database: dbStatus.connected ? 'connected' : (dbStatus.mockMode ? 'mock-mode' : 'disconnected'),
    time: new Date()
  });
});

// Register API Routes
app.use('/api/assignments', assignmentRoutes);

// Bootstrap services
async function bootstrap() {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Check Redis connection
  await checkRedisConnection();

  // 3. Initialize Socket.IO Server
  initSocketServer(server);

  // 4. Initialize BullMQ Queue
  initQueue();

  // 5. Initialize BullMQ Worker
  initWorker();

  // 5. Start Server
  server.listen(PORT, () => {
    console.log(`🚀 VedaAI Backend running on port ${PORT}`);
    console.log(`📡 Healthcheck endpoint: http://localhost:${PORT}/health`);
    // Database reset trigger
  });
}

bootstrap().catch((error) => {
  console.error('❌ Failed to bootstrap backend server:', error);
  process.exit(1);
});
