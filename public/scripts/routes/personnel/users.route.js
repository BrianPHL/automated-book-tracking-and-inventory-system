import express from "express";
import * as controller from "../../controllers/personnel.controller.js";
const personnelUsersRoute = express.Router();
personnelUsersRoute.get("/", controller.personnelUsers);
personnelUsersRoute.post("/retrieve", controller.personnelUsersData);
export default personnelUsersRoute;
