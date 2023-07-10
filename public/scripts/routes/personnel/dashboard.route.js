import express from "express";
import { personnelDashboard } from "../../controllers/personnel.controller.js";
const personnelDashboardRoute = express.Router();
personnelDashboardRoute.get("/", personnelDashboard);
export default personnelDashboardRoute;
