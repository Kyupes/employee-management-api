import { registry } from './openapi.registry';
import { userLoginSchema, userLoginResponse, userRegistrySchema, userRegistryResponse } from '../schemas/auth.schema';
import { errorResponseSchema } from '../schemas/error.schema';

registry.registerPath({
    method: 'post',
    path: '/auth/login',
    summary: 'Authenticate user and receive JWT',

    security: [],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: userLoginSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Succesfull authentication',
            content: {
                'application/json': {
                    schema: userLoginResponse,
                },
            },
        },
        400: {
            description: 'Validation error or malformed request',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                }
            }
        },
        401: {
            description: 'Invalid credentials',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
    },
});