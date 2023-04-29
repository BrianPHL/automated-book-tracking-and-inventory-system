import express from "express";
import { Request, Response } from "express";

const studentRoute = express.Router();

studentRoute.get("/", (req: Request, res: Response):void => {
    console.log(`Existing cookies: ${req.headers.cookie}`)
    res.sendFile("student.html", { root: "public/views" })
})

export default studentRoute