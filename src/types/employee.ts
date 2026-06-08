export interface Employee {
    id: number;
    name: string;
    role: string;
    salary: number;
    active: boolean;
}

export interface UpdateEmployeeInput {
    name: string | undefined;
    role: string | undefined;
    salary: number | undefined;
    active: boolean | undefined;
}

export interface CreateEmployeeInput {
    name: string;
    role: string;
    salary: number;
    active: boolean;
}

export interface Query {
    name: string | undefined;
    role: string | undefined;
    minSalary: string | undefined;
    active: string | undefined;
}

export interface HttpError {
    message: string;
    status: number;
}

export interface RoleCount {
    [key: string]: number;
}

export interface Stats {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    averageSalary: number;
    highestSalary: number;
    lowestSalary: number;
    roles: RoleCount;
}