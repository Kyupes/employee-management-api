import { registry } from './openapi.registry';
import { createEmployeeSchema, employeeResponseSchema, updateEmployeeSchema, paginationSchema, employeeIdParamSchema } from '../schemas/employee.schema';
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

registry.registerPath({
    method: 'get',
    path: '/employees',
    summary: 'Get all employees',
    request: {
        query: paginationSchema,
    },
    responses: {
        200: {
            description: 'Successfuly returns array of employees',
            content: {
                'application/json': {
                    schema: employeeResponseSchema.array(),
                },
            },
        },
        400:{
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
    },
});

registry.registerPath({
    method: 'put',
    path: '/employees/{id}',
    summary: 'Update an employee',
    request: {
        body: {
            content: {
                'application/json':{
                    schema: updateEmployeeSchema,
                },
            },
        },
        params: employeeIdParamSchema,
    },
    responses: {
        200: {
            description: 'Successfully returns the updated employee',
            content: {
                'application/json': {
                    schema: employeeResponseSchema,
                },
            },
        },
        400:{
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
        404: {
            description: 'Employee was not found',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/employees/{id}',
    summary: 'Delete an employee',
    request: {
        params: employeeIdParamSchema,
    },
    responses: {
        204: {
            description: 'Successfully deletes the employee',
        },
        400:{
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
        404: {
            description: 'Employee was not found',
            content: {
                'application/json': {
                    schema: errorResponseSchema,
                },
            },
        },
    },
});