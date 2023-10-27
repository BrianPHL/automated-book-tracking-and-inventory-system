import express from "express";
import * as controller from "../../controllers/personnel.controller.js";
const personnelStudentsRoute = express.Router();
personnelStudentsRoute.get("/", controller.personnelStudents);
// personnelStudentsRoute.get("/overview/retrieve", controller.personnelStudentsOverview)
// personnelStudentsRoute.get("/table/retrieve", controller.personnelStudentsTable)
export default personnelStudentsRoute;
