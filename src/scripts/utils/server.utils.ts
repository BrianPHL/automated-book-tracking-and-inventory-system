import { pool } from "../app.js";
import { Response } from "express";
import { UUID } from "crypto";

// TODO: export function status: partial, could be improved.
export const executeDatabaseQuery = async (query: string, argument?: string | string[] | null, callback?: (result: any) => void): Promise<any> => {

    try {

        if (!callback) {

            const [rows] = await pool.promise().query(query, argument)

            return rows


        } else { pool.query(query, argument, (results) => { callback(results) }) }

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }
    
}

// * export function status: complete
export const isQueryError = async (result: any) => { 
    
    return result && result.constructor && result.constructor.name === "QueryError" 

}

// * export function status: complete
export const errorPrompt = async (data: object): Promise<URLSearchParams> => {

    const params = new URLSearchParams()

    for (let [key, value] of Object.entries(data)) { params.append(key, value) }
    
    return params

}

// TODO: export function status: partial, could be improved. (Let the controller handle the response. Only return the string; It might be feasible to merge this with errorPromptURL())
export const errorPromptRedirect = async (res: Response, data: {status: number, title: string, body: string}): Promise<void> => {

    const params = await errorPrompt(data)

    res.redirect(`/error?${params.toString()}`)

}

// * export function status: complete
export const errorPromptURL = async (res: Response, data: { status: number, title: string, body: string }): Promise<string> => {

    const params = await errorPrompt(data)

    return params.toString()

}

// TODO: export function status: partial, could be improved.
export const validateAccessToken = async (data: { table: string, token: UUID }): Promise<boolean> => {

    try {

        const result = await executeDatabaseQuery(
            `SELECT access_token FROM ${ data.table } WHERE access_token = ?`,
            [ data.token ]
        )
        
        return !await isQueryResultEmpty(result)

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }

}

// * export function status: complete
export const addAccessToken = async (data: { table: string, column: string, token: UUID, identifier: string, password: string }): Promise<boolean> => {

    try {

        const result = await executeDatabaseQuery(
            `UPDATE ${data.table} SET access_token = ? WHERE ${data.column} = ? AND password = ?`,
            [ data.token, data.identifier, data.password ]
        )

        return !result ? false : true

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }

}

// * export function status: complete
export const removeAccessToken = async (data: { table: string, token: UUID }): Promise<boolean> => {

    try {

        const result = await executeDatabaseQuery(
            `UPDATE ${ data.table } SET access_token = NULL WHERE access_token = ?`,
            [ data.token ]
        )

        return !result ? false : true

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }

}

export const retrieveAccountData = async (type: string, token: UUID): Promise<object | boolean> => {

    let result: object = {}

    try {

        result = await executeDatabaseQuery(
            `SELECT first_name, last_name, role FROM ${ type } WHERE access_token = ?`,
            [ token ]
        )

        return result[0]

        
    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }
    
}

export const isQueryResultEmpty = async (queryResult: any) => {

    return !(Array.isArray(queryResult) && queryResult.length > 0)

}