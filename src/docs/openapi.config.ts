export const openApiConfig = {
    openapi: '3.0.0',
    info: {
        title: 'Employee Management API',
        version: '1.0.0',
        description: `A local learning project for managing employees with authentication, authorization, PostgreSQL, and Redis caching.
        ## Global Error Format
        All errors return a consistent JSON structure:
        \`\`\`json
        { "status": "Error", "message": "STRING", "statusCode": 400, "errors": [] }
        \`\`\`
        `,
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local Development Server',
        },
        // Space for adding a production URL
    ],
    components: {
        securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: "Enter your JWT token in the format: 'Bearer <token>'",
                },
        },
        // We will add global reusable responses here later (e.g., ValidationError, UnauthorizedError)
        responses: {},
    },
    security: [
        // This applies the 'bearerAuth' scheme to ALL endpoints by default.
        // Individual routes can override this to be public (e.g., login/register).
        { bearerAuth: [] },
    ],
    paths: {}, // Will be populated by the documentation library
};
