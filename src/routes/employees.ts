import express from "express";
import * as controllers from "../controllers/userControllers";

const router = express.Router();

router.get("/", controllers.testServer);
router.get("/employees", controllers.getAllEmployees);
router.get("/employees/search", controllers.searchEmployees);
router.get("/employees/stats", controllers.getEmployeeStats);
router.get("/employees/:id", controllers.getEmployeeById);
router.post("/employees", controllers.createEmployee);
router.put("/employees/:id", controllers.updateEmployee);
router.delete("/employees/:id", controllers.deleteEmployee);

export default router;