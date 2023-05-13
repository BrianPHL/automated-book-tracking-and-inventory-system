import express from "express";
import { Request, Response } from "express";

const staffRoute = express.Router();

staffRoute.get("/", (req: Request, res: Response):void => {
    res.sendFile("staff.html", { root: "public/views" })
})

export default staffRoute