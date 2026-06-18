import * as services from "../services/employeesServices";
import { Request, Response } from "express";
import { CreateEmployeeInput, UpdateEmployeeInput, EmployeeIdParams, SearchEmployeesQuery } from "../schemas/employee.schema";

export async function testServer(req: Request, res: Response){
    return res.send("Server working");
}

export async function getAllEmployees(req: Request, res: Response){
    const employees = await services.getAllEmployees();
    return res.status(200).json(employees);
}

export async function getEmployeeById(req: Request, res: Response){
    const params = req.validated?.params as EmployeeIdParams;
    const employee = await services.findEmployeeById(params.id);
    return res.status(200).json(employee);
}

export async function createEmployee(req: Request, res: Response){
    const validatedBody = req.validated?.body as CreateEmployeeInput;
    const employee = await services.createEmployee(validatedBody);
    return res.status(201).json(employee);
}

export async function updateEmployee(req: Request,res: Response){
    const params = req.validated?.params as EmployeeIdParams;
    const body = req.validated?.body as UpdateEmployeeInput;
    const updatedEmployee = await services.updateEmployee(body, params.id);
    return res.status(200).json(updatedEmployee);
}

export async function deleteEmployee(req: Request, res: Response){
    const params = req.validated?.params as EmployeeIdParams;
    await services.deleteEmployeeById(params.id);
    return res.status(204).send();
}

export async function searchEmployees(req: Request,res: Response){
    const validatedQuery = req.validated?.query as SearchEmployeesQuery;
    const filteredEmployees = await services.searchEmployees(validatedQuery);
    return res.status(200).json(filteredEmployees);
}

export async function getEmployeeStats(req: Request, res: Response){
    const stats = await services.getEmployeeStats();
    return res.status(200).json(stats);
}
