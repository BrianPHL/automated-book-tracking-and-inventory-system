import express from "express";
import { Request, Response } from "express";

const logoutRoute = express.Router()

logoutRoute.get("/", (req: Request, res: Response):void => {

    console.log('Logout?')
    res.redirect("/")

})

export default logoutRoute