import type { NextFunction, Request, Response } from 'express';
import { getCurrentUser, loginUser, registerUser } from '../services/auth.service';
import { parseLoginInput, parseRegisterInput } from '../utils/validation';

export async function register(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await registerUser(parseRegisterInput(request.body));
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await loginUser(parseLoginInput(request.body));
    response.json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getCurrentUser(request.userId!);
    response.json({ user });
  } catch (error) {
    next(error);
  }
}
