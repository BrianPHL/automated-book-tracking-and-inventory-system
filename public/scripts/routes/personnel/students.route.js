import express from "express";
import * as controller from "../../controllers/personnel.controller.js";
const personnelStudentsRoute = express.Router();
personnelStudentsRoute.get("/", controller.personnelStudents);
export default personnelStudentsRoute;
