import express from "express";
const studentDashboardRoute = express.Router();
studentDashboardRoute.use("/", (req, res) => {
    res.sendFile("dashboard.html", { root: "public/views/student" });
});
export default studentDashboardRoute;
