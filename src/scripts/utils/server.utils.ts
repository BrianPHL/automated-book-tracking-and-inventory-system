import { pool } from "../app.js"
import { Query, QueryError, RowDataPacket, OkPacket, ResultSetHeader, FieldPacket } from "mysql2";
import { Response } from "express";
import { UUID } from "crypto";

declare type callbackType = Query | QueryError | RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader | FieldPacket[]

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

export const isQueryError = async (result: callbackType) => { 
    
    return result && result.constructor && result.constructor.name === "QueryError" 

}

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

export const errorPrompt = async (data: object): Promise<URLSearchParams> => {

    const params = new URLSearchParams()

    for (let [key, value] of Object.entries(data)) { params.append(key, value) }
    
    return params

}

export const errorPromptRedirect = async (res: Response, data: object): Promise<void> => {

    const params = await errorPrompt(data)

    res.redirect(`/error?${params.toString()}`)

}

export const errorPromptURL = async (res: Response, data: object): Promise<void> => {

    const params = await errorPrompt(data)

    res.send(params.toString())

}

interface addAccessToken { 

    table: string, 
    column: string, 
    token: UUID, 
    identifier: string, 
    password: string 

}

export const addAccessToken = async (data: addAccessToken): Promise<boolean> => {

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

interface removeAccessToken { table: string, token: UUID }

export const removeAccessToken = async (data: removeAccessToken): Promise<boolean> => {

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