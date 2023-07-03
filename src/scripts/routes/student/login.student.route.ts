import express from "express";
import { Request, Response } from "express";

const studentLoginRoute = express.Router();

studentLoginRoute.get("/", (req: Request, res: Response): void => {

    res.sendFile("login.html", { root: "public/views/student" })

})

export default studentLoginRoute