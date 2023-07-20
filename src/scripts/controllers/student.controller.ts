import { Request, Response } from "express";
import * as utils from "../utils/server.utils.js";
import { v4 as uuidv4 } from "uuid";
import { UUID } from "crypto";

export const studentLogin = async (req: Request, res: Response): Promise<void> => {

    const memoryCookie = req.cookies['sMemory']

    await utils.validateToken('students', memoryCookie)
    ? res.redirect("/student/dashboard")
    : res.sendFile("login.html", { root: "public/views/student" })

}

export const studentLoginAuth = async (req: Request, res: Response): Promise<void> => {

    const { studentOrPhoneNum, password } = req.body
    const queryArgs = [ studentOrPhoneNum.toString(), password.toString() ]
    let queryString: string

    studentOrPhoneNum[0] === 'R'
    ? queryString = "SELECT * FROM students WHERE student_number = ? AND password = ?"
    : queryString = "SELECT * FROM students WHERE phone_number = ? AND password = ?"

    try {

        await utils.executeDatabaseQuery(
            
            queryString, 
            queryArgs, 
            async (result: any): Promise<void> => {
    
            if (await utils.isQueryError(result)) {
                
                console.error(result)
                res.sendStatus(500)
            
            }

            if (Array.isArray(result) && result.length > 0) {
    
                const uuidToken: UUID = uuidv4()
                const isTokenAdded: boolean = await utils.addAccessToken({
                    table: 'students',
                    column: studentOrPhoneNum[0] === 'R' ? 'student_number' : 'phone_number',
                    token: uuidToken,
                    identifier: studentOrPhoneNum,
                    password: password
                })

                isTokenAdded
                ? (
                    res
                    .cookie("sMemory", uuidToken, {
    
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                        sameSite: "strict",
                        httpOnly: true,
                        secure: true
                    
                    })
                    .cookie("sAccess", uuidToken, {
    
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                        sameSite: "strict",
                        httpOnly: true,
                        secure: true
    
                    })
                    .cookie("sData", uuidToken, {
    
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                        sameSite: "strict",
                        httpOnly: true,
                        secure: true
    
                    })
                    .sendStatus(200)
                )
                : res.sendStatus(500)



            } else {

                res.sendStatus(403)

            }
    
        })

    } catch (err) { 
        
        console.error(err)
        res.sendStatus(500)
    
    }

}

export const studentDashboard = async (req: Request, res: Response): Promise<void> => {

    const accessCookie = req.cookies['sAccess']

    await utils.validateToken('students', accessCookie)
    ? res.sendFile("dashboard.html", { root: "public/views/student" })
    : utils.errorPromptRedirect(res, {
        status: 401,
        title: "Unauthorized",
        body: "You are not authorized to enter this webpage!"
    })

}

export const studentLogout = async (req: Request, res: Response): Promise<void> => {

    const dataCookie = req.cookies['sData']
    const isTokenRemoved: boolean = await utils.removeAccessToken({
        table: 'students',
        token: dataCookie
    })

    isTokenRemoved
    ? (
        res
        .clearCookie('sMemory')
        .clearCookie('sAccess')
        .clearCookie('sData')
        .sendStatus(200)
    )
    : utils.errorPromptURL(res, {
        status: 500,
        title: 'Internal Server Error',
        body: 'Contact the server administrator.'
    })

}