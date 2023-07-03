import express from "express";
import { Request, Response } from "express";

const personnelLoginRoute = express.Router();

personnelLoginRoute.get("/", (req: Request, res: Response): void => {

    res.sendFile("login.html", { root: "public/views/personnel" })

})

export default personnelLoginRoute