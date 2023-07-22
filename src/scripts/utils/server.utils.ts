import { pool } from "../app.js";
import { Response } from "express";
import { UUID } from "crypto";

// TODO: export function status: partial, could be improved.
export const executeDatabaseQuery = async (query: string, argument?: string | string[] | null, callback?: (result: any) => void): Promise<any> => {

    if (!callback) {
        
        const [rows] = await pool.promise().query(query, argument)

        return rows

    } else {

        pool.query(query, argument, (error, results) => {

            !error
            ? callback(results)
            : callback(error)

        })

    }
    
}

// * export function status: complete
export const isQueryError = async (result: any) => { 
    
    return result && result.constructor && result.constructor.name === "QueryError" 

}

// TODO: export function status: partial, could be improved.
export const validateToken = async (table: string, token: string): Promise<boolean> => {

    try {

        const result: any = await executeDatabaseQuery(
            `SELECT access_token FROM ${table} WHERE access_token = ?`, 
            [token]
        )

        if (await isQueryError(result)) { console.error(result); return false }
        if (Array.isArray(result) && result.length < 1) { return false }

        return result[0].access_token === token

    } catch(err) {

        console.error(err)
        return false

    }

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
export const errorPromptURL = async (data: { status: number, title: string, body: string }): Promise<string> => {

    const params = await errorPrompt(data)

    return params.toString()

}

// * export function status: complete
export const addAccessToken = async (data: { table: string, column: string, token: UUID, identifier: string, password: string }): Promise<boolean> => {

    try {

        await executeDatabaseQuery(
                    
            `UPDATE ${data.table} SET access_token = ? WHERE ${data.column} = ? AND password = ?`,
            [ data.token, data.identifier, data.password ]

        )

    } catch(err) {

        console.error(err);
        return false

    }

    return true

}

// * export function status: complete
export const removeAccessToken = async (data: { table: string, token: UUID }): Promise<boolean> => {

    try {

        await executeDatabaseQuery(
            `UPDATE ${data.table} SET access_token = NULL WHERE access_token = ?`,
            [ data.token ]
        )

    } catch(err) {

        console.error(err);
        return false

    }

    return true

}