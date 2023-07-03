import express from "express";
import { Request, Response } from "express";

const personnelDashboardRoute = express.Router();

personnelDashboardRoute.get("/", (req: Request, res: Response): void => {

    res.sendFile("dashboard.html", { root: "public/views/personnel" })

})

export default personnelDashboardRoute