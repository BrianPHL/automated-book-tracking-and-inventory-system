import express from "express";
const personnelDashboardRoute = express.Router();
personnelDashboardRoute.get("/", (req, res) => {
    res.sendFile("dashboard.html", { root: "public/views/personnel" });
});
export default personnelDashboardRoute;
