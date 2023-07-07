import express from "express";
import { personnelLogin, personnelLoginAuth } from "../../controllers/personnel.controller.js";

const personnelLoginRoute = express.Router();

personnelLoginRoute.get("/", personnelLogin)
personnelLoginRoute.post("/auth", personnelLoginAuth)

export default personnelLoginRoute