import express from "express";
const staffRoute = express.Router();
staffRoute.get("/", (req, res) => {
    res.sendFile("staff.html", { root: "public/views" });
});
export default staffRoute;
