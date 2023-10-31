import express from "express";
import * as controller from "../../controllers/personnel.controller.js";
const personnelUsersRoute = express.Router();
personnelUsersRoute.get("/", controller.personnelUsers);
export default personnelUsersRoute;
