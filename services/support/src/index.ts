import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error-handler';

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'opusfesta-support',
  });
});

// Placeholder routes for chatbot/dashboard API (stubs for future implementation)
app.get('/conversations', (_req, res) => {
  res.status(200).json({ conversations: [] });
});

app.post('/conversations', (_req, res) => {
  res.status(201).json({
    id: 'placeholder',
    createdAt: new Date().toISOString(),
    messages: [],
  });
});

app.get('/conversations/:id', (req, res) => {
  res.status(200).json({
    id: req.params.id,
    messages: [],
    createdAt: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Support service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
