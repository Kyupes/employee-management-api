import { z } from "zod";

export const UserRegistrySchema = z.object({
    email: z.email("Invald email format"),
    password: z.string()
    .min(8, "Must contain at least 8 characters")
    .regex(/[a-zA-Z]/, "Must contain at least one letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});
export type UserRegistryInput = z.infer<typeof UserRegistrySchema>;