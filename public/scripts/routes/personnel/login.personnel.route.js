import express from "express";
const personnelLoginRoute = express.Router();
personnelLoginRoute.get("/", (req, res) => {
    res.sendFile("login.html", { root: "public/views/personnel" });
});
export default personnelLoginRoute;
