import express from "express";
import { personnelInventory } from "../../controllers/personnel.controller.js";

const personnelInventoryRoute = express.Router();

personnelInventoryRoute.get("/", personnelInventory)

export default personnelInventoryRoute