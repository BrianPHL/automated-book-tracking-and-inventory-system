import express from "express";
import * as controller from "../../controllers/personnel.controller.js";
const personnelAccountRoute = express.Router();
personnelAccountRoute.post("/logout", controller.personnelAccountLogout);
export default personnelAccountRoute;
