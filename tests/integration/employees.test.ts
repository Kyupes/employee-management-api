import { describe, it, expect, afterAll, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import { clearDatabase, closeDatabase } from '../helpers/db';
import { app } from '../../src/app';
import { createEmployeesForUser, createTestUser } from '../helpers/auth';
import test from 'node:test';

describe('Employees API', () => {
    let testUser: { token: string; userId: number };
    let adminUser: { token: string; userId: number };

    beforeAll(async () => {
        testUser = await createTestUser('user@test.com', 'SecurePass123', 'user');
        adminUser = await createTestUser('admin@test.com', 'SecurePass123', 'admin');
        const employee1 = { name: 'John Doe', role: 'Frontend Developer', salary: 4000, active: true };
        const employee2 = { name: 'Carl Foreman', role: 'Cybersecurity Specialist', salary: 6000, active: true };
        const employee3 = { name: 'Sarah Smith', role: 'Backend Developer', salary: 5000, active: true };
        const employee4 = { name: 'Pietra Johnson', role: 'Fullstack Developer', salary: 4600, active: true };
        await createEmployeesForUser(testUser.token, employee1);
        await createEmployeesForUser(testUser.token, employee2);
        await createEmployeesForUser(adminUser.token, employee3);
        await createEmployeesForUser(adminUser.token, employee4);
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
        testUser = await createTestUser('user@test.com', 'SecurePass123', 'user');
        adminUser = await createTestUser('admin@test.com', 'SecurePass123', 'admin');
        const employee1 = { name: 'John Doe', role: 'Frontend Developer', salary: 4000, active: true };
        const employee2 = { name: 'Carl Foreman', role: 'Cybersecurity Specialist', salary: 6000, active: true };
        const employee3 = { name: 'Sarah Smith', role: 'Backend Developer', salary: 5000, active: true };
        const employee4 = { name: 'Pietra Johnson', role: 'Fullstack Developer', salary: 4600, active: true };
        await createEmployeesForUser(testUser.token, employee1);
        await createEmployeesForUser(testUser.token, employee2);
        await createEmployeesForUser(adminUser.token, employee3);
        await createEmployeesForUser(adminUser.token, employee4);
    });
    
    describe('GET /employees', () => {
        it('should throw 401 without authentication', async () => {
            const response = await request(app).get('/employees');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 401);
            expect(response.body).toHaveProperty('message', 'Authentication required');
        });

        it('should return all employees for admin user', async () => {
            const response = await request(app).get('/employees').set('Authorization', `Bearer ${adminUser.token}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(4);
        });

        it('should return limited employees for regular user', async () => { 
            const response = await request(app).get('/employees').set('Authorization', `Bearer ${testUser.token}`);
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
        });
    });

    describe('GET /employees/:id', () => {
        it('should throw 401 without authentication', async () => {
            const response = await request(app).get('/employees/1');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 401);
            expect(response.body).toHaveProperty('message', 'Authentication required');
        });

        it('should find the employee by admin user', async () => {
            const response = await request(app).get('/employees/1').set('Authorization', `Bearer ${adminUser.token}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 1);
            expect(response.body).toHaveProperty('name', 'John Doe');
        });

        it('should throw 404 when finding employee with different user', async () => {
            const response = await request(app).get('/employees/3').set('Authorization', `Bearer ${testUser.token}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 404);
            expect(response.body).toHaveProperty('message', 'Employee not found');
        });

        it('should find employee by owner user', async () => {
            const response = await request(app).get('/employees/2').set('Authorization', `Bearer ${testUser.token}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 2);
            expect(response.body).toHaveProperty('name', 'Carl Foreman');
        });
    });

    describe('POST /employees', () => {
        it('should throw 401 without authentication', async () => {
            const response = await request(app).post('/employees')
            .send({ name: 'Robert Williams', role: 'Tech Lead', salary: 6000, active: true });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 401);
            expect(response.body).toHaveProperty('message', 'Authentication required');
        });

        it('should throw 400 for missing body', async () => {
            const response = await request(app).post('/employees')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send({ name: 'Robert Williams', role: 'Tech Lead', active: false});
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 400);
            expect(response.body).toHaveProperty('message', 'Validation failed');
            expect(response.body).toHaveProperty('errors');
        });

        it('should throw 400 for incorrect body', async () => {
            const response = await request(app).post('/employees')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send({name: 'Robert Williams', role: 'Tech Lead', salary: '6000', active: 'true' });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 400);
            expect(response.body).toHaveProperty('message', 'Validation failed');
            expect(response.body).toHaveProperty('errors');
        });

        it('should throw 400 if employee already exists for user', async () => {
            const response = await request(app).post('/employees')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send({ name: 'John Doe', role: 'Frontend Developer', salary: 4000, active: true });
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 409);
            expect(response.body).toHaveProperty('message', 'Employee already exists');
        });

        it('should create new employee for its user', async () => {
            const response = await request(app).post('/employees')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send({ name: 'Robert Williams', role: 'Tech Lead', salary: 6000, active: true });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id', 5);
            expect(response.body).toHaveProperty('name', 'Robert Williams');
            expect(response.body).toHaveProperty('user_id', testUser.userId);
        });
    });

    describe('PUT /employees/:id', () => {
        it('should throw 401 without authentication', async () => {
            const response = await request(app).put('/employees/1')
            .send({ name: 'Robert Williams', role: 'Tech Lead', salary: 6000, active: true });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 401);
            expect(response.body).toHaveProperty('message', 'Authentication required');
        });

        it('should throw 400 for missing body', async () => {
            const response = await request(app).put('/employees/1')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send({ name: 'Robert Williams', role: 'Tech Lead', active: true });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 400);
            expect(response.body).toHaveProperty('message', 'Validation failed');
            expect(response.body).toHaveProperty('errors');
        });
    });
});