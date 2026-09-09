import { InterviewStatus } from '@prisma/client';
import { AppError } from './errors';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateInterviewInput {
  title: string;
}

export interface UpdateInterviewInput {
  title?: string;
  status?: InterviewStatus;
}

function requireObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError(400, 'Request body must be an object');
  }

  return value as Record<string, unknown>;
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') {
    throw new AppError(400, 'A valid email is required');
  }

  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError(400, 'A valid email is required');
  }

  return email;
}

function requireString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string') {
    throw new AppError(400, `${field} is required`);
  }

  const result = value.trim();
  if (!result || result.length > maxLength) {
    throw new AppError(400, `${field} is invalid`);
  }

  return result;
}

function requirePassword(value: unknown): string {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) {
    throw new AppError(400, 'Password must be between 8 and 128 characters');
  }

  return value;
}

export function parseRegisterInput(body: unknown): RegisterInput {
  const input = requireObject(body);
  return {
    name: requireString(input.name, 'Name', 100),
    email: normalizeEmail(input.email),
    password: requirePassword(input.password),
  };
}

export function parseLoginInput(body: unknown): LoginInput {
  const input = requireObject(body);
  return {
    email: normalizeEmail(input.email),
    password: requirePassword(input.password),
  };
}

export function parseCreateInterviewInput(body: unknown): CreateInterviewInput {
  const input = requireObject(body);
  return {
    title: requireString(input.title, 'Title', 200),
  };
}

export function parseUpdateInterviewInput(body: unknown): UpdateInterviewInput {
  const input = requireObject(body);
  const allowedFields = ['title', 'status'];
  const unexpectedField = Object.keys(input).find((field) => !allowedFields.includes(field));
  if (unexpectedField) {
    throw new AppError(400, `Field ${unexpectedField} cannot be updated`);
  }

  const update: UpdateInterviewInput = {};
  if (input.title !== undefined) {
    update.title = requireString(input.title, 'Title', 200);
  }
  if (input.status !== undefined) {
    if (typeof input.status !== 'string' || !Object.values(InterviewStatus).includes(input.status as InterviewStatus)) {
      throw new AppError(400, 'Status is invalid');
    }
    update.status = input.status as InterviewStatus;
  }
  if (Object.keys(update).length === 0) {
    throw new AppError(400, 'At least one editable field is required');
  }

  return update;
}
