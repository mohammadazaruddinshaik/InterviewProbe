import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { getJwtSecret } from '../config/env';
import { prisma } from './database.service';
import { AppError } from '../utils/errors';
import type { LoginInput, RegisterInput } from '../utils/validation';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

function createToken(userId: string): string {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: '7d' });
}

export async function registerUser(input: RegisterInput): Promise<{ user: PublicUser; token: string }> {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw new AppError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
      select: publicUserSelect,
    });

    return { user, token: createToken(user.id) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'Email is already registered');
    }
    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, 'Invalid email or password');
  }

  const publicUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: publicUserSelect,
  });
  return { user: publicUser, token: createToken(user.id) };
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });
  if (!user) {
    throw new AppError(401, 'Authentication required');
  }

  return user;
}
