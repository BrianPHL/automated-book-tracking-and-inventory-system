import express from "express";
import { Request, Response } from "express";

const personnelStudentsRoute = express.Router();

personnelStudentsRoute.use("/", (req: Request, res: Response): void => {

    res.sendFile("students.html", { root: "public/views/personnel" })

})

export default personnelStudentsRoute