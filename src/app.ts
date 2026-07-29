import express from "express";
import employeeRoutes from "./routes/employeesRoutes";
import authRoutes from "./routes/authRoutes";
import { globalErrorHandler } from "./middlewares/errorHandler";
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './docs/openapi.registry';
import { openApiConfig } from "./docs/openapi.config";
import swaggerUi from 'swagger-ui-express'; 
import './docs/employees.docs';
import './docs/auth.docs';

export const app = express();

app.use(express.json());

if (process.env.NODE_ENV !== 'production'){
    const generator = new OpenApiGeneratorV3(registry.definitions);
    const openApiDocument = generator.generateDocument(openApiConfig);
    app.get('/api-docs/openapi.json', (req, res) => res.json(openApiDocument));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
}

app.use("/", employeeRoutes);
app.use("/", authRoutes);
app.use(globalErrorHandler);
