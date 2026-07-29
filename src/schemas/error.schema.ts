import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const errorDetailSchema = z.object({
    field: z.string().openapi({ example: 'email' }),
    message: z.string().openapi({ example: 'Invalid email format' }),
}).openapi('ErrorDetail');

export const errorResponseSchema = z.object({
    status: z.string().openapi({ example: 'Error' }),
    message: z.string().openapi({ example: 'Validation failed' }),
    statusCode: z.number().openapi({ example: 400 }),
    errors: z.array(errorDetailSchema).optional().openapi({
        description: 'Optional array of field-specific validation errors'
    }),
}).openapi('ErrorResponse', {
    description: 'Standard error response format used across the API'
});