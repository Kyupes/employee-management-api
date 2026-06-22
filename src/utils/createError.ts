import * as types from "../types/employeesInterfaces";

export function createError(message: string, status: number): types.HttpError{
    return { message: message, status: status };
}