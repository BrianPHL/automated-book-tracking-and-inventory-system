import { Request, Response } from "express";
import { performDatabaseOperation } from "../utils/db.js";

const loginHandler = (req: Request, res: Response) => {

    const { username, password } = req.body
    const queryString = "SELECT * FROM users WHERE username = ? AND password = ?"
    const queryArgs = [ username, password ]

    performDatabaseOperation(queryString, queryArgs, (result) => {

        if (result && result.constructor && result.constructor.name === 'QueryError') {

            console.log(result)
            res.sendStatus(500)

        }
        
        try {

            if (Array.isArray(result) && result.length > 0) {

                res.sendStatus(200)

            } else {

                res.sendStatus(403)

            }

        } catch (err) { throw err }

    })

}

export { loginHandler }