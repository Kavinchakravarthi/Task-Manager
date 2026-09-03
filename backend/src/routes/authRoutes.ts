import { Router } from 'express';
import { body } from 'express-validator';
import { getMe, getUsers, inviteMember, loginUser, registerUser } from '../controllers/authController';
import { protect, requireAdmin } from '../middleware/auth';
import { validateRequest } from '../utils/validateRequest';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').trim().isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validateRequest,
  registerUser
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  loginUser
);

router.get('/me', protect, getMe);
router.get('/users', protect, getUsers);
router.post(
  '/invite',
  protect,
  requireAdmin,
  [
    body('email').trim().isEmail().withMessage('Please provide a valid email'),
    body('jobRole').isIn(['Developer', 'Designer', 'Manager', 'QA']).withMessage('Please select a valid team role')
  ],
  validateRequest,
  inviteMember
);

export default router;
