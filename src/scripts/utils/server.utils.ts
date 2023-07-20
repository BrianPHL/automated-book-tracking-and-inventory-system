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

            console.log(results)

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

        if (await isQueryError(result)) { console.log(result); return false }
        if (Array.isArray(result) && result.length < 1) { return false }

        return result[0].access_token === token

    } catch(err) {

        console.error(err)
        return false

    }

}

export const errorPrompt = (res: Response, data: object): void => {

    const params = new URLSearchParams()

    for (let [key, value] of Object.entries(data)) { params.append(key, value) }

    res.redirect(`/error?${params.toString()}`)

}

interface addAccessToken { table: string, token: UUID, username: string, password: string }

export const addAccessToken = async (data: addAccessToken): Promise<boolean> => {

    try {

        await executeDatabaseQuery(
                    
            "UPDATE personnel SET access_token = ? WHERE username = ? AND password = ?",
            [ data.token, data.username, data.password ]

        )

    } catch(err) {

        console.log(err);
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

        console.log(err);
        return false

    }

    return true

}