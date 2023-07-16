import express from "express";
import { studentLogout } from "../../controllers/student.controller.js";
const studentLogoutRoute = express.Router();
studentLogoutRoute.post("/", studentLogout);
export default studentLogoutRoute;
