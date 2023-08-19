import express from "express";
import * as controller from "../../controllers/personnel.controller.js";

const personnelTableRoute = express.Router();

personnelTableRoute.get("/:tab/search/:query", controller.personnelTableSearch)
personnelTableRoute.post("/:tab/actions/:type", controller.personnelTableActions)

export default personnelTableRoute