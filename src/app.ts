import express from "express";
import employeeRoutes from "./routes/employees";

export const app = express();

app.use(express.json());
app.use("/", employeeRoutes);
