import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const baseEmployeeSchema = z.object({
    name: z.string().min(5).openapi({
        description: 'Full name of the employee',
        example: 'John Doe',
    }),
    role: z.string().openapi({ 
        description: 'Job title or role',
        example: 'Software Engineer',
    }),
    salary: z.number().min(1000).openapi({ 
        description: 'Monthly salary in USD',
        example: 5000,
    }),
    active: z.boolean().openapi({ 
        description: 'Wheter the employee is currently active',
        example: true,
    }),
});

export const createEmployeeSchema = baseEmployeeSchema
.openapi('CreateEmployeeRequest', { 
    description: 'Request payload to create a new employee'
});
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;


export const employeeResponseSchema = baseEmployeeSchema.extend({
    id: z.number().positive().openapi({
        description: 'Unique identifier for employee',
        example: 48235,
    }),
    user_id: z.number().positive().openapi({
        description: 'Unique identifier for user owner',
        example: 732,
    }),
}).openapi('EmployeeResponse', {
    description: 'Response for employee, returned upon successful creation, retrieval or update operations.'
});


export const updateEmployeeSchema = baseEmployeeSchema;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const employeeIdParamSchema = z.object({
    id: z.coerce.number().int().positive("ID must be a positive integer").openapi({
        param: {
            name: 'id',
            in: 'path',
        },
        description: 'Employee identifier',
        example: 1,
    }),
});
export type EmployeeIdParams = z.infer<typeof employeeIdParamSchema>;

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1).openapi({
        description: 'Number to specify page',
        example: 2,
    }),
    limit: z.coerce.number().int().min(1).max(100).default(10).openapi({
        description: 'Number to limit for results amount',
        example: 50,
    }),
});
export type PaginationQuery = z.infer<typeof paginationSchema>;

export const searchEmployeesQuerySchema = paginationSchema.extend({
    name: z.string().trim().min(1).optional().openapi({
        description: 'Case-insensitive partial employee name',
        example: 'John',
    }),
    role: z.string().optional().openapi({
        description: 'Case-insensitive partial employee role',
        example: 'Developer',
    }),
    minSalary: z.coerce.number().nonnegative().optional().openapi({
        description: 'Positive salary string coercion for searching',
        example: '3500',
    }),
    active: z.enum(['true', 'false']).transform(value => value === 'true')
    .optional().openapi({
        description: 'Employee activity coercion for searching',
        example: 'true',
    }),
}).strict();
export type SearchEmployeesQuery = z.infer<typeof searchEmployeesQuerySchema>;

export const employeeStatsResponseSchema = z.object({
    totalEmployees: z.number().nonnegative().openapi({ example: 4 }),
    activeEmployees: z.number().nonnegative().openapi({ example: 3 }),
    inactiveEmployees: z.number().nonnegative().openapi({ example: 1 }),
    averageSalary: z.number().nonnegative().openapi({ example: 4900 }),
    highestSalary: z.number().nonnegative().openapi({ example: 6000 }),
    lowestSalary: z.number().nonnegative().openapi({ example: 4000 }),
    roles: z.record(z.string(), z.number().nonnegative()).openapi({
        description: 'Employee count grouped by role',
        example: {
            'Frontend Developer': 1,
            'Backend Developer': 2,
        },
    }),
}).openapi('EmployeeStatsResponse', {
    description: 'Aggregate statistics for employees accessible to the authenticated user',
});
