import { registry } from './openapi.registry';
import { userLoginSchema, userLoginResponse } from '../schemas/auth.schema';
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