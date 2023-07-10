import express from "express";
import { personnelUsers } from "../../controllers/personnel.controller.js";
const personnelUsersRoute = express.Router();
personnelUsersRoute.get("/", personnelUsers);
export default personnelUsersRoute;
