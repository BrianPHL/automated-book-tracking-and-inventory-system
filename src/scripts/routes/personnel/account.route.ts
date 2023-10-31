import express from "express";
import * as controller from "../../controllers/personnel.controller.js";

const personnelAccountRoute = express.Router();

personnelAccountRoute.get("/fetch", controller.personnelAccountData)
personnelAccountRoute.post("/logout", controller.personnelAccountLogout)

export default personnelAccountRoute