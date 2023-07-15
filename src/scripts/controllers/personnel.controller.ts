import { Request, Response } from "express";
import { errorPrompt, executeDatabaseQuery, isQueryError, validateCookies } from "../utils/server.utils.js";
import { v4 as uuidv4 } from "uuid";

export const personnelLogin = async (req: Request, res: Response): Promise<void> => {
    
    const memoryCookie = req.cookies['memory']

    await validateCookies([memoryCookie])
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

                // TODO: Create two separate "Access" cookies for "student" and "personnel".

                res
                .cookie("memory", uuidv4(), {

                    maxAge: 30 * 24 * 60 * 60 * 1000, 
                    httpOnly: true, 
                    secure: true
                
                })
                .cookie("access", uuidv4(), {

                    maxAge: 30 * 24 * 60 * 60 * 1000, 
                    httpOnly: true, 
                    secure: true

                })
                .sendStatus(200)

            } else {

                res.sendStatus(403)

            }
            
        } catch (err) { throw err }

    })

}

export const personnelDashboard = async (req: Request, res: Response): Promise<void> => {

    const accessCookie = req.cookies['access']

    await validateCookies([accessCookie])
    ? res.sendFile("dashboard.html", { root: "public/views/personnel" })
    : errorPrompt(res, {
        status: 401,
        title: "Unauthorized",
        body: "You are not authorized to enter this webpage!"
    })

}

export const personnelInventory = async (req: Request, res: Response): Promise<void> => {

    const accessCookie = req.cookies['access']

    await validateCookies([accessCookie])
    ? res.sendFile("inventory.html", { root: "public/views/personnel" })
    : errorPrompt(res, {
        status: 401,
        title: "Unauthorized",
        body: "You are not authorized to enter this webpage!"
    })

}

export const personnelStudents = async (req: Request, res: Response): Promise<void> => {

    const accessCookie = req.cookies['access']

    await validateCookies([accessCookie])
    ? res.sendFile("students.html", { root: "public/views/personnel" })
    : errorPrompt(res, {
        status: 401,
        title: "Unauthorized",
        body: "You are not authorized to enter this webpage!"
    })

}

export const personnelUsers = async (req: Request, res: Response): Promise<void> => {

    const accessCookie = req.cookies['access']

    await validateCookies([accessCookie])
    ? res.sendFile("users.html", { root: "public/views/personnel" })
    : errorPrompt(res, {
        status: 401,
        title: "Unauthorized",
        body: "You are not authorized to enter this webpage!"
    })

}

export const personnelLogout = async (req: Request, res: Response): Promise<void> => {

    res
    .clearCookie('memory')
    .clearCookie('access')
    .sendStatus(200)

}

export const error = async (req: Request, res: Response): Promise<void> => {

    res.sendFile("error.html", { root: "public/views" })

}