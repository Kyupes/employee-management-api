import { describe, it, expect, afterAll, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import { clearDatabase, closeDatabase } from '../helpers/db';
import { app } from '../../src/app';
import { createEmployeesForUser, createTestUser } from '../helpers/auth';

describe('Employees API', () => {
    let testUser: { token: string; userId: number };
    let adminUser: { token: string; userId: number };

    beforeAll(async () => {
        testUser = await createTestUser('user@test.com', 'SecurePass123', 'user');
        adminUser = await createTestUser('admin@test.com', 'SecurePass123', 'admin');
        const employee1 = { name: 'Robertin', role: 'Tio da limpeza', salary: 2000, active: true };
        const employee2 = { name: 'Carlinhos', role: 'Segurança', salary: 2500, active: true };
        const employee3 = { name: 'Jurema', role: 'Supervisora', salary: 4000, active: true };
        const employee4 = { name: 'Claudia', role: 'Social Media', salary: 3000, active: true };
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
        const employee1 = { name: 'Robertin', role: 'Tio da limpeza', salary: 2000, active: true };
        const employee2 = { name: 'Carlinhos', role: 'Segurança', salary: 2500, active: true };
        const employee3 = { name: 'Jurema', role: 'Supervisora', salary: 4000, active: true };
        const employee4 = { name: 'Claudia', role: 'Social Media', salary: 3000, active: true };
        await createEmployeesForUser(testUser.token, employee1);
        await createEmployeesForUser(testUser.token, employee2);
        await createEmployeesForUser(adminUser.token, employee3);
        await createEmployeesForUser(adminUser.token, employee4);
    });
    
    describe('GET /employees', () => {
        it('should throw 401 without authentication', async () => {
            const response = await request(app).get('/employees');
            expect(response.status).toBe(401);
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
});