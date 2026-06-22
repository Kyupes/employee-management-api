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
    totalEmployees: string;
    activeEmployees: string;
    inactiveEmployees: string;
    averageSalary: string;
    highestSalary: string;
    lowestSalary: string;
    roles: RoleCount;
}

export interface GeneralStats {
    totalcount: string;
    activecount: string;
    inactivecount: string;
    averagesalary: string;
    highestsalary: string;
    lowestsalary: string;
}

export interface RoleCountRow {
    role: string;
    count: number;
}