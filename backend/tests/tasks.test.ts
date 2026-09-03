import request from 'supertest';
import mongoose from 'mongoose';
import app, { connectDatabase } from '../src/server';
import { User } from '../src/models/User';
import { Task } from '../src/models/Task';
import { Invitation } from '../src/models/Invitation';
import { config } from '../src/config/env';

describe('Task API', () => {
  let token = '';
  let userId = '';
  const adminEmail = config.adminEmails[0];

  beforeAll(async () => {
    await connectDatabase();
    await User.deleteMany({});
    const user = await User.create({
      name: 'Task Owner',
      email: adminEmail,
      password: 'secret123'
    });

    userId = user._id.toString();

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: 'secret123' });

    token = loginResponse.body.data.token;
  });

  beforeEach(async () => {
    await Task.deleteMany({});
    await Invitation.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should create a task for an authenticated user', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Implement login screen',
        description: 'Create a polished login page with validation',
        status: 'Todo',
        priority: 'High',
        assignee: userId
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Implement login screen');
  });

  it('should list tasks with search and filter support', async () => {
    await Task.create({
      title: 'Task Search Example',
      description: 'This task should be searchable',
      status: 'In Progress',
      priority: 'Medium',
      assignee: userId,
      creator: userId
    });

    const res = await request(app)
      .get('/api/tasks?search=search&status=In%20Progress&priority=Medium')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tasks).toHaveLength(1);
  });

  it('should allow adding a comment to a task', async () => {
    const task = await Task.create({
      title: 'Review PR',
      description: 'Check the PR and share feedback',
      status: 'Todo',
      priority: 'Low',
      creator: userId
    });

    const res = await request(app)
      .post(`/api/tasks/${task._id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Looks good overall.' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comments[0].text).toBe('Looks good overall.');
  });

  it('should allow short but meaningful task data during creation', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Fix',
        description: 'Update UI',
        status: 'Todo',
        priority: 'Medium'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Fix');
  });

  it('should invite a new team member', async () => {
    const res = await request(app)
      .post('/api/auth/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'kavinchakravarthi2934@gmail.com',
        jobRole: 'Admin'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('kavinchakravarthi2934@gmail.com');
    expect(res.body.data.status).toBe('pending');
    const invitation = await Invitation.findOne({ email: 'kavinchakravarthi2934@gmail.com' });
    expect(invitation?.jobRole).toBe('Admin'); 
  });

  it('should reject invitations from normal users', async () => {
    const user = await User.create({
      name: 'Normal User',
      email: 'normal@example.com',
      password: 'secret123'
    });
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'normal@example.com', password: 'secret123' });

    const res = await request(app)
      .post('/api/auth/invite')
      .set('Authorization', `Bearer ${loginResponse.body.data.token}`)
      .send({ email: 'blocked@example.com' });

    expect(user.role).toBe('user');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
