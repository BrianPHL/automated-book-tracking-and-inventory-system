import { Request, Response } from "express";
import * as utils from "../utils/server.utils.js";
import { v4 as uuidv4 } from "uuid";
import { UUID } from "crypto";

export const personnelLogin = async (req: Request, res: Response): Promise<void> => {
    
    const memoryCookie = req.cookies['pMemory']

    await utils.validateToken('personnel', memoryCookie)
    ? res.redirect("/personnel/dashboard")
    : res.sendFile("login.html", { root: "public/views/personnel" })

}

export const personnelLoginAuth = async (req: Request, res: Response): Promise<void> => {

    const { username, password } = req.body

    try {

        await utils.executeDatabaseQuery(

            "SELECT * FROM personnel WHERE username = ? AND password = ?",
            [ username, password ], 
            async (result: any): Promise<void> => {
    
            if (await utils.isQueryError(result)) {
                
                console.error(result)
                res.sendStatus(500)
            
            }

            if (Array.isArray(result) && result.length > 0) {
    
                const uuidToken: UUID = uuidv4()
                const isTokenAdded: boolean = await utils.addAccessToken({
                    table: 'personnel',
                    column: 'username',
                    token: uuidToken,
                    identifier: username,
                    password: password
                })

                isTokenAdded
                ? (
                    res
                    .cookie("pMemory", uuidToken, {
    
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                        sameSite: "strict",
                        httpOnly: true,
                        secure: true
                    
                    })
                    .cookie("pAccess", uuidToken, {
    
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                        sameSite: "strict",
                        httpOnly: true,
                        secure: true
    
                    })
                    .cookie("pData", uuidToken, {
    
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

export const personnelDashboard = async (req: Request, res: Response): Promise<void> => {

    const accessCookie = req.cookies['pAccess']

    await utils.validateToken('personnel', accessCookie)
    ? res.sendFile("dashboard.html", { root: "public/views/personnel" })
    : utils.errorPromptRedirect(res, {
        status: 401,
        title: "Unauthorized",
        body: "You are not authorized to enter this webpage!"
    })

}

export const personnelInventory = async (req: Request, res: Response): Promise<void> => {

    const accessCookie = req.cookies['pAccess']

    await utils.validateToken('personnel', accessCookie)
    ? res.sendFile("inventory.html", { root: "public/views/personnel" })
    : utils.errorPromptRedirect(res, {
        status: 401,
        title: "Unauthorized",
        body: "You are not authorized to enter this webpage!"
    })

}

export const personnelStudents = async (req: Request, res: Response): Promise<void> => {

    const accessCookie = req.cookies['pAccess']

    await utils.validateToken('personnel', accessCookie)
    ? res.sendFile("students.html", { root: "public/views/personnel" })
    : utils.errorPromptRedirect(res, {
        status: 401,
        title: "Unauthorized",
        body: "You are not authorized to enter this webpage!"
    })

}

export const personnelUsers = async (req: Request, res: Response): Promise<void> => {

    const accessCookie = req.cookies['pAccess']

    await utils.validateToken('personnel', accessCookie)
    ? res.sendFile("users.html", { root: "public/views/personnel" })
    : utils.errorPromptRedirect(res, {
        status: 401,
        title: "Unauthorized",
        body: "You are not authorized to enter this webpage!"
    })

}

export const personnelLogout = async (req: Request, res: Response): Promise<void> => {

    const dataCookie = req.cookies['pData']
    const isTokenRemoved: boolean = await utils.removeAccessToken({
        table: 'personnel',
        token: dataCookie
    })

    isTokenRemoved
    ? (
        res
        .clearCookie('pMemory')
        .clearCookie('pAccess')
        .clearCookie('pData')
        .sendStatus(200)
    )
    : utils.errorPromptURL(res, {
        status: 500,
        title: 'Internal Server Error',
        body: 'Contact the server administrator.'
    })


}

export const error = async (req: Request, res: Response): Promise<void> => {

    res.sendFile("error.html", { root: "public/views" })

}