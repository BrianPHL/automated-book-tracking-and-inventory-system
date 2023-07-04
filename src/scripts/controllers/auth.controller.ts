import { Request, Response } from "express";
import { executeDatabaseQuery, isQueryError } from "../utils/server.utils.js";

const personnelLoginAuth = (req: Request, res: Response) => {

    const { username, password } = req.body
    const queryString = "SELECT * FROM personnel WHERE username = ? AND password = ?"
    const queryArgs = [ username, password ]

    executeDatabaseQuery(queryString, queryArgs, async (result) => {

        if (await isQueryError(result)) { res.sendStatus(500) }

        try {

            if (Array.isArray(result) && result.length > 0) {

                res.sendStatus(200)

            } else {

                res.sendStatus(403)

            }
            
        } catch (err) { throw err }

    })

}

const studentLoginAuth = (req: Request, res: Response) => {



}

// const studentSignUpAuth = (req: Request, res: Response) => {}

// const personnelSignUpAuth = (req: Request, res: Response) => {}

export { personnelLoginAuth, studentLoginAuth }