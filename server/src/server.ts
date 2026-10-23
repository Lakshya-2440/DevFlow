import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { voiceRouter } from './routes/voice';
import { generateRouter } from './routes/generate';
import { workspaceRouter } from './routes/workspace';
import { mcpRouter } from './routes/mcp';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup: allow all in dev, supports Vercel preview & prod deployments
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-hf-token'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Healthcheck endpoint for Render / monitoring
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'DevFlow Backend Engine',
  });
});

// App Routes
app.use('/api/voice', voiceRouter);
app.use('/api/generate', generateRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/mcp', mcpRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`[DevFlow Backend] listening at http://localhost:${PORT}`);
});
