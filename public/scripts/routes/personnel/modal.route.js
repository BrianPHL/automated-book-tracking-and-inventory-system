import express from "express";
import * as controller from "../../controllers/personnel.controller.js";
const personnelModalRoute = express.Router();
personnelModalRoute.get("/:tab/entries/fetch/:query?", controller.personnelModalData);
personnelModalRoute.post("/:tab/register", controller.personnelModalRegister);
personnelModalRoute.put("/:tab/lend", controller.personnelModalLend);
personnelModalRoute.put("/:tab/edit", controller.personnelModalEdit);
personnelModalRoute.delete("/:tab/delete/:id", controller.personnelModalDelete);
export default personnelModalRoute;
