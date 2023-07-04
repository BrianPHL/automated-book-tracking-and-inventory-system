import express from "express";
import { personnelLoginAuth } from "../../controllers/auth.controller.js";
const personnelLoginRoute = express.Router();
personnelLoginRoute.get("/", (req, res) => {
    res.sendFile("login.html", { root: "public/views/personnel" });
});
personnelLoginRoute.post("/auth", personnelLoginAuth);
export default personnelLoginRoute;
