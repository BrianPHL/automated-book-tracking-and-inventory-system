import { pool } from "../app.js"
import { QueryError, RowDataPacket, OkPacket, ResultSetHeader } from "mysql2";

declare type callbackType = QueryError | RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader

export const executeDatabaseQuery = async (query: string, argument?: string[] | null, callback?: (result: callbackType) => void) => {

    pool.query(query, argument, (error, results) => {

        if (callback) {

            if (error) {

                callback(error)
    
            }
    
            callback(results)    

        }
        
    })

}

export const isQueryError = async (result: callbackType) => { return result && result.constructor && result.constructor.name === "QueryError" }