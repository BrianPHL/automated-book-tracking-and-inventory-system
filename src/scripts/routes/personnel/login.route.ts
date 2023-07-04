import express from "express";
import { Request, Response } from "express";
import {personnelLoginAuth } from "../../controllers/auth.controller.js";

const personnelLoginRoute = express.Router();

personnelLoginRoute.get("/", (req: Request, res: Response): void => {

    res.sendFile("login.html", { root: "public/views/personnel" })

})

personnelLoginRoute.post("/auth", personnelLoginAuth)

export default personnelLoginRoute