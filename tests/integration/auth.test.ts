import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { clearDatabase } from '../helpers/db';
import { app } from '../../src/app';

describe('Auth API', () => {
    beforeEach(async () => {
        await clearDatabase();
    });

    const userData = {
        email: 'test@test.com',
        password: 'SecurePass123'
    }

    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app).post('/auth/register').send(userData);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('email', 'test@test.com');
            expect(response.body).not.toHaveProperty('password_hash');
        });

        it('should return 400 for invalid email', async () => {
            const response = await request(app).post('/auth/register').send({
                email: "invalidemail.com", 
                password: userData.password
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 400);
            expect(response.body).toHaveProperty('message', 'Validation failed');
        });

        it('should return 409 for duplicate email', async () => {
            const response = await request(app).post('/auth/register').send(userData);
            expect(response.status).toBe(201);
            const response2 = await request(app).post('/auth/register').send(userData);
            expect(response2.status).toBe(409);
            expect(response2.body).toHaveProperty('status', 'Error');
            expect(response2.body).toHaveProperty('statusCode', 409);
            expect(response2.body).toHaveProperty('message', 'Email already in use');
        });
    });

    describe('POST /auth/login', () => {
        it('should return a token for valid credentials', async () => {
            const registerResponse = await request(app).post('/auth/register').send(userData);
            expect(registerResponse.status).toBe(201);
            const loginResponse = await request(app).post('/auth/login').send(userData);
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body).toHaveProperty('token');
            expect(loginResponse.body.token).toMatch(/^eyJ/);
            expect(loginResponse.body.user).toHaveProperty('email', 'test@test.com');
            expect(loginResponse.body.user).not.toHaveProperty('password_hash');
        });

        it('should return 401 for wrong password', async () => {
            const registerResponse = await request(app).post('/auth/register').send(userData);
            expect(registerResponse.status).toBe(201);
            const loginResponse = await request(app).post('/auth/login').send({ 
                email: userData.email, 
                password: 'WrongPass123' 
            });
            expect(loginResponse.status).toBe(401);
            expect(loginResponse.body).toHaveProperty('status', 'Error');
            expect(loginResponse.body).toHaveProperty('statusCode', 401);
            expect(loginResponse.body).toHaveProperty('message', 'Invalid credentials');
        });
    });
});