import request from 'supertest';
import { app } from '../../app';
import { makeAdmin } from './db';

interface TestUser{
    token: string;
    userId: number;
    email: string;
    role: string;
}

interface Employee{
    name: string;
    role: string;
    salary: number;
    active: boolean;
}

export async function createTestUser(
    email: string = 'test@test.com',
    password: string = 'SecurePass123',
    role: 'user' | 'admin' = 'user'
): Promise <TestUser>{
    await request(app).post('/auth/register').send({ email, password });
    if (role == 'admin'){
        await makeAdmin(email);
    }
    const response = await request(app).post('/auth/login').send({ email, password });
    const token = response.body.token;
    const user = response.body.user;
    return {
        token: token,
        userId: user.id,
        email: user.email,
        role: role
    };
}

export async function createEmployeesForUser(token: string, employee: Employee){
    await request(app).post('/employees')
    .set('Authorization', `Bearer ${token}`)
    .send(employee);
}

export function authenticatedRequest(token: string){
    return {
        get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
        post: (url: string) => request(app).post(url).set('Authorization', `Bearer ${token}`),
        put: (url: string) => request(app).put(url).set('Authorization', `Bearer ${token}`),
        delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
    };
}