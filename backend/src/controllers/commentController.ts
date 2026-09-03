import { Response } from 'express';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/auth';
import { sendError, sendSuccess } from '../utils/response';

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    const comment = {
      author: req.user?.id,
      text,
      createdAt: new Date()
    };

    task.comments.push(comment as any);
    await task.save();

    return sendSuccess(res, 201, task, 'Comment added successfully');
  } catch (error: any) {
    return sendError(res, 400, 'Comment creation failed', error.message);
  }
};
