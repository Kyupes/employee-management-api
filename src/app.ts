import express from "express";
import employeeRoutes from "./routes/employees";
import { globalErrorHandler } from "./middlewares/errorHandler";
export const app = express();

app.use(express.json());
app.use("/", employeeRoutes);
app.use(globalErrorHandler);
