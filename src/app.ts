import express from "express";
import employeeRoutes from "./routes/employeesRoutes";
import authRoutes from "./routes/authRoutes";
import { globalErrorHandler } from "./middlewares/errorHandler";
export const app = express();

app.use(express.json());
app.use("/", employeeRoutes);
app.use("/", authRoutes);
app.use(globalErrorHandler);
