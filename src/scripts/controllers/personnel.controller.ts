import { Request, Response } from "express";
import { executeDatabaseQuery, isQueryError, isLoggedIn } from "../utils/server.utils.js";
import { v4 as uuidv4 } from "uuid";

export const personnelLogin = (req: Request, res: Response): void => {

    const cookie = req.cookies['rememberMe']

    isLoggedIn(cookie)
    ? res.redirect("/personnel/dashboard")
    : res.sendFile("login.html", { root: "public/views/personnel" })
    
}

export const personnelLoginAuth = async (req: Request, res: Response): Promise<void> => {

    const { username, password } = req.body
    const queryString = "SELECT * FROM personnel WHERE username = ? AND password = ?"
    const queryArgs = [ username, password ]

    await executeDatabaseQuery(queryString, queryArgs, async (result: any) => {

        if (await isQueryError(result)) { res.sendStatus(500) }

        try {

            if (Array.isArray(result) && result.length > 0) {

                res
                .cookie("rememberMe", uuidv4(), {

                    maxAge: 30 * 24 * 60 * 60 * 1000, 
                    httpOnly: true, 
                    secure: true
                
                })
                .redirect("/personnel/dashboard") 

            } else {

                res.sendStatus(403)

            }
            
        } catch (err) { throw err }

    })

}