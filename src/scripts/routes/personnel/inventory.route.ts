import express from "express";
import * as controller from "../../controllers/personnel.controller.js";

const personnelInventoryRoute = express.Router();

personnelInventoryRoute.get("/", controller.personnelInventory)
personnelInventoryRoute.post("/retrieve", controller.personnelInventoryData)

export default personnelInventoryRoute