import { z } from "zod";

const baseUserSchema = z.object({
    email: z.email("Invald email format").openapi({
        description: 'Unique user email',
        example: 'testUser@test.com',
    }),
});

export const userRegistrySchema = baseUserSchema.extend({
    password: z.string()
    .min(8, "Must contain at least 8 characters")
    .regex(/[a-zA-Z]/, "Must contain at least one letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .openapi({
        description: 'String user password before hashing',
        example: 'securePass123',
    }),
});
export type UserRegistryInput = z.infer<typeof userRegistrySchema>;

export const userRegistryResponse = baseUserSchema.extend({
    id: z.number().positive().openapi({
        description: 'User unique integer identifier',
        example: 1247,
    }),
    created_at: z.string().openapi({
        description: 'Data of user account creation',
        example: '2026-07-22T13:48:21.399Z',
    }),
});

export const userLoginSchema = baseUserSchema.extend({
    password: z.string().openapi({
        description: 'User login password',
        example: 'securePass123',
    }),
});
export type UserLoginInput = z.infer<typeof userLoginSchema>;

export const userLoginResponse = z.object({
    token: z.string().openapi({
        description: 'User token on successful login',
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQ..."
    }),
    user: baseUserSchema,
})