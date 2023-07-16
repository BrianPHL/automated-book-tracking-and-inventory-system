import { Request, Response } from "express";
import * as utils from "../utils/server.utils.js";
import { v4 as uuidv4 } from "uuid";

export const studentLogin = async (req: Request, res: Response): Promise<void> => {

    const memoryCookie = req.cookies['sMemory']

    await utils.validateCookies([memoryCookie])
    ? res.redirect("/student/dashboard")
    : res.sendFile("login.html", { root: "public/views/student" })

}

export const studentLoginAuth = async (req: Request, res: Response): Promise<void> => {

    const { studentOrPhoneNum, password } = req.body
    const queryArgs = [ studentOrPhoneNum.toString(), password.toString() ]
    let queryString: string

    utils.isStudentNumber(studentOrPhoneNum)
    ? queryString = "SELECT * FROM students WHERE student_number = ? AND password = ?"
    : queryString = "SELECT * FROM students WHERE phone_number = ? AND password = ?"

    await utils.executeDatabaseQuery(queryString, queryArgs, async (result: any): Promise<void> => {

        if (await utils.isQueryError(result)) { res.sendStatus(500) }

        try {

            if (Array.isArray(result) && result.length > 0) {

                console.log('YES')

                res
                .cookie("sMemory", uuidv4(), {

                    maxAge: 30 * 24 * 60 * 60 * 1000, 
                    httpOnly: true, 
                    secure: true
                
                })
                .cookie("sAccess", uuidv4(), {

                    maxAge: 30 * 24 * 60 * 60 * 1000, 
                    httpOnly: true, 
                    secure: true

                })
                .sendStatus(200)

            } else {

                console.log('NO')

                res.sendStatus(403)

            }
            
        } catch (err) { throw err }

    })

}

export const studentDashboard = async (req: Request, res: Response): Promise<void> => {

    const accessCookie = req.cookies['sAccess']

    await utils.validateCookies([accessCookie])
    ? res.sendFile("dashboard.html", { root: "public/views/student" })
    : utils.errorPrompt(res, {
        status: 401,
        title: "Unauthorized",
        body: "You are not authorized to enter this webpage!"
    })

}

export const studentLogout = async (req: Request, res: Response): Promise<void> => {

    res
    .clearCookie('sMemory')
    .clearCookie('sAccess')
    .sendStatus(200)

}