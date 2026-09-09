import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { getJwtSecret } from '../config/env';

export function authenticate(request: Request, response: Response, next: NextFunction): void {
  const authorization = request.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    response.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authorization.slice('Bearer '.length).trim();
  if (!token) {
    response.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (typeof payload === 'string' || typeof (payload as JwtPayload).sub !== 'string') {
      response.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    request.userId = (payload as JwtPayload).sub;
    next();
  } catch {
    response.status(401).json({ error: 'Invalid or expired token' });
  }
}
