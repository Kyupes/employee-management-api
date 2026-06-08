import * as repository from "../repository/employeesRepository";
import * as types from "../types/employee";
import * as utils from "../utils/createError";

function isEmployeeDataIncomplete(data: types.CreateEmployeeInput): boolean{
    return !data.name ||
    data.role === undefined ||
    data.salary === undefined ||
    data.active === undefined;
}

function isValidEmployeeData(employeeData: types.CreateEmployeeInput): boolean{
    return typeof(employeeData.name) === "string" &&
    typeof(employeeData.role) === "string" &&
    !isNaN(employeeData.salary) &&
    typeof(employeeData.active) === "boolean";
}

function buildEmployee(data: types.CreateEmployeeInput): types.CreateEmployeeInput{
    if (isEmployeeDataIncomplete(data)){
        throw utils.createError("Missing parameters for creating employee", 400);
    }
    if (!isValidEmployeeData(data)){
        throw utils.createError("Invalid data provided", 400);
    }
    const newEmployeeData: types.CreateEmployeeInput = {
        name: data.name,
        role: data.role,
        salary: data.salary,
        active: data.active
    }
    return newEmployeeData;
}

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

export async function findEmployeeById(id: string): Promise<types.Employee>{
    if (isNaN(Number(id)) || id.trim().length === 0){
        throw utils.createError("Provided id is not a number", 400);
    }
    const idNumber = Number(id);
    const employee = await repository.findById(idNumber);
    if (employee === null){
        throw utils.createError("Employee not found", 404);
    }
    return employee;
}

export async function createEmployee(data: types.CreateEmployeeInput): Promise<types.Employee>{
    const employeeExists = await repository.findByName(data.name);
    if (employeeExists !== undefined){
        throw utils.createError("Employee already exists", 400);
    }
    const newEmployee = buildEmployee(data);
    const employee = await repository.create(newEmployee);
    return employee;
}

function validateFields(data: types.UpdateEmployeeInput): void{
    if (data.name === undefined || data.role === undefined || data.salary === undefined || data.active === undefined){
        throw utils.createError("Parameters missing for update", 400);
    }
    if (data.salary < 1000){
        throw utils.createError("Salary cannot be less than 1000", 400);
    }
    // may add more bussiness rules (don't know which)
}

export async function updateEmployee(data: types.UpdateEmployeeInput, id: number): Promise<types.Employee>{
    validateFields(data);
    const employee = await repository.updateById(id, data);
    if (!employee){
        throw utils.createError("Employee not found", 404);
    }
    return employee;
}

export async function deleteEmployeeById(id: number): Promise<void>{
    const deleted = await repository.deleteById(Number(id));
    if (!deleted){
        throw utils.createError("Employee not found", 404);
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