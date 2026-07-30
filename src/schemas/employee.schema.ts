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
    userId: z.number().positive().openapi({
        description: 'Unique identifier for user owner',
        example: 732,
    }),
}).openapi('EmployeeResponse', {
    description: 'Response for employee, returned upon successful creation, retrieval or update operations.'
});


export const updateEmployeeSchema = baseEmployeeSchema;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const employeeIdParamSchema = z.object({
    id: z.coerce.number().int().positive("ID must be a positive integer"),
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
    name: baseEmployeeSchema.shape.name.optional(),
    role: baseEmployeeSchema.shape.role.optional(),
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
