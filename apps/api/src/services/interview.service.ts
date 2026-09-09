import { InterviewStatus } from '@prisma/client';
import { prisma } from './database.service';
import { AppError } from '../utils/errors';
import type { CreateInterviewInput, UpdateInterviewInput } from '../utils/validation';

const summarySelect = {
  id: true,
  title: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      repositories: true,
      sessions: true,
    },
  },
} as const;

const detailSelect = {
  ...summarySelect,
  resume: {
    select: {
      id: true,
      fileName: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  repositories: {
    select: {
      id: true,
      url: true,
      name: true,
      defaultBranch: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  sessions: {
    select: {
      id: true,
      round: true,
      status: true,
      difficulty: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} as const;

type SummaryRecord = {
  id: string;
  title: string;
  status: InterviewStatus;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    repositories: number;
    sessions: number;
  };
};

function toSummary(interview: SummaryRecord) {
  return {
    id: interview.id,
    title: interview.title,
    status: interview.status,
    createdAt: interview.createdAt,
    updatedAt: interview.updatedAt,
    counts: {
      repositories: interview._count.repositories,
      sessions: interview._count.sessions,
    },
  };
}

function assertInterviewId(id: string): void {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new AppError(400, 'Interview ID is invalid');
  }
}

export async function createInterview(userId: string, input: CreateInterviewInput) {
  const interview = await prisma.interview.create({
    data: {
      userId,
      title: input.title,
    },
    select: summarySelect,
  });

  return toSummary(interview);
}

export async function listInterviews(userId: string) {
  const interviews = await prisma.interview.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: summarySelect,
  });

  return interviews.map(toSummary);
}

export async function getInterview(userId: string, id: string) {
  assertInterviewId(id);
  const interview = await prisma.interview.findFirst({
    where: { id, userId },
    select: detailSelect,
  });
  if (!interview) {
    throw new AppError(404, 'Interview not found');
  }

  return {
    ...toSummary(interview),
    resume: interview.resume,
    repositories: interview.repositories,
    sessions: interview.sessions,
  };
}

export async function updateInterview(userId: string, id: string, input: UpdateInterviewInput) {
  assertInterviewId(id);
  const existingInterview = await prisma.interview.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existingInterview) {
    throw new AppError(404, 'Interview not found');
  }

  const interview = await prisma.interview.update({
    where: { id },
    data: input,
    select: summarySelect,
  });

  return toSummary(interview);
}
