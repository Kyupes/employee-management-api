import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authServices from '../../src/services/authServices';
import * as repository from '../../src/repository/authRepository';
import { AppError } from '../../src/errors/appError';
import { comparePassword, hashPassword } from '../../src/utils/password';
import { hash } from 'node:crypto';

vi.mock('../../src/repository/authRepository');
vi.mock('../../src/utils/password');

describe('authServices', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    });

    const userData =  { email: 'test@test.com', password: 'SecurePass123' };

    describe('registerUser', () => {
        it('should create a user with hashed password', async () => {
            vi.mocked(repository.findByEmail).mockResolvedValue(null);
            vi.mocked(repository.create).mockResolvedValue({
                id: 1,
                email: 'test@test.com',
                password_hash: '$2a$10$fakehash',
                created_at: '2024-01-01',
                role: 'user'
            });
            const result = await authServices.registerUser(userData);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email', 'test@test.com');
            expect(result).not.toHaveProperty('password_hash');
            expect(hashPassword).toHaveBeenCalled();
            expect(repository.create).toHaveBeenCalledWith(
                'test@test.com',
                expect.not.stringContaining('SecurePass123'),
                'user'
            );
        });

        it('should throw 409 if email already exists', async () => {
            vi.mocked(repository.findByEmail).mockResolvedValue({
                id: 1,
                email: 'test@test.com',
                password_hash: '$2a$10$fakehash',
                created_at: '2024-01-01',
                role: 'user'
            });
            await expect(authServices.registerUser(userData)).rejects.toThrow();
            await expect(authServices.registerUser(userData)).rejects.toThrow(new AppError('Email already in use', 409));
            expect(hashPassword).not.toHaveBeenCalled();
            expect(repository.create).not.toHaveBeenCalled();
        });
    });
    
    describe('loginUser', () => {
        it('should return a token for valid credentials', async () => {
            vi.mocked(repository.findByEmail).mockResolvedValue({
                id: 1,
                email: 'test@test.com',
                password_hash: '$2a$10$fakehash',
                created_at: '2024-01-01',
                role: 'user'
            })
            vi.mocked(comparePassword).mockResolvedValue(true);
            const result = await authServices.loginUser(userData);
            expect(result).toHaveProperty('token');
            expect(result.token).toMatch(/^eyJ/);
            expect(result.user).toHaveProperty('email', 'test@test.com');
            expect(result.user).not.toHaveProperty('password_hash');
        });

        it('should throw 401 for invalid credentials for inexistent user', async () => {
            vi.mocked(repository.findByEmail).mockResolvedValue(null);
            await expect(authServices.loginUser(userData)).rejects.toThrow(new AppError('Invalid credentials', 401));
            expect(comparePassword).not.toHaveBeenCalled();
        });

        it('should throw 401 for invalid credentials for invalid password', async () => {
            vi.mocked(repository.findByEmail).mockResolvedValue({
                id: 1,
                email: 'test@test.com',
                password_hash: '$2a$10$fakehash',
                created_at: '2024-01-01',
                role: 'user'
            });
            vi.mocked(comparePassword).mockResolvedValue(false);
            await expect(authServices.loginUser(userData)).rejects.toThrow(new AppError('Invalid credentials', 401));
        });
    });
});