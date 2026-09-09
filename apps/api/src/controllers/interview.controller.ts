import type { NextFunction, Request, Response } from 'express';
import {
  createInterview,
  getInterview,
  listInterviews,
  updateInterview,
} from '../services/interview.service';
import {
  parseCreateInterviewInput,
  parseUpdateInterviewInput,
} from '../utils/validation';

export async function create(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const interview = await createInterview(request.userId!, parseCreateInterviewInput(request.body));
    response.status(201).json({ interview });
  } catch (error) {
    next(error);
  }
}

export async function list(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const interviews = await listInterviews(request.userId!);
    response.json({ interviews });
  } catch (error) {
    next(error);
  }
}

export async function get(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const interviewId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    const interview = await getInterview(request.userId!, interviewId);
    response.json({ interview });
  } catch (error) {
    next(error);
  }
}

export async function update(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const interviewId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    const interview = await updateInterview(
      request.userId!,
      interviewId,
      parseUpdateInterviewInput(request.body),
    );
    response.json({ interview });
  } catch (error) {
    next(error);
  }
}
