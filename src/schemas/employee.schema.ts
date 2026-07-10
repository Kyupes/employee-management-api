import { z } from 'zod';

export const createEmployeeSchema = z.object({
    name: z.string().min(5),
    role: z.string(),
    salary: z.number().min(1000),
    active: z.boolean()
});
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
    name: z.string().min(5),
    role: z.string(),
    salary: z.number().min(1000),
    active: z.boolean()
});
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const employeeIdParamSchema = z.object({
    id: z.coerce.number().int().positive("ID must be a positive integer"),
});
export type EmployeeIdParams = z.infer<typeof employeeIdParamSchema>;

export const searchEmployeesQuerySchema = z.object({
    name: z.string().optional(),
    role: z.string().optional(),
    minSalary: z.coerce.number().positive("Salary must be positive").optional(),
    active: z.string().transform(val => val.toLowerCase() === 'true').optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10)
}).strict();
export type SearchEmployeesQuery = z.infer<typeof searchEmployeesQuerySchema>;
