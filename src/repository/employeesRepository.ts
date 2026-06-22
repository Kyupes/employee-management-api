import type { Employee, UpdateEmployeeInput } from "../types/employeesInterfaces";
import { pool } from "../config/db";
import { CreateEmployeeInput, SearchEmployeesQuery } from "../schemas/employee.schema";

export async function findByName(name: string): Promise<Employee | null>{
    const result = await pool.query(
        "SELECT * FROM employees WHERE name ILIKE $1;",
        [name]
    );
    if (!result.rows[0]) return null;
    return result.rows[0];
}

export async function searchAndPaginate(filters: SearchEmployeesQuery): Promise<Employee[]>{
    const values: (string | number | boolean)[] = [];
    const conditions: string[] = ["1=1"];
    if (filters.name) {
        values.push(filters.name);
        conditions.push(`name ILIKE $${values.length}`);
    }
    if (filters.role){
        values.push(filters.role);
        conditions.push(`role ILIKE $${values.length}`);
    }
    if (filters.minSalary){
        values.push(filters.minSalary);
        conditions.push(`salary > $${values.length}`);
    }
    if (filters.active !== undefined){
        values.push(filters.active);
        conditions.push(`active = $${values.length}`);
    } 
    const offset = (filters.page - 1) * filters.limit;
    const limitIndex = values.length + 1;
    const offsetIndex = values.length + 2;
    values.push(filters.limit, offset);
    const finalQuery = `SELECT * FROM employees WHERE ${conditions.join(' AND ')} LIMIT $${limitIndex} OFFSET $${offsetIndex};`;
    const result = await pool.query(finalQuery, values);
    return result.rows;
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
