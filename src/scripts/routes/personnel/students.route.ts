import express from "express";
import * as controller from "../../controllers/personnel.controller.js";

const personnelStudentsRoute = express.Router();

personnelStudentsRoute.get("/", controller.personnelStudents)
personnelStudentsRoute.post("/retrieve", controller.personnelStudentsData)

export default personnelStudentsRoute