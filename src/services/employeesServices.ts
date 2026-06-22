import * as repository from "../repository/employeesRepository";
import * as types from "../types/employeesInterfaces";
import { CreateEmployeeInput, UpdateEmployeeInput, SearchEmployeesQuery } from "../schemas/employee.schema";
import { AppError } from "../errors/appError";

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
    const generalStats: types.GeneralStats = await repository.getGeneralStats();
    const rolesCount: types.RoleCountRow[] = await repository.getRolesCount();
    const rolesCountObject = rolesCount.reduce<types.RoleCount>((roleObject, currRole) => {
        roleObject[currRole.role] = currRole.count;
        return roleObject;
    }, {} as types.RoleCount);
    return {
        totalEmployees: generalStats.totalcount,
        activeEmployees: generalStats.activecount,
        inactiveEmployees: generalStats.inactivecount,
        averageSalary: Number(generalStats.averagesalary).toFixed(2),
        highestSalary: generalStats.highestsalary,
        lowestSalary: generalStats.lowestsalary,
        roles: rolesCountObject
    };
}