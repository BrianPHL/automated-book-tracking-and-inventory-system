import express from "express";
import * as controller from "../../controllers/personnel.controller.js";

const personnelAccountRoute = express.Router();

personnelAccountRoute.get("/retrieve", controller.personnelAccountData)
personnelAccountRoute.post("/logout", controller.personnelAccountLogout)

export default personnelAccountRoute