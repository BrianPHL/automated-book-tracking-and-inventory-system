import express from "express";
import { Request, Response } from "express";

const studentDashboardRoute = express.Router();

studentDashboardRoute.use("/", (req: Request, res: Response): void => {

    res.sendFile("dashboard.html", { root: "public/views/student" })

})

export default studentDashboardRoute