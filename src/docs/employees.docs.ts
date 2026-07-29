import { registry } from './openapi.registry';
import { createEmployeeSchema, employeeResponseSchema } from '../schemas/employee.schema';
import { errorResponseSchema } from '../schemas/error.schema';

registry.registerPath({
    method: 'post',
    path: '/employees',
    summary: 'Create an employee',
    request: { 
        body: {
            content: {
                'application/json': {
                    schema: createEmployeeSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Employee successfully created',
            content: {
                'application/json': {
                    schema: employeeResponseSchema,
                },
            },
        },
        400: {
            description: 'Validation error or malformed request',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
        401: {
            description: 'Unauthorized: Missing or invalid JWT',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
        409: {
            description: 'Employee with exact same name already exists',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
    },
});