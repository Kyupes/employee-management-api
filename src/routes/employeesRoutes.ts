import express from "express";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { createEmployeeSchema, updateEmployeeSchema, employeeIdParamSchema, searchEmployeesQuerySchema } from "../schemas/employee.schema";
import * as controllers from "../controllers/employeeControllers";

const router = express.Router();

router.get("/", controllers.testServer);
router.get("/employees", authenticate, validate(searchEmployeesQuerySchema, 'query'), controllers.getAllEmployees);
router.get("/employees/search", authenticate, validate(searchEmployeesQuerySchema, 'query'), controllers.searchEmployees);
router.get("/employees/stats", authenticate, controllers.getEmployeeStats);
router.get("/employees/:id", authenticate, validate(employeeIdParamSchema, 'params'), controllers.getEmployeeById);
router.post("/employees", authenticate, validate(createEmployeeSchema, 'body'), controllers.createEmployee);
router.put("/employees/:id", authenticate, validate(employeeIdParamSchema, 'params'), validate(updateEmployeeSchema, 'body'), controllers.updateEmployee);
router.delete("/employees/:id", 
    authenticate, 
    authorize(['admin']),
    validate(employeeIdParamSchema, 'params'), 
    controllers.deleteEmployee);

export default router;