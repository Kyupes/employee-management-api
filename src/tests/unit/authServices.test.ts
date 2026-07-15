import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authServices from '../../services/authServices';
import * as repository from '../../repository/authRepository';
import { AppError } from '../../errors/appError';
import { comparePassword, hashPassword } from '../../utils/password';
import { UserRole } from '../../types/userInterfaces';

vi.mock('../../src/repository/authRepository');
vi.mock('../../src/utils/password');

describe('authServices', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    });

    const userData =  { email: 'test@test.com', password: 'SecurePass123' };
    const mockUser = {
        id: 1,
        email: 'test@test.com',
        password_hash: '$2a$10$fakehash',
        created_at: '2024-01-01',
        role: 'user' as UserRole,
    };

    describe('registerUser', () => {
        it('should create a user with hashed password', async () => {
            vi.mocked(repository.findByEmail).mockResolvedValue(null);
            vi.mocked(repository.create).mockResolvedValue(mockUser);
            const result = await authServices.registerUser(userData);
            expect(result).toEqual(
                expect.objectContaining({
                    id: mockUser.id,
                    email: userData.email,
                    created_at: mockUser.created_at,
                })
            );
            expect(result).not.toHaveProperty('password_hash');
            expect(hashPassword).toHaveBeenCalled();
            expect(repository.create).toHaveBeenCalledWith(
                'test@test.com',
                expect.not.stringContaining('SecurePass123'),
                'user'
            );
        });

        it('should throw 409 if email already exists', async () => {
            vi.mocked(repository.findByEmail).mockResolvedValue(mockUser);
            await expect(authServices.registerUser(userData)).rejects.toBeInstanceOf(AppError);
            await expect(authServices.registerUser(userData))
            .rejects.toMatchObject({
                message: 'Email already in use',
                statusCode: 409,
            });
            expect(hashPassword).not.toHaveBeenCalled();
            expect(repository.create).not.toHaveBeenCalled();
        });
    });
    
    describe('loginUser', () => {
        it('should return a token for valid credentials', async () => {
            vi.mocked(repository.findByEmail).mockResolvedValue(mockUser)
            vi.mocked(comparePassword).mockResolvedValue(true);
            const result = await authServices.loginUser(userData);
            expect(result).toHaveProperty('token');
            expect(result).toEqual(
                expect.objectContaining({
                    token: expect.stringMatching(/^eyJ/),
                    user: expect.objectContaining({ email: userData.email }),
                })
            );
            expect(result.user).not.toHaveProperty('password_hash');
        });

        it('should throw 401 for invalid credentials for inexistent user', async () => {
            vi.mocked(repository.findByEmail).mockResolvedValue(null);
            await expect(authServices.loginUser(userData)).rejects.toBeInstanceOf(AppError);
            await expect(authServices.loginUser(userData))
            .rejects.toMatchObject({
                message: 'Invalid credentials',
                statusCode: 401,
            });
            expect(comparePassword).not.toHaveBeenCalled();
        });

        it('should throw 401 for invalid credentials for invalid password', async () => {
            vi.mocked(repository.findByEmail).mockResolvedValue(mockUser);
            vi.mocked(comparePassword).mockResolvedValue(false);
            await expect(authServices.loginUser(userData)).rejects.toBeInstanceOf(AppError);
            await expect(authServices.loginUser(userData))
            .rejects.toMatchObject({
                message: 'Invalid credentials',
                statusCode: 401,
            });
        });
    });
});