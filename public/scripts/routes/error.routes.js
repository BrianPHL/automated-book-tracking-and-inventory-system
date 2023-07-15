import express from "express";
import * as controller from "../controllers/personnel.controller.js";
const errorRoute = express.Router();
errorRoute.get("/", controller.error);
export default errorRoute;
