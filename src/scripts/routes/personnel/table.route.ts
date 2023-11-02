import express from "express";
import * as controller from "../../controllers/personnel.controller.js";

const personnelTableRoute = express.Router();

personnelTableRoute.get("/:tab/overview/fetch", controller.personnelTableOverview)
personnelTableRoute.get("/:tab/entries/fetch/:query?", controller.personnelTableEntries)

export default personnelTableRoute