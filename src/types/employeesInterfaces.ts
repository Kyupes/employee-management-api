export interface Employee {
    id: number;
    name: string;
    role: string;
    salary: number;
    active: boolean;
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

export interface GeneralStats {
    totalCount: string;
    activeCount: string;
    inactiveCount: string;
    averageSalary: string;
    highestSalary: string;
    lowestSalary: string;
}

export interface RoleCountRow {
    role: string;
    count: string;
}