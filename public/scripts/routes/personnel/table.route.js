import express from "express";
import * as controller from "../../controllers/personnel.controller.js";
const personnelTableRoute = express.Router();
personnelTableRoute.get("/:tab/fetch/:query?", controller.personnelTableFetch);
personnelTableRoute.post("/:tab/register", controller.personnelTableRegister);
personnelTableRoute.post("/:tab/edit", controller.personnelTableEdit);
personnelTableRoute.post("/lend", controller.personnelTableLend);
personnelTableRoute.post("/:tab/delete/:id", controller.personnelTableDelete);
export default personnelTableRoute;
