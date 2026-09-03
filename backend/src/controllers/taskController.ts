import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { sendError, sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || '');
    const priority = String(req.query.priority || '');
    const assignee = String(req.query.assignee || '');
    const sortField = String(req.query.sortField || 'createdAt');
    const sortOrder = String(req.query.sortOrder || 'desc') === 'asc' ? 1 : -1;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return sendSuccess(res, 200, {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    }, 'Tasks fetched successfully');
  } catch (error: any) {
    return sendError(res, 500, 'Unable to fetch tasks', error.message);
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, startDate, dueDate, assignee } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      startDate: startDate || null,
      dueDate: dueDate || null,
      assignee,
      creator: req.user?.id
    });

    return sendSuccess(res, 201, task, 'Task created successfully');
  } catch (error: any) {
    return sendError(res, 400, 'Task creation failed', error.message);
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .populate('comments.author', 'name email');

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    return sendSuccess(res, 200, task, 'Task fetched successfully');
  } catch (error: any) {
    return sendError(res, 500, 'Unable to fetch task', error.message);
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    const allowedFields = ['title', 'description', 'status', 'priority', 'startDate', 'dueDate', 'assignee'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        task.set(field, req.body[field]);
      }
    }

    await task.save();

    return sendSuccess(res, 200, task, 'Task updated successfully');
  } catch (error: any) {
    return sendError(res, 400, 'Task update failed', error.message);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    await task.deleteOne();
    return sendSuccess(res, 200, null, 'Task deleted successfully');
  } catch (error: any) {
    return sendError(res, 400, 'Task deletion failed', error.message);
  }
};
