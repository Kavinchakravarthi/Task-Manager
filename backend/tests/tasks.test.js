"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = __importStar(require("../src/server"));
const User_1 = require("../src/models/User");
const Task_1 = require("../src/models/Task");
describe('Task API', () => {
    let token = '';
    let userId = '';
    beforeAll(async () => {
        await (0, server_1.connectDatabase)();
        const user = await User_1.User.create({
            name: 'Task Owner',
            email: 'owner@example.com',
            password: 'secret123'
        });
        userId = user._id.toString();
        const loginResponse = await (0, supertest_1.default)(server_1.default)
            .post('/api/auth/login')
            .send({ email: 'owner@example.com', password: 'secret123' });
        token = loginResponse.body.data.token;
    });
    beforeEach(async () => {
        await Task_1.Task.deleteMany({});
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
    });
    it('should create a task for an authenticated user', async () => {
        const res = await (0, supertest_1.default)(server_1.default)
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
        await Task_1.Task.create({
            title: 'Task Search Example',
            description: 'This task should be searchable',
            status: 'In Progress',
            priority: 'Medium',
            assignee: userId,
            creator: userId
        });
        const res = await (0, supertest_1.default)(server_1.default)
            .get('/api/tasks?search=search&status=In%20Progress&priority=Medium')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.tasks).toHaveLength(1);
    });
    it('should allow adding a comment to a task', async () => {
        const task = await Task_1.Task.create({
            title: 'Review PR',
            description: 'Check the PR and share feedback',
            status: 'Todo',
            priority: 'Low',
            creator: userId
        });
        const res = await (0, supertest_1.default)(server_1.default)
            .post(`/api/tasks/${task._id}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Looks good overall.' });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.comments[0].text).toBe('Looks good overall.');
    });
});
