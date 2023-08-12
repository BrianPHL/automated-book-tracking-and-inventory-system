import express from "express";
import * as controller from "../../controllers/personnel.controller.js";
const personnelTableRoute = express.Router();
personnelTableRoute.get("/:table/search/:query", controller.personnelTableSearch);
export default personnelTableRoute;
