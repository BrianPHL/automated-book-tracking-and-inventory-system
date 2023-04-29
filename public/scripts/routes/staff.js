import express from "express";
const staffRoute = express.Router();
staffRoute.get("/", (req, res) => {
    console.log(`Existing cookies: ${req.headers.cookie}`);
    res.sendFile("staff.html", { root: "public/views" });
});
export default staffRoute;
