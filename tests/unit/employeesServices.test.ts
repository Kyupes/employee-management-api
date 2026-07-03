import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as services from '../../src/services/employeesServices';
import * as repository from '../../src/repository/employeesRepository';
import { AppError } from '../../src/errors/appError';

vi.mock('../../src/repository/employeesRepository');

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
        it('should return a found employee', async () => {
            vi.mocked(repository.findById).mockResolvedValue(employee);
            const result = await services.findEmployeeById(1, 1, 'user');
            expect(result).toBe(employee);
        });

        it('should throw 404 if employee not found', async () => {
            vi.mocked(repository.findById).mockResolvedValue(null);
            await expect(services.findEmployeeById(1, 1, 'user')).rejects.toThrow();
            await expect(services.findEmployeeById(1, 1, 'user')).rejects
            .toThrow(new AppError('Employee not found', 404));
        });
    });


    describe('createEmployee', () => {
        it('should create employee', async () => {
            vi.mocked(repository.create).mockResolvedValue(employee);
            const result = await services.createEmployee(employeeInput, 1, 'user');
            expect(result).toBe(employee);
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
        it('should update the employee', async () => {
            vi.mocked(repository.updateById).mockResolvedValue(employee);
            const result = await services.updateEmployee(1, employeeInput, 1, 'user');
            expect(result).toBe(employee);
        });

        it('should throw 404 if employee not found', async () => {
            vi.mocked(repository.updateById).mockResolvedValue(null);
            await expect(services.updateEmployee(1, employeeInput, 1, 'user')).rejects.toThrow();
            await expect(services.updateEmployee(1, employeeInput, 1, 'user'))
            .rejects.toThrow(new AppError('Employee not found', 404));
        });
    });

    describe('deleteEmployeeById', () => {
        it('should delete employee', async () => {
            vi.mocked(repository.deleteById).mockResolvedValue(true);
            expect(services.deleteEmployeeById(1)).not.rejects;
        });

        it('should throw 404 if employee not found', async () => {
            vi.mocked(repository.deleteById).mockResolvedValue(false);
            await expect(services.deleteEmployeeById(1)).rejects.toThrow();
            await expect(services.deleteEmployeeById(1))
            .rejects.toThrow(new AppError('Employee not found', 404));
        });
    });

    describe('')
});