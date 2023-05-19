import { callbackType } from "../typings.js"
import { pool } from "../app.js"

export const performDatabaseOperation = async (query: string, argument: string[] | null, callback?: (result: callbackType) => void) => {

    pool.query(query, argument, (error, results) => {

        if (callback) {

            if (error) {

                callback(error)
    
            }
    
            callback(results)    

        }
        
    })

}