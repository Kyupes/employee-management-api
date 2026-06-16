import * as services from "../services/employeesServices";
import * as types from "../types/employee";
import { Request, Response } from "express";
import { CreateEmployeeInput } from "../schemas/createEmployeeSchema";

function parseHttpError(error: unknown): types.HttpError{
    if ((typeof(error) === "object" && error !== null
    && ("message" in error && typeof(error.message) === "string"
    && "status" in error && typeof(error.status) === "number"))){
        return {
            message: error.message,
            status: error.status
        }
    }
    return {
        message: "Generic Error Message because yeah",
        status: 500
    };
}

export async function testServer(req: Request, res: Response){
    return res.send("Server working");
}

export async function getAllEmployees(req: Request, res: Response){
    const employees = await services.getAllEmployees();
    return res.status(200).json(employees);
}

export async function getEmployeeById(
    req: Request<{ id: string }>, 
    res: Response
){
    try {
        const employee = await services.findEmployeeById(req.params.id);
        return res.status(200).json(employee);
    } catch (error) {
        const err = parseHttpError(error);
        return res.status(err.status).json({ error: err.message });
    }
}

export async function createEmployee(
    req: Request<
    {}, 
    {}, 
    types.CreateEmployeeInput>, 
    res: Response
){
    const employee = await services.createEmployee(req.body);
    return res.status(201).json(employee);
}

export async function updateEmployee(
    req: Request<
    { id: string },
    {},
    types.UpdateEmployeeInput>,
    res: Response
){
    try {
        const id = req.params.id;
        if (isNaN(Number(id)) && id.trim().length === 0){
            return res.status(400).json({ error: "provided id is not a number" });
        }
        const updatedEmployee = await services.updateEmployee(req.body, Number(id));
        return res.status(200).json(updatedEmployee);
    } catch (error) {
        const err = parseHttpError(error);
        return res.status(err.status).json({ error: err.message });
    }
}

export async function deleteEmployee(
    req: Request<{ id: string }>, 
    res: Response
){
    try {
        const id = req.params.id;
        if (isNaN(Number(id)) && id.trim().length === 0){
            return res.status(400).json({ error: "provided id is not a number" });
        }
        await services.deleteEmployeeById(Number(id));
        return res.status(204).send();
    } catch (error){
        const err = parseHttpError(error);
        return res.status(err.status).json({ error: err.message });
    }
}

export async function searchEmployees(
    req: Request<{}, {}, {}, types.Query>,
    res: Response
){
    try {
        const filteredEmployees = await services.searchEmployees(req.query);
        return res.status(200).json(filteredEmployees);
    } catch(error){
        const err = parseHttpError(error);
        return res.status(err.status).json({ error: err.message });
    }
}

export async function getEmployeeStats(req: Request, res: Response){
    try {
        const stats = await services.getEmployeeStats();
        return res.status(200).json(stats);
    } catch (error){
        const err = parseHttpError(error);
        return res.status(err.status).json({ error: err.message });
    }
}
