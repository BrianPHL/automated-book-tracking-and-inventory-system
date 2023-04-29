import express from "express";
import { Request, Response } from "express";

const errorRoute = express.Router();

errorRoute.get("/", (req: Request, res: Response):void => {
    console.log(`Existing cookies: ${req.headers.cookie}`)
    res.sendFile("error.html", { root: "public/views" })
})

export default errorRoute