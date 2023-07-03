import express from "express";
import { Request, Response } from "express";

const personnelInventoryRoute = express.Router();

personnelInventoryRoute.use("/", (req: Request, res: Response): void => {

    res.sendFile("inventory.html", { root: "public/views/personnel" })

})

export default personnelInventoryRoute