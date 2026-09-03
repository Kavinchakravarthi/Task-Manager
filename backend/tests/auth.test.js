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
describe('Auth API', () => {
    beforeAll(async () => {
        await (0, server_1.connectDatabase)();
    });
    beforeEach(async () => {
        await User_1.User.deleteMany({});
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
    });
    it('should register a new user', async () => {
        const res = await (0, supertest_1.default)(server_1.default)
            .post('/api/auth/register')
            .send({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'secret123'
        });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data.email).toBe('testuser@example.com');
    });
    it('should reject duplicate registration', async () => {
        await User_1.User.create({
            name: 'Existing User',
            email: 'duplicate@example.com',
            password: 'secret123'
        });
        const res = await (0, supertest_1.default)(server_1.default)
            .post('/api/auth/register')
            .send({
            name: 'Test User',
            email: 'duplicate@example.com',
            password: 'secret123'
        });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
    it('should login an existing user', async () => {
        await User_1.User.create({
            name: 'Login User',
            email: 'login@example.com',
            password: 'secret123'
        });
        const res = await (0, supertest_1.default)(server_1.default)
            .post('/api/auth/login')
            .send({
            email: 'login@example.com',
            password: 'secret123'
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
    });
    it('should reject invalid credentials', async () => {
        await User_1.User.create({
            name: 'Login User',
            email: 'wrong@example.com',
            password: 'secret123'
        });
        const res = await (0, supertest_1.default)(server_1.default)
            .post('/api/auth/login')
            .send({
            email: 'wrong@example.com',
            password: 'wrongpassword'
        });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
    it('should reject unauthenticated access to protected routes', async () => {
        const res = await (0, supertest_1.default)(server_1.default).get('/api/auth/me');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
