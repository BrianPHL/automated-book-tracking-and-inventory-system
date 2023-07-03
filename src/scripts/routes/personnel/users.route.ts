import express from "express";
import { Request, Response } from "express";

const personnelUsersRoute = express.Router();

personnelUsersRoute.use("/", (req: Request, res: Response): void => {

    res.sendFile("users.html", { root: "public/views/personnel" })

})

export default personnelUsersRoute