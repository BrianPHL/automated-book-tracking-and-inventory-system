import express from "express";
import * as controller from "../../controllers/personnel.controller.js";
const personnelDashboardRoute = express.Router();
personnelDashboardRoute.get("/", controller.personnelDashboard);
personnelDashboardRoute.post("/retrieve", controller.personnelDashboardData);
export default personnelDashboardRoute;
