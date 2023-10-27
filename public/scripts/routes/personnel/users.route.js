import express from "express";
import * as controller from "../../controllers/personnel.controller.js";
const personnelUsersRoute = express.Router();
personnelUsersRoute.get("/", controller.personnelUsers);
// personnelUsersRoute.get("/overview/retrieve", controller.personnelUsersOverview)
// personnelUsersRoute.get("/table/retrieve", controller.personnelUsersTable)
export default personnelUsersRoute;
