import type { Employee, UpdateEmployeeInput } from "../types/employee";
import { pool } from "../config/db";
import { CreateEmployeeInput, EmployeeIdParams, searchEmployeesQuery } from "../schemas/employee.schema";

export async function findByName(name: string): Promise<Employee | null>{
    const result = await pool.query(
        "SELECT * FROM employees WHERE LOWER(name) LIKE LOWER($1);",
        [name]
    );
    if (!result.rows[0]) return null;
    return result.rows[0];
}

export async function findById(id: number): Promise<Employee | null>{
    const result = await pool.query(
        "SELECT * FROM employees WHERE id = $1;",
        [id]
    );
    if (result.rowCount) return result.rows[0];
    return null;
}

export async function findAll(): Promise<Employee[]>{
    const result = await pool.query("SELECT * FROM employees;");
    return result.rows;
}

export async function create(employee: CreateEmployeeInput): Promise<Employee> {
    const result = await pool.query(
        "INSERT INTO employees(name, role, salary, active) VALUES($1, $2, $3, $4) RETURNING *;",
        [employee.name, employee.role, employee.salary, employee.active],
    );
    return result.rows[0];
}

export async function deleteById(id: number): Promise<boolean>{
    const result = await pool.query(
        "DELETE FROM employees WHERE id = $1;",
        [id]
    );
    if (result.rowCount) return true;
    return false;
}

export async function updateById(id: number, newData: UpdateEmployeeInput): Promise<Employee | null>{
    const result = await pool.query(
        "UPDATE employees SET name = $1, role = $2, salary = $3, active = $4 WHERE id = $5;",
        [newData.name, newData.role, newData.salary, newData.active, id]
    );
    if (result.rowCount) return await findById(id);
    return null;
}
