import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as services from '../../services/employeesServices';
import * as repository from '../../repository/employeesRepository';
import { AppError } from '../../errors/appError';
import { ensureVersion, incrementVersion } from '../../cache/cacheVersionService';
import { get, set } from '../../cache/cacheService';

vi.mock('../../repository/employeesRepository');
vi.mock('../../cache/cacheService');
vi.mock('../../cache/cacheVersionService');

describe('Employee Services', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    });

    const employee = {
        id: 1,
        name: 'Bruna',
        role: 'District Manager',
        salary: 6000,
        active: true,
        userId: 1
    };

    const employeeInput = {
        name: 'Bruna',
        role: 'District Manager',
        salary: 6000,
        active: true
    };

    describe('findEmployeeById', () => {
        it('should return a found employee in repository when cache missing', async () => {
            vi.mocked(ensureVersion).mockResolvedValue(null);
            vi.mocked(repository.findById).mockResolvedValue(employee);
            const result = await services.findEmployeeById(1, 1, 'user');
            expect(result).toBe(employee);
        });

        it('should return a found employee in repository and set in cache', async () => {
            const cacheDetailsVersion = 1;
            vi.mocked(ensureVersion).mockResolvedValue(cacheDetailsVersion);
            vi.mocked(get).mockResolvedValue(null);
            vi.mocked(repository.findById).mockResolvedValue(employee);
            const result = await services.findEmployeeById(1, 1, 'user');
            expect(result).toBe(employee);
            const key = `employees:details:id:${employee.id}:v${cacheDetailsVersion}:userId:${employee.userId}:role:user`;
            const ttl = 300;
            expect(set).toHaveBeenCalledWith(key, employee, ttl);
        });

        it('should return a found employee in cache', async () => {
            vi.mocked(ensureVersion).mockResolvedValue(1);
            vi.mocked(get).mockResolvedValue(employee);
            const result = await services.findEmployeeById(1, 1, 'user');
            expect(result).toBe(employee);
            expect(repository.findById).not.toHaveBeenCalled();
        });

        it('should throw 404 if employee not found', async () => {
            vi.mocked(repository.findById).mockResolvedValue(null);
            vi.mocked(ensureVersion).mockResolvedValue(null);
            await expect(services.findEmployeeById(1, 1, 'user')).rejects.toThrow();
            await expect(services.findEmployeeById(1, 1, 'user')).rejects
            .toThrow(new AppError('Employee not found', 404));
        });
    });

    describe('createEmployee', () => {
        it('should create employee and invalidate list cache', async () => {
            vi.mocked(repository.create).mockResolvedValue(employee);
            const result = await services.createEmployee(employeeInput, 1, 'user');
            expect(result).toBe(employee);
            const versionKey = "employees:list:version";
            expect(incrementVersion).toHaveBeenCalledWith(versionKey);
        });

        it('should throw 409 if employee already exists', async () => {
            vi.mocked(repository.findByName).mockResolvedValue(employee);
            await expect(services.createEmployee(employeeInput, 1, 'user')).rejects.toThrow();
            await expect(services.createEmployee(employeeInput, 1, 'user'))
            .rejects.toThrow(new AppError('Employee already exists', 409));
            expect(repository.create).not.toHaveBeenCalled();
        });
    });

    describe('updateEmployee', () => {
        it('should update the employee and invaldiate cache', async () => {
            vi.mocked(repository.updateById).mockResolvedValue(employee);
            const result = await services.updateEmployee(1, employeeInput, 1, 'user');
            expect(result).toBe(employee);
            const listVersionKey = "employees:list:version";
            expect(incrementVersion).toHaveBeenCalledWith(listVersionKey);
            const detailsVersionKey = `employees:details:id:${employee.id}:version`;
            expect(incrementVersion).toHaveBeenCalledWith(detailsVersionKey);
        });

        it('should throw 404 if employee not found', async () => {
            vi.mocked(repository.updateById).mockResolvedValue(null);
            await expect(services.updateEmployee(1, employeeInput, 1, 'user')).rejects.toThrow();
            await expect(services.updateEmployee(1, employeeInput, 1, 'user'))
            .rejects.toThrow(new AppError('Employee not found', 404));
        });
    });

    describe('deleteEmployeeById', () => {
        it('should delete employee and invalidate cache', async () => {
            const employeeId = 1;
            vi.mocked(repository.deleteById).mockResolvedValue(true);
            await expect(services.deleteEmployeeById(employeeId)).resolves.toBeUndefined();
            const listVersionKey = "employees:list:version";
            expect(incrementVersion).toHaveBeenCalledWith(listVersionKey);
            const detailsVersionKey = `employees:details:id:${employeeId}:version`;
            expect(incrementVersion).toHaveBeenCalledWith(detailsVersionKey);
        });

        it('should throw 404 if employee not found', async () => {
            vi.mocked(repository.deleteById).mockResolvedValue(false);
            await expect(services.deleteEmployeeById(1)).rejects.toThrow();
            await expect(services.deleteEmployeeById(1))
            .rejects.toThrow(new AppError('Employee not found', 404));
        });
    });
});