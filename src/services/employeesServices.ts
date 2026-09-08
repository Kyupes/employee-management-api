import * as repository from "../repository/employeesRepository";
import { Employee, Stats, GeneralStats, RoleCount, RoleCountRow } from "../types/employeesInterfaces";
import { CreateEmployeeInput, UpdateEmployeeInput, SearchEmployeesQuery, PaginationQuery } from "../schemas/employee.schema";
import { AppError } from "../errors/appError";
import { UserRole } from "../types/userInterfaces";
import { get, set, remove } from '../cache/cacheService';
import { initializeVersion, incrementVersion, VersionResult, getVersion, ensureVersion } from "../cache/cacheVersionService";

export async function getAllEmployees(pagination: PaginationQuery, userId: number, role: UserRole): Promise<Employee[]>{
    const versionKey = "employees:list:version";
    const ttl = 300;
    let currVersion: number | null = await get(versionKey);
    if (currVersion === null){
        return repository.findAll(pagination, userId, role);
    }
    const key = `employees:list:v${currVersion}:page:${pagination.page}:limit:${pagination.limit}:userId:${userId}:role:${role}`;
    const cacheResult: Employee[] | null = await get(key);
    if (cacheResult !== null){
        return cacheResult;
    }
    const repoResult = await repository.findAll(pagination, userId, role);
    set(key, repoResult, ttl);
    return repoResult;
}

export async function findEmployeeById(id: number, userId: number, role: UserRole): Promise<Employee>{
    const versionKey = `employees:details:id:${id}:version`;
    const ttl = 300;
    let version: VersionResult = await getVersion(versionKey);
    let employee: Employee | null;
    if (version.status === "error"){
        employee = await repository.findById(id, userId, role);
    } 
    else if (version.status === "missing"){
        employee = await repository.findById(id, userId, role);
        if (employee !== null){
            const ensuredVersion = await ensureVersion(versionKey);
            if (ensuredVersion !== null){
                const key = `employees:details:id:${id}:v${ensuredVersion}:userId:${userId}:role:${role}`;
                set(key, employee, ttl);
            }
        }
    } 
    else {
        const employeeKey = `employees:details:id:${id}:v${version.version}:userId:${userId}:role:${role}`;
        employee = await get(employeeKey);
        if (employee === null){
            employee = await repository.findById(id, userId, role);
            if (employee !== null){
                set(employeeKey, employee, ttl);
            }
        }
    }
    if (employee === null){
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
    const listVersionKey = `employees:list:version`;
    await incrementVersion(listVersionKey);
    return employee;
}

export async function updateEmployee(id: number, data: UpdateEmployeeInput, userId: number, role: UserRole): Promise<Employee>{
    const employee = await repository.updateById(id, data, userId, role);
    if (!employee){
        throw new AppError("Employee not found", 404);
    }
    const detailsVersionKey = `employees:details:id:${id}:version`;
    const listVersionKey = `employees:list:version`;
    await Promise.all([
        incrementVersion(detailsVersionKey), 
        incrementVersion(listVersionKey)
    ]);
    return employee;
}

export async function deleteEmployeeById(id: number): Promise<void>{
    const deleted = await repository.deleteById(id);
    if (!deleted){
        throw new AppError("Employee not found", 404);
    }
    const detailsVersionKey = `employees:details:id:${id}:version`;
    const listVersionKey = `employees:list:version`;
    await Promise.all([
        incrementVersion(detailsVersionKey), 
        incrementVersion(listVersionKey)
    ]);
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