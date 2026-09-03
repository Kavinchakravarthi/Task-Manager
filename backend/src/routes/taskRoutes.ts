import { Router } from 'express';
import { body } from 'express-validator';
import { addComment } from '../controllers/commentController';
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from '../controllers/taskController';
import { protect } from '../middleware/auth';
import { validateRequest } from '../utils/validateRequest';

const router = Router();

router.use(protect);

router.get('/', getTasks);

router.post(
  '/',
  [
    body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
    body('description').trim().isLength({ min: 3, max: 4000 }).withMessage('Description must be between 3 and 4000 characters'),
    body('status').isIn(['Todo', 'In Progress', 'Done']).withMessage('Invalid status'),
    body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
    body('startDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid start date'),
    body('dueDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid due date'),
    body().custom((body) => {
      const today = new Date().toISOString().slice(0, 10);
      if (body.dueDate && body.dueDate < today) {
        throw new Error('Due date cannot be in the past');
      }
      if (body.startDate && body.dueDate && new Date(body.dueDate) < new Date(body.startDate)) {
        throw new Error('Due date cannot be before the start date');
      }
      return true;
    })
  ],
  validateRequest,
  createTask
);

router.get('/:id', getTaskById);
router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
    body('description').optional().trim().isLength({ min: 3, max: 4000 }).withMessage('Description must be between 3 and 4000 characters'),
    body('status').optional().isIn(['Todo', 'In Progress', 'Done']).withMessage('Invalid status'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
    body('startDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid start date'),
    body('dueDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid due date'),
    body().custom((body) => {
      const today = new Date().toISOString().slice(0, 10);
      if (body.dueDate && body.dueDate < today) {
        throw new Error('Due date cannot be in the past');
      }
      if (body.startDate && body.dueDate && new Date(body.dueDate) < new Date(body.startDate)) {
        throw new Error('Due date cannot be before the start date');
      }
      return true;
    })
  ],
  validateRequest,
  updateTask
);
router.delete('/:id', deleteTask);
router.post(
  '/:id/comments',
  [body('text').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be between 1 and 2000 characters')],
  validateRequest,
  addComment
);

export default router;
