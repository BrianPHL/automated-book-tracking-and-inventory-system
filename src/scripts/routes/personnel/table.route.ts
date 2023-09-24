import express from "express";
import * as controller from "../../controllers/personnel.controller.js";

const personnelTableRoute = express.Router();

personnelTableRoute.get("/:tab/fetch/:query?", controller.personnelTableFetch)
personnelTableRoute.post("/:tab/actions/:type", controller.personnelTableActions)
personnelTableRoute.post("/lend/", controller.personnelTableLend)

export default personnelTableRoute