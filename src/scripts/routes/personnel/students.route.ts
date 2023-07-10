import express from "express";
import { personnelStudents } from "../../controllers/personnel.controller.js";

const personnelStudentsRoute = express.Router();

personnelStudentsRoute.get("/", personnelStudents)

export default personnelStudentsRoute