import { z } from 'zod';

export const createEmployeeSchema = z.object({
    name: z.string().min(5),
    role: z.string(),
    salary: z.number().min(1000),
    active: z.boolean()
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;