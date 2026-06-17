import * as repository from "../repository/employeesRepository";
import * as types from "../types/employee";
import * as utils from "../utils/createError";
import { CreateEmployeeInput } from "../schemas/createEmployeeSchema";
import { AppError } from "../errors/appError";

function calculateAverageSalary(employees: types.Employee[]): number{
    if (employees.length === 0) return 0;
    return employees.reduce((sum, employee) => sum + employee.salary, 0)/employees.length;
}

function getMaxSalary(employees: types.Employee[]): number{
    if (employees.length === 0) return 0;
    return employees.reduce((highest, employee) => highest = employee.salary > highest ? employee.salary : highest, 0);
}

function getMinSalary(employees: types.Employee[]): number{
    if (employees.length === 0) return 0;
    return employees.reduce((lowest, employee) => lowest = employee.salary < lowest ? employee.salary : lowest, Infinity);
}

function countEmployeesByRole(employees: types.Employee[]): types.RoleCount{
    const roles: types.RoleCount = {};
    for (const employee of employees){
        const role = employee.role;
        if (roles[role] !== undefined)
            roles[role]++;
        else
            roles[role] = 1;
    }
    return roles;
}

export async function getAllEmployees(){
    return await repository.findAll();
}

export async function findEmployeeById(id: number): Promise<types.Employee>{
    const employee = await repository.findById(id);
    if (!employee){
        throw new AppError("Employee not found", 404);
    }
    return employee;
}

export async function createEmployee(data: CreateEmployeeInput): Promise<types.Employee>{
    const employeeExists = await repository.findByName(data.name);
    if (employeeExists){
        throw new AppError("Employee already exists", 409);
    }
    const employee = await repository.create(data);
    return employee;
}


export async function updateEmployee(data: types.UpdateEmployeeInput, id: number): Promise<types.Employee>{
    const employee = await repository.updateById(id, data);
    if (!employee){
        throw new AppError("Employee not found", 404);
    }
    return employee;
}

export async function deleteEmployeeById(id: number): Promise<void>{
    const deleted = await repository.deleteById(Number(id));
    if (!deleted){
        throw new AppError("Employee not found", 404);
    }
}

export async function searchEmployees(query: types.Query): Promise<types.Employee[]>{
    let filteredEmployees = await repository.findAll();
    if (query.name){
        const name = query.name;
        filteredEmployees = filteredEmployees.filter(employee => employee.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (query.role){
        const role = query.role;
        filteredEmployees = filteredEmployees.filter(employee => employee.role.toLowerCase().includes(role.toLowerCase()));
    }
    if (query.minSalary){
        const minSalary = Number(query.minSalary);
        if (isNaN(minSalary)){
            throw utils.createError("Provided minSalary is not a number", 400);
        }
        filteredEmployees = filteredEmployees.filter(employee => employee.salary >= minSalary);
    }
    if (query.active){
        if (query.active.toLowerCase() !== "true" && query.active.toLowerCase() !== "false"){
            throw utils.createError("Provided activity is not boolean", 400);
        }
        const activity = query.active === "true" ? true : false;
        filteredEmployees = filteredEmployees.filter(employee => employee.active === activity);
    }
    return filteredEmployees;
}

export async function getEmployeeStats(): Promise<types.Stats>{
    const employees = await repository.findAll();
    const length = employees.length;
    const stats: types.Stats = {
        totalEmployees: length,
        activeEmployees: employees.filter(employee => employee.active).length,
        inactiveEmployees: employees.filter(employee => !employee.active).length,
        averageSalary: Number(calculateAverageSalary(employees).toFixed(2)),
        highestSalary: getMaxSalary(employees),
        lowestSalary: getMinSalary(employees),
        roles: countEmployeesByRole(employees)
    };
    return stats;
}