import * as repository from "../repository/employeesRepository";
import { Employee, Stats, GeneralStats, RoleCount, RoleCountRow } from "../types/employeesInterfaces";
import { CreateEmployeeInput, UpdateEmployeeInput, SearchEmployeesQuery } from "../schemas/employee.schema";
import { AppError } from "../errors/appError";

export async function getAllEmployees(){
    return await repository.findAll();
}

export async function findEmployeeById(id: number): Promise<Employee>{
    const employee = await repository.findById(id);
    if (!employee){
        throw new AppError("Employee not found", 404);
    }
    return employee;
}

export async function createEmployee(data: CreateEmployeeInput): Promise<Employee>{
    const employeeExists = await repository.findByName(data.name);
    if (employeeExists){
        throw new AppError("Employee already exists", 409);
    }
    const employee = await repository.create(data);
    return employee;
}

export async function updateEmployee(data: UpdateEmployeeInput, id: number): Promise<Employee>{
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

export async function searchEmployees(query: SearchEmployeesQuery): Promise<Employee[]>{
    return await repository.searchAndPaginate(query);
}

export async function getEmployeeStats(): Promise<Stats>{
    const generalStats: GeneralStats = await repository.getGeneralStats();
    const rolesCount: RoleCountRow[] = await repository.getRolesCount();
    const rolesCountObject = rolesCount.reduce<RoleCount>((roleObject, currRole) => {
        roleObject[currRole.role] = Number(currRole.count);
        return roleObject;
    }, {} as RoleCount);
    return {
        totalEmployees: Number(generalStats.totalCount),
        activeEmployees: Number(generalStats.activeCount),
        inactiveEmployees: Number(generalStats.inactiveCount),
        averageSalary: Number(Number(generalStats.averageSalary).toFixed(2)),
        highestSalary: Number(generalStats.highestSalary),
        lowestSalary: Number(generalStats.lowestSalary),
        roles: rolesCountObject
    };
}