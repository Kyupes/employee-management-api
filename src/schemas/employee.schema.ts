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

export const searchEmployeesQuerySchema = z.object({
    name: z.string().optional(),
    role: z.string().optional(),
    minSalary: z.coerce.number().nonnegative().optional(),
    active: z.string()
    .refine(value => 
        value.toLowerCase() === 'true' || 
        value.toLowerCase() === 'false',
        {
            message: "Active must be 'true' or 'false'",
        }
    )
    .transform(val => val.toLowerCase() === 'true').optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
}).strict();
export type SearchEmployeesQuery = z.infer<typeof searchEmployeesQuerySchema>;
