import express from "express";
import { Request, Response } from "express";
import * as auth from "../controllers/auth.js";

const loginRoute = express.Router();

loginRoute.get("/", (req: Request, res: Response):void => {
    res.sendFile("login.html", { root: "public/views" })
})

loginRoute.post("/authenticate", auth.loginHandler)

export default loginRoute