import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Invitation } from '../models/Invitation';
import { config } from '../config/env';
import { sendError, sendSuccess } from '../utils/response';
import { sendInvitationEmail } from '../utils/mailer';
import crypto from 'crypto';

const generateToken = (user: { _id: string | { toString(): string }; email: string; name: string }) => {
  return jwt.sign(
    { id: String(user._id), email: user.email, name: user.name },
    config.jwtSecret as jwt.Secret,
    { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
  );
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendError(res, 400, 'User already exists');
    }

    const invitation = await Invitation.findOne({
      email: normalizedEmail,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      role: config.adminEmails.includes(normalizedEmail) ? 'admin' : 'user',
      jobRole: invitation?.jobRole || 'Developer'
    });
    await Invitation.updateOne({ email: normalizedEmail, status: 'pending' }, { $set: { status: 'accepted' } });

    sendSuccess(res, 201, {
      _id: user._id,
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: generateToken(user)
    }, 'User registered successfully');
  } catch (error: any) {
    sendError(res, 400, 'Registration failed', error.message);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    sendSuccess(res, 200, {
      _id: user._id,
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: config.adminEmails.includes(user.email) ? 'admin' : 'user',
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: config.adminEmails.includes(user.email) ? 'admin' : 'user'
      },
      token: generateToken(user)
    }, 'Login successful');
  } catch (error: any) {
    sendError(res, 400, 'Login failed', error.message);
  }
};

export const getMe = async (req: any, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, 401, 'User not found');
  }

  return sendSuccess(res, 200, user, 'User fetched successfully');
};

export const getUsers = async (_req: any, res: Response) => {
  try {
    const users = await User.find({}).select('name email role jobRole').lean();
    const members = users.map((user) => ({
      ...user,
      role: config.adminEmails.includes(user.email) ? 'admin' : 'user'
    }));
    return sendSuccess(res, 200, members, 'Users fetched successfully');
  } catch (error: any) {
    return sendError(res, 500, 'Unable to fetch users', error.message);
  }
};

export const inviteMember = async (req: any, res: Response) => {
  try {
    const { email, jobRole } = req.body;

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return sendError(res, 400, 'User already exists in the workspace');
    }

    const invitation = await Invitation.findOneAndUpdate(
      { email: normalizedEmail, status: 'pending' },
      {
        email: normalizedEmail,
        jobRole,
        invitedBy: req.user.id,
        status: 'pending',
        token: crypto.randomBytes(32).toString('hex'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    await sendInvitationEmail(normalizedEmail, invitation.token, jobRole);

    return sendSuccess(res, 201, {
      email: normalizedEmail,
      status: invitation.status,
      expiresAt: invitation.expiresAt
    }, 'Invitation sent successfully');
  } catch (error: any) {
    const errorMessage = String(error?.message || '');
    const details = errorMessage.includes('535')
      ? 'Email delivery is not configured correctly. Use a valid Gmail App Password in backend/.env and restart the backend.'
      : errorMessage;
    return sendError(res, 400, 'Invitation failed', details);
  }
};
