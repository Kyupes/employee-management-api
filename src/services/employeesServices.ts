import * as repository from "../repository/employeesRepository";
import { Employee, Stats, GeneralStats, RoleCount, RoleCountRow } from "../types/employeesInterfaces";
import { CreateEmployeeInput, UpdateEmployeeInput, SearchEmployeesQuery, PaginationQuery } from "../schemas/employee.schema";
import { AppError } from "../errors/appError";
import { UserRole } from "../types/userInterfaces";

export async function getAllEmployees(pagination: PaginationQuery, userId: number, role: UserRole){
    return await repository.findAll(pagination, userId, role);
}

export async function findEmployeeById(id: number, userId: number, role: UserRole): Promise<Employee | null>{
    const employee = await repository.findById(id, userId, role);
    if (!employee){
        throw new AppError("Employee not found", 404);
    }
    return employee;
}

export async function createEmployee(data: CreateEmployeeInput, userId: number, role: UserRole): Promise<Employee>{
    const employeeExists = await repository.findByName(data.name, userId, role);
    if (employeeExists){
        throw new AppError("Employee already exists", 409);
    }
    const employee = await repository.create(data, userId);
    return employee;
}

export async function updateEmployee(id: number, data: UpdateEmployeeInput, userId: number, role: UserRole): Promise<Employee>{
    const employee = await repository.updateById(id, data, userId, role);
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

export async function searchEmployees(query: SearchEmployeesQuery, userId: number, role: UserRole): Promise<Employee[]>{
    return await repository.searchAndPaginate(query, userId, role);
}

export async function getEmployeeStats(userId: number, role: UserRole): Promise<Stats>{
    const generalStats: GeneralStats = await repository.getGeneralStats(userId, role);
    const rolesCount: RoleCountRow[] = await repository.getRolesCount(userId, role);
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