import express from "express";
import { validate } from "../middlewares/validate";
import { createEmployeeSchema, updateEmployeeSchema, employeeIdParamSchema, searchEmployeesQuerySchema } from "../schemas/employee.schema";
import * as controllers from "../controllers/employeeControllers";

const router = express.Router();

router.get("/", controllers.testServer);
router.get("/employees", controllers.getAllEmployees);
router.get("/employees/search", validate(searchEmployeesQuerySchema, 'query'), controllers.searchEmployees);
router.get("/employees/stats", controllers.getEmployeeStats);
router.get("/employees/:id", validate(employeeIdParamSchema, 'params'), controllers.getEmployeeById);
router.post("/employees", validate(createEmployeeSchema, 'body'), controllers.createEmployee);
router.put("/employees/:id", validate(employeeIdParamSchema, 'params'), validate(updateEmployeeSchema, 'body'), controllers.updateEmployee);
router.delete("/employees/:id", validate(employeeIdParamSchema, 'params'), controllers.deleteEmployee);

export default router;