import express from "express";
import * as controller from "../../controllers/student.controller.js"

const studentLoginRoute = express.Router();

studentLoginRoute.get("/", controller.studentLogin)
studentLoginRoute.post("/auth", controller.studentLoginAuth)

export default studentLoginRoute