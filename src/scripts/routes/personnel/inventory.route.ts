import express from "express";
import * as controller from "../../controllers/personnel.controller.js";

const personnelInventoryRoute = express.Router();

personnelInventoryRoute.get("/", controller.personnelInventory)
// personnelInventoryRoute.get("/overview/retrieve", controller.personnelInventoryOverview)
// personnelInventoryRoute.get("/table/retrieve", controller.personnelInventoryTable)

export default personnelInventoryRoute