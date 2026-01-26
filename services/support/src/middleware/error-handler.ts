import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Support service error:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
}
