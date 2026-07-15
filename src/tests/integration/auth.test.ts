import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { clearDatabase } from '../helpers/db';
import { app } from '../../app';

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
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    email: userData.email,
                })
            );
            expect(response.body).not.toHaveProperty('password_hash');
        });

        it('should return 400 for invalid email', async () => {
            const response = await request(app).post('/auth/register').send({
                email: "invalidemail.com", 
                password: userData.password
            });
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed',
                })
            );
        });

        it('should return 409 for duplicate email', async () => {
            const response = await request(app).post('/auth/register').send(userData);
            expect(response.status).toBe(201);
            const response2 = await request(app).post('/auth/register').send(userData);
            expect(response2.status).toBe(409);
            expect(response2.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 409,
                    message: 'Email already in use',
                })
            );
        });
    });

    describe('POST /auth/login', () => {
        it('should return a token for valid credentials', async () => {
            const registerResponse = await request(app).post('/auth/register').send(userData);
            expect(registerResponse.status).toBe(201);
            const loginResponse = await request(app).post('/auth/login').send(userData);
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body).toEqual(
                expect.objectContaining({
                    token: expect.stringMatching(/^eyJ/),
                    user: expect.objectContaining({ email: userData.email }),
                })
            );
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
            expect(loginResponse.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 401,
                    message: 'Invalid credentials'
                })
            );
        });
    });
});