import type { Employee, GeneralStats, RoleCountRow } from "../types/employeesInterfaces";
import { pool } from "../config/db";
import { CreateEmployeeInput, SearchEmployeesQuery, UpdateEmployeeInput, PaginationQuery } from "../schemas/employee.schema";
import { UserRole } from "../types/userInterfaces";
import { off } from "cluster";

export async function findByName(name: string, userId: number, role: UserRole): Promise<Employee | null>{
    let query = "SELECT * FROM employees WHERE name ILIKE $1";
    const values: (number | string)[] = [name];
    if (role != 'admin'){
        query += " AND user_id = $2";
        values.push(userId);
    }
    const result = await pool.query(query, values);
    return result.rows[0] || null;
}

export async function searchAndPaginate(filters: SearchEmployeesQuery, userId: number, role: UserRole): Promise<Employee[]>{
    const values: (string | number | boolean)[] = [];
    const conditions: string[] = ["1=1"];
    if (filters.name) {
        values.push(`%${filters.name}%`);
        conditions.push(`name ILIKE $${values.length}`);
    }
    if (filters.role){
        values.push(`%${filters.role}%`);
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
    if (role != 'admin'){
        values.push(userId);
        conditions.push(`user_id = $${values.length}`);
    }
    const offset = (filters.page - 1) * filters.limit;
    const limitIndex = values.length + 1;
    const offsetIndex = values.length + 2;
    values.push(filters.limit, offset);
    const finalQuery = `SELECT * FROM employees WHERE ${conditions.join(' AND ')} LIMIT $${limitIndex} OFFSET $${offsetIndex};`;
    const result = await pool.query(finalQuery, values);
    return result.rows;
}

export async function findById(id: number, userId: number, role: UserRole): Promise<Employee | null>{
    let query = "SELECT * FROM employees WHERE id = $1";
    const values: number[] = [id];
    if (role != 'admin'){
        query += " AND user_id = $2";
        values.push(userId);
    }
    const result = await pool.query(query, values);
    return result.rows[0] || null;
}

export async function findAll(pagination: PaginationQuery, userId: number, role: UserRole): Promise<Employee[]>{
    let query = "SELECT * FROM employees";
    let values: number[] = [];
    if (role != 'admin'){
        query += " WHERE user_id = $1";
        values.push(userId);
    }
    const offset = (pagination.page - 1) * pagination.limit;
    const limitIndex = values.length + 1;
    const offsetIndex = values.length + 2;
    values.push(pagination.limit, offset);
    query += ` LIMIT $${limitIndex} OFFSET $${offsetIndex};`
    const result = await pool.query(query, values);
    return result.rows;
}

export async function create(employee: CreateEmployeeInput, userId: number): Promise<Employee> {
    const result = await pool.query(
        "INSERT INTO employees(name, role, salary, active, user_id) VALUES($1, $2, $3, $4, $5) RETURNING *;",
        [employee.name, employee.role, employee.salary, employee.active, userId],
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

export async function updateById(id: number, newData: UpdateEmployeeInput, userId: number, role: UserRole): Promise<Employee | null>{
    let query = "UPDATE employees SET name = $1, role = $2, salary = $3, active = $4 WHERE id = $5";
    const values: (string | number | boolean)[] = [newData.name, newData.role, newData.salary, newData.active, id];
    if (role != 'admin'){
        query += " AND user_id = $6";
        values.push(userId);
    }
    query += " RETURNING *;"
    const result = await pool.query(query, values);
    return result.rows[0] || null;
}

export async function getGeneralStats(userId: number, role: UserRole): Promise<GeneralStats>{
    let query = `
    SELECT 
	    COUNT(*) as "totalCount", 
	    COUNT(*) FILTER (WHERE active = true) AS "activeCount",
	    COUNT(*) FILTER (WHERE active = false) AS "inactiveCount",
	    AVG(salary) as "averageSalary", 
	    MAX(salary) as "highestSalary",
	    MIN(salary) as "lowestSalary"
    FROM employees
    `;
    let value = [];
    if (role != 'admin'){
        query += " WHERE user_id = $1";
        value.push(userId);
    }
    const result = await pool.query(query, value);
    return result.rows[0];
}

export async function getRolesCount(userId: number, role: UserRole): Promise<RoleCountRow[]>{
    let query = `
    SELECT role, COUNT(*) AS count
    FROM employees
    `;
    let value = [];
    if (role != 'admin'){
        query += " WHERE user_id = $1";
        value.push(userId);
    }
    query += " GROUP BY role;"
    const result = await pool.query(query, value);
    return result.rows;
}