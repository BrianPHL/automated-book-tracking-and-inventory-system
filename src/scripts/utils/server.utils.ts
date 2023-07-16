import { pool } from "../app.js"
import { QueryError, RowDataPacket, OkPacket, ResultSetHeader } from "mysql2";
import { validate as uuidValidate } from 'uuid';
import { Response } from "express";

declare type callbackType = QueryError | RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader

export const executeDatabaseQuery = async (query: string, argument?: string | string[] | null, callback?: (result: callbackType) => void) => {

    pool.query(query, argument, (error, results) => {

        if (callback) {

            if (error) {

                callback(error)
    
            }
    
            callback(results)    

        }
        
    })

}

export const isQueryError = async (result: callbackType) => { 
    
    return result && result.constructor && result.constructor.name === "QueryError" 

}

export const validateCookies = async (cookies: string[]): Promise<boolean> => {

    if(!cookies || cookies === undefined) { return false }

    let results: boolean[] = []

    for await (let cookie of cookies) { results.push(uuidValidate(cookie)) }
    for await (let result of results) { if (result === false) { return false } }

    return true

}

export const errorPrompt = (res: Response, data: object): void => {

    const params = new URLSearchParams()

    for (let [key, value] of Object.entries(data)) { params.append(key, value) }

    res.redirect(`/error?${params.toString()}`)

}

export const isStudentNumber = (argument: string): boolean => {

    return argument[0] === 'R'

}