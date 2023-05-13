import express from "express";
import { Request, Response } from "express";

const errorRoute = express.Router();

errorRoute.get("/", (req: Request, res: Response):void => {
    res.sendFile("error.html", { root: "public/views" })
})

export default errorRoute