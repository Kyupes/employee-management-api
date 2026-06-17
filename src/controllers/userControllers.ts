import * as services from "../services/employeesServices";
import * as types from "../types/employee";
import { Request, Response } from "express";
import { CreateEmployeeInput } from "../schemas/createEmployeeSchema";

export async function testServer(req: Request, res: Response){
    return res.send("Server working");
}

export async function getAllEmployees(
    req: Request, 
    res: Response
){
    const employees = await services.getAllEmployees();
    return res.status(200).json(employees);
}

export async function getEmployeeById(
    req: Request<{ id: string }>, 
    res: Response
){
    const employee = await services.findEmployeeById(req.params.id);
    return res.status(200).json(employee);
}

export async function createEmployee(
    req: Request< {}, {}, CreateEmployeeInput>, 
    res: Response
){
    const employee = await services.createEmployee(req.body);
    return res.status(201).json(employee);
}

export async function updateEmployee(
    req: Request<{ id: string }, {}, types.UpdateEmployeeInput>,
    res: Response
){
    const updatedEmployee = await services.updateEmployee(req.body, Number(req.params.id));
    return res.status(200).json(updatedEmployee);
}

export async function deleteEmployee(
    req: Request<{ id: string }>, 
    res: Response
){
    await services.deleteEmployeeById(Number(req.params.id));
    return res.status(204).send();
}

export async function searchEmployees(
    req: Request<{}, {}, {}, types.Query>,
    res: Response
){
    const filteredEmployees = await services.searchEmployees(req.query);
    return res.status(200).json(filteredEmployees);
}

export async function getEmployeeStats(
    req: Request, 
    res: Response
){
    const stats = await services.getEmployeeStats();
    return res.status(200).json(stats);
}
