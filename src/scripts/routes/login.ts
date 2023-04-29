import express from "express";
import { Request, Response } from "express";

const loginRoute = express.Router();

loginRoute.get("/", (req: Request, res: Response):void => {
    console.log(`Existing cookies: ${req.headers.cookie}`)
    res.sendFile("login.html", { root: "public/views" })
})

export default loginRoute