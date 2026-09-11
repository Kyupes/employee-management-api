import { z } from 'zod';
import { registry } from './openapi.registry';
import {
    createEmployeeSchema,
    employeeIdParamSchema,
    employeeResponseSchema,
    employeeStatsResponseSchema,
    paginationSchema,
    searchEmployeesQuerySchema,
    updateEmployeeSchema,
} from '../schemas/employee.schema';
import { errorResponseSchema } from '../schemas/error.schema';

registry.registerPath({
    method: 'get',
    path: '/',
    summary: 'Check whether the API server is running',
    security: [],
    responses: {
        200: {
            description: 'Server is running',
            content: {
                'text/html': {
                    schema: z.string().openapi({ example: 'Server working' }),
                },
            },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/employees',
    summary: 'List accessible employees',
    request: { query: paginationSchema },
    responses: {
        200: {
            description: 'Successfully returns the accessible employees',
            content: { 'application/json': { schema: employeeResponseSchema.array() } },
        },
        400: {
            description: 'Invalid pagination value',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        401: {
            description: 'Unauthorized: Missing or invalid JWT',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/employees/search',
    summary: 'Search and filter accessible employees',
    request: { query: searchEmployeesQuerySchema },
    responses: {
        200: {
            description: 'Successfully returns employees matching the supplied filters',
            content: { 'application/json': { schema: employeeResponseSchema.array() } },
        },
        400: {
            description: 'Invalid search filter or pagination value',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        401: {
            description: 'Unauthorized: Missing or invalid JWT',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/employees/stats',
    summary: 'Get aggregate employee statistics',
    responses: {
        200: {
            description: 'Successfully returns statistics for accessible employees',
            content: { 'application/json': { schema: employeeStatsResponseSchema } },
        },
        401: {
            description: 'Unauthorized: Missing or invalid JWT',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/employees/{id}',
    summary: 'Get an employee by ID',
    request: { params: employeeIdParamSchema },
    responses: {
        200: {
            description: 'Successfully returns the accessible employee',
            content: { 'application/json': { schema: employeeResponseSchema } },
        },
        400: {
            description: 'Invalid employee ID',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        401: {
            description: 'Unauthorized: Missing or invalid JWT',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        404: {
            description: 'Employee was not found or is not accessible to the authenticated user',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/employees',
    summary: 'Create an employee',
    request: {
        body: { content: { 'application/json': { schema: createEmployeeSchema } } },
    },
    responses: {
        201: {
            description: 'Employee successfully created',
            content: { 'application/json': { schema: employeeResponseSchema } },
        },
        400: {
            description: 'Validation error or malformed request',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        401: {
            description: 'Unauthorized: Missing or invalid JWT',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        409: {
            description: 'An employee with the same name already exists in the applicable ownership scope',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
});

registry.registerPath({
    method: 'put',
    path: '/employees/{id}',
    summary: 'Update an employee',
    request: {
        params: employeeIdParamSchema,
        body: { content: { 'application/json': { schema: updateEmployeeSchema } } },
    },
    responses: {
        200: {
            description: 'Successfully returns the updated employee',
            content: { 'application/json': { schema: employeeResponseSchema } },
        },
        400: {
            description: 'Invalid employee ID or request body',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        401: {
            description: 'Unauthorized: Missing or invalid JWT',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        404: {
            description: 'Employee was not found or is not accessible to the authenticated user',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/employees/{id}',
    summary: 'Delete an employee',
    description: 'Deletes an employee. This operation requires the administrator role.',
    request: { params: employeeIdParamSchema },
    responses: {
        204: { description: 'Employee successfully deleted' },
        400: {
            description: 'Invalid employee ID',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        401: {
            description: 'Unauthorized: Missing or invalid JWT',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        403: {
            description: 'Forbidden: Administrator role required',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        404: {
            description: 'Employee was not found',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
});
