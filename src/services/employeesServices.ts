import * as repository from "../repository/employeesRepository";
import * as types from "../types/employeesInterfaces";
import { CreateEmployeeInput, UpdateEmployeeInput, SearchEmployeesQuery } from "../schemas/employee.schema";
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


export async function updateEmployee(data: UpdateEmployeeInput, id: number): Promise<types.Employee>{
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

export async function searchEmployees(query: SearchEmployeesQuery): Promise<types.Employee[]>{
    return await repository.searchAndPaginate(query);
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