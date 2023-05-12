import { callbackType } from "../typings.js"
import { pool } from "../app.js"

const performDatabaseOperation = (query: string, argument: string[] | null, callback: (result: callbackType) => void) => {

    console.log(query, argument)

    pool.query(query, argument, (error, results) => {

        if (error) {

            callback(error)

        }

        callback(results)

    })

}

export { performDatabaseOperation }