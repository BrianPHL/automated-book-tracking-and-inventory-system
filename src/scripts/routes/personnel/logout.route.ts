import express from "express";
import { personnelLogout } from "../../controllers/personnel.controller.js";

const personnelLogoutRoute = express.Router();

personnelLogoutRoute.post("/", personnelLogout)

export default personnelLogoutRoute