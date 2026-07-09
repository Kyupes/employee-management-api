import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { clearDatabase } from '../helpers/db';
import { app } from '../../src/app';
import { createEmployeesForUser, createTestUser } from '../helpers/auth';
import { authenticatedRequest } from '../helpers/auth';

describe('Employees API', () => {
    let testUser: { token: string; userId: number };
    let adminUser: { token: string; userId: number };
    const testEmployees = {
        userEmployee1: { name: 'John Doe', role: 'Frontend Developer', salary: 4000, active: true },
        userEmployee2: { name: 'Carl Foreman', role: 'Cybersecurity Specialist', salary: 6000, active: true },
        adminEmployee1: { name: 'Sarah Smith', role: 'Backend Developer', salary: 5000, active: true },
        adminEmployee2: { name: 'Pietra Johnson', role: 'Fullstack Developer', salary: 4600, active: true },
        testEmployeeCorrect: { name: 'Robert Williams', role: 'Tech Lead', salary: 6000, active: true },
        testEmployeeMissing: { name: 'Robert Williams', role: 'Tech Lead', active: false},
        testEmployeeIncorrect: { name: 'Robert Williams', role: true, salary: '4000', active: 'false' },
    };

    beforeEach(async () => {
        await clearDatabase();
        testUser = await createTestUser('user@test.com', 'SecurePass123', 'user');
        adminUser = await createTestUser('admin@test.com', 'SecurePass123', 'admin');
        await createEmployeesForUser(testUser.token, testEmployees.userEmployee1);
        await createEmployeesForUser(testUser.token, testEmployees.userEmployee2);
        await createEmployeesForUser(adminUser.token, testEmployees.adminEmployee1);
        await createEmployeesForUser(adminUser.token, testEmployees.adminEmployee2);
    });
    
    describe('GET /employees', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).get('/employees');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 401);
            expect(response.body).toHaveProperty('message', 'Authentication required');
        });

        it('should return all employees for admin', async () => {
            const authRequest = authenticatedRequest(adminUser.token);
            const response = await authRequest.get('/employees');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(4);
        });

        it('should return only user\'s employees for regular user', async () => { 
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees');
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
        });
    });

    describe('GET /employees/:id', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).get('/employees/1');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 401);
            expect(response.body).toHaveProperty('message', 'Authentication required');
        });

        it('should return the employee by admin user', async () => {
            const authRequest = authenticatedRequest(adminUser.token);
            const response = await authRequest.get('/employees/1');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', 'John Doe');
            expect(response.body).toHaveProperty('role', 'Frontend Developer');
        });

        it('should return 404 when searching for employee by different owner user', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/3');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 404);
            expect(response.body).toHaveProperty('message', 'Employee not found');
        });

        it('should return employee by owner user', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/2');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', 'Carl Foreman');
            expect(response.body).toHaveProperty('role', 'Cybersecurity Specialist');
        });
    });

    describe('POST /employees', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).post('/employees')
            .send(testEmployees.testEmployeeCorrect);
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 401);
            expect(response.body).toHaveProperty('message', 'Authentication required');
        });

        it('should return 400 for missing body', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.post('/employees').send(testEmployees.testEmployeeMissing);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 400);
            expect(response.body).toHaveProperty('message', 'Validation failed');
            expect(response.body).toHaveProperty('errors');
        });

        it('should return 400 for incorrect body', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.post('/employees').send(testEmployees.testEmployeeIncorrect);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 400);
            expect(response.body).toHaveProperty('message', 'Validation failed');
            expect(response.body).toHaveProperty('errors');
        });

        it('should return 400 if employee already exists for user', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.post('/employees').send(testEmployees.userEmployee1);
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 409);
            expect(response.body).toHaveProperty('message', 'Employee already exists');
        });

        it('should create and return new employee for its user', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.post('/employees').send(testEmployees.testEmployeeCorrect);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('name', 'Robert Williams');
            expect(response.body).toHaveProperty('role', 'Tech Lead');
            expect(response.body).toHaveProperty('user_id', testUser.userId);
        });
    });

    describe('PUT /employees/:id', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).put('/employees/1').send(testEmployees.testEmployeeCorrect);
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 401);
            expect(response.body).toHaveProperty('message', 'Authentication required');
        });

        it('should return 400 for missing body', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.put('/employees/1').send(testEmployees.testEmployeeMissing);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 400);
            expect(response.body).toHaveProperty('message', 'Validation failed');
            expect(response.body).toHaveProperty('errors');
        });

        it('should return 400 for incorrect body', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.put('/employees/1').send(testEmployees.testEmployeeIncorrect);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 400);
            expect(response.body).toHaveProperty('message', 'Validation failed');
            expect(response.body).toHaveProperty('errors');
        });

        it('should return 404 when user try to update another users employee', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.put('/employees/3').send(testEmployees.testEmployeeCorrect);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 404);
            expect(response.body).toHaveProperty('message', 'Employee not found');
        });

        it('should update and return employee', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.put('/employees/1').send(testEmployees.testEmployeeCorrect);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', 'Robert Williams');
            expect(response.body).toHaveProperty('role', 'Tech Lead');
        });
    });

    describe('DELETE /employees/:id', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).delete('/employees/1');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 401);
            expect(response.body).toHaveProperty('message', 'Authentication required');
        });

        it('should return 403 for user not authorized', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.delete('/employees/1');
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 403);
            expect(response.body).toHaveProperty('message', 'Insufficient permissions');
        });

        it('should successfuly delete employee by admin', async () => {
            const authRequest = authenticatedRequest(adminUser.token);
            const response = await authRequest.delete('/employees/1');
            expect(response.status).toBe(204);
            expect(response).toHaveProperty('body', {});
        });

        it('should return 403 for unauthorized access by user', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.delete('/employees/3');
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 403);
            expect(response.body).toHaveProperty('message', 'Insufficient permissions');
        });

        it('should return 403 for non-existent employee by user', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.delete('/employees/10');
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 403);
            expect(response.body).toHaveProperty('message', 'Insufficient permissions');
        });

        it('should return 404 for non-existent employee by admin', async () => {
            const authRequest = authenticatedRequest(adminUser.token);
            const response = await authRequest.delete('/employees/10');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('status', 'Error');
            expect(response.body).toHaveProperty('statusCode', 404);
            expect(response.body).toHaveProperty('message', 'Employee not found');
        });
    });
});