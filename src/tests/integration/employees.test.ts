import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { clearDatabase } from '../helpers/db';
import { app } from '../../app';
import { createEmployeesForUser, createTestUser, authenticatedRequest } from '../helpers/auth';
import { Employee } from '../../types/employeesInterfaces';

describe('Employees API', () => {
    let testUser: { token: string; userId: number };
    let adminUser: { token: string; userId: number };
    const testEmployees = {
        userEmployee1: { name: 'John Doe', role: 'Frontend Developer', salary: 4000, active: true },
        userEmployee2: { name: 'Carl Foreman', role: 'Cybersecurity Specialist', salary: 6000, active: false },
        adminEmployee1: { name: 'Sarah Smith', role: 'Backend Developer', salary: 5000, active: true },
        adminEmployee2: { name: 'Pietra Johnson', role: 'Fullstack Developer', salary: 4600, active: true },
        testEmployeeCorrect: { name: 'Robert Williams', role: 'Tech Lead', salary: 6000, active: true },
        testEmployeeMissing: { name: 'Robert Williams', role: 'Tech Lead', active: false},
        testEmployeeIncorrect: { name: 'Robert Williams', role: true, salary: '4000', active: 'false' },
    };
    const userEmployeesStats = {
        totalEmployees: 2,
        activeEmployees: 1,
        inactiveEmployees: 1,
        averageSalary: 5000,
        highestSalary: 6000,
        lowestSalary: 4000,
        roles: { 
            'Frontend Developer': 1, 
            'Cybersecurity Specialist': 1
        },
    };
    const allEmployeesStats = {
        totalEmployees: 4,
        activeEmployees: 3,
        inactiveEmployees: 1,
        averageSalary: 4900,
        highestSalary: 6000,
        lowestSalary: 4000,
        roles: { 
            'Frontend Developer': 1, 
            'Cybersecurity Specialist': 1, 
            'Backend Developer': 1,
            'Fullstack Developer': 1,
        },
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
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 401,
                    message: 'Authentication required',
                })
            );
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
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
        });
    });

    describe('GET /employees/:id', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).get('/employees/1');
            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 401,
                    message: 'Authentication required',
                })
            );
        });

        it('should return the employee by admin user', async () => {
            const authRequest = authenticatedRequest(adminUser.token);
            const id = 1;
            const response = await authRequest.get(`/employees/${id}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: id,
                    name: testEmployees.userEmployee1.name,
                    role: testEmployees.userEmployee1.role,
                    salary: testEmployees.userEmployee1.salary,
                    active: testEmployees.userEmployee1.active,
                    user_id: testUser.userId,
                })
            );
        });

        it('should return 404 when searching for employee by different owner user', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/3');
            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 404,
                    message: 'Employee not found',
                })
            );
        });

        it('should return employee by owner user', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const id = 2;
            const response = await authRequest.get(`/employees/${id}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: id,
                    name: testEmployees.userEmployee2.name,
                    role: testEmployees.userEmployee2.role,
                    salary: testEmployees.userEmployee2.salary,
                    active: testEmployees.userEmployee2.active,
                    user_id: testUser.userId,
                })
            );
        });
    });

    describe('POST /employees', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).post('/employees')
            .send(testEmployees.testEmployeeCorrect);
            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 401,
                    message: 'Authentication required',
                })
            );
        });

        it('should return 400 for missing body', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.post('/employees').send(testEmployees.testEmployeeMissing);
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed',
                })
            );
        });

        it('should return 400 for incorrect body', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.post('/employees').send(testEmployees.testEmployeeIncorrect);
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed',
                })
            );
        });

        it('should return 400 if employee already exists for user', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.post('/employees').send(testEmployees.userEmployee1);
            expect(response.status).toBe(409);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 409,
                    message: 'Employee already exists',
                })
            );
        });

        it('should create and return new employee for its user', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.post('/employees').send(testEmployees.testEmployeeCorrect);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(
                expect.objectContaining({
                    name: testEmployees.testEmployeeCorrect.name,
                    role: testEmployees.testEmployeeCorrect.role,
                    salary: testEmployees.testEmployeeCorrect.salary,
                    active: testEmployees.testEmployeeCorrect.active,
                    user_id: testUser.userId,
                })
            );
        });
    });

    describe('PUT /employees/:id', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).put('/employees/1').send(testEmployees.testEmployeeCorrect);
            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 401,
                    message: 'Authentication required',
                })
            );
        });

        it('should return 400 for missing body', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.put('/employees/1').send(testEmployees.testEmployeeMissing);
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed',
                })
            );
        });

        it('should return 400 for incorrect body', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.put('/employees/1').send(testEmployees.testEmployeeIncorrect);
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed',
                })
            );
        });

        it('should return 404 when user try to update another users employee', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.put('/employees/3').send(testEmployees.testEmployeeCorrect);
            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 404,
                    message: 'Employee not found',
                })
            );
        });

        it('should update and return employee', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const id = 1;
            const response = await authRequest.put(`/employees/${id}`).send(testEmployees.testEmployeeCorrect);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: id,
                    name: testEmployees.testEmployeeCorrect.name,
                    role: testEmployees.testEmployeeCorrect.role,
                    salary: testEmployees.testEmployeeCorrect.salary,
                    active: testEmployees.testEmployeeCorrect.active,
                    user_id: testUser.userId,
                })
            );
        });
    });

    describe('DELETE /employees/:id', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).delete('/employees/1');
            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 401,
                    message: 'Authentication required',
                })
            );
        });

        it('should return 403 for user not authorized', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.delete('/employees/1');
            expect(response.status).toBe(403);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 403,
                    message: 'Insufficient permissions',
                })
            );
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
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 403,
                    message: 'Insufficient permissions',
                })
            );
        });

        it('should return 403 for non-existent employee by user', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.delete('/employees/10');
            expect(response.status).toBe(403);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 403,
                    message: 'Insufficient permissions',
                })
            );
        });

        it('should return 404 for non-existent employee by admin', async () => {
            const authRequest = authenticatedRequest(adminUser.token);
            const response = await authRequest.delete('/employees/10');
            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 404,
                    message: 'Employee not found',
                })
            );
        });
    });

    describe('GET /employees/stats', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).get('/employees/stats');
            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 401,
                    message: 'Authentication required',
                })
            );
        });

        it('should return employees stats for user owner', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/stats');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(userEmployeesStats);
        });

        it('should return all employees stats for admin', async () => {
            const authRequest = authenticatedRequest(adminUser.token);
            const response = await authRequest.get('/employees/stats');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(allEmployeesStats);
        });
    });

    describe('GET /employees/search', () => {
        it('should return 401 without authentication', async () => {
            const response = await request(app).get('/employees/search');
            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 401,
                    message: 'Authentication required',
                })
            );
        });

        it('should return only its owner employees', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(testEmployees.userEmployee1),
                    expect.objectContaining(testEmployees.userEmployee2),
                ])
            );
        });

        it('should return employees above 5000 salary', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search?minSalary=5000');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.every(
                (employee: Employee) => employee.salary >= 5000
            )).toBe(true);
        });

        it('should return empty array when no employee satifies search', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search?minSalary=99999');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toEqual([]);
        });

        it('should return 400 when invalid salary is provided', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search?minSalary=abc');
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed',
                })
            );
        });

        it('should return 400 when negative salary is provided', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search?minSalary=-100');
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed',
                })
            );
        });

        it('should filter employees by role', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search?role=dev');
            expect(response.status).toBe(200);
            expect(response.body.every(
                (employee: Employee) => employee.role.includes('dev')
            ))
        });

        it('should filter employees by name', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search?name=John');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.arrayContaining([expect.objectContaining(testEmployees.userEmployee1)])
            );
        });

        it('should return 200 even when filtering unmatching role/name', async () =>{
            const authRequest = authenticatedRequest(testUser.token);
            const response1 = await authRequest.get('/employees/search?role=i_dont_exist');
            expect(response1.status).toBe(200);
            expect(response1.body).toEqual([]);
            const response2 = await authRequest.get('/employees/search?name=i_dont_exist');
            expect(response2.status).toBe(200);
            expect(response2.body).toEqual([]);
        });

        it('should filter employees by activity', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response1 = await authRequest.get('/employees/search?active=true');
            expect(response1.status).toBe(200);
            expect(response1.body.every(
                (employee: Employee) => employee.active
            ));
            const response2 = await authRequest.get('/employees/search?active=false');
            expect(response2.status).toBe(200);
            expect(response2.body.every(
                (employee: Employee) => !employee.active
            ));
        });

        it('should return 400 for invalid boolean', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search?active=yes');
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed'
                })
            );
        });

        it('should return 3 employees when using limit(3) in first page and 1 in second page', async () => {
            const authRequest = authenticatedRequest(adminUser.token);
            const response1 = await authRequest.get('/employees/search?limit=3&page=1');
            expect(response1.status).toBe(200);
            expect(Array.isArray(response1.body)).toBe(true);
            expect(response1.body.length).toBe(3);
            const response2 = await authRequest.get('/employees/search?limit=3&page=2');
            expect(response2.status).toBe(200);
            expect(Array.isArray(response2.body)).toBe(true);
            expect(response2.body.length).toBe(1);
        });

        it('should return 200 with empty array when pagination over number of employees', async () => {
            const authRequest = authenticatedRequest(adminUser.token);
            const response = await authRequest.get('/employees/search?page=10');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('should return 400 when invalid page', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search?page=abc');
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed',
                })
            );
        });

        it('should return 400 when page equals to 0', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search?page=0');
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed',
                })
            );
        });

        it('should return 400 when page is negative', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search?page=-2');
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed',
                })
            );
        });

        it('should return 400 when invalid limit', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search?limit=abc');
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed',
                })
            );
        });

        it('should return 400 when limit is 0', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search?limit=0');
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed',
                })
            );
        });

        it('should return 400 when limit is negative', async () => {
            const authRequest = authenticatedRequest(testUser.token);
            const response = await authRequest.get('/employees/search?limit=-2');
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Error',
                    statusCode: 400,
                    message: 'Validation failed',
                })
            );
        });

        it ('should combine multiple filters', async () => {
            const authRequest = authenticatedRequest(adminUser.token);
            const response1 = await authRequest.get('/employees/search?role=dev&active=true&minSalary=3500');
            expect(response1.status).toBe(200);
            expect(response1.body).toEqual(
                expect.arrayContaining([expect.objectContaining(testEmployees.userEmployee1)]),
            );
            const response2 = await authRequest.get('/employees/search?active=false&minSalary=5000');
            expect(response2.status).toBe(200);
            expect(response2.body).toEqual(
                expect.arrayContaining([expect.objectContaining(testEmployees.userEmployee2)]),
            );
            const response3 = await authRequest.get('/employees/search?role=dev&minSalary=4500');
            expect(response3.status).toBe(200);
            expect(response3.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(testEmployees.adminEmployee1),
                    expect.objectContaining(testEmployees.adminEmployee2),
                ])
            );
       });
    });
});