import { Request, Response } from "express";
import { pool } from "../app.js";

const loginHandler = (req: Request, res: Response) => {

    const { username, password } = req.body

    pool.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (error, results) => {

        if (error) { console.log(error); res.sendStatus(500); }

        try {

            if (Array.isArray(results) && results.length > 0) {

                res.sendStatus(200)

            } else {

                res.sendStatus(403)

            }

        } catch (err) { throw err }

    })

}

export { loginHandler }