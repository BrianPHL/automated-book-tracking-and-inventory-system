import express from "express";
const studentLoginRoute = express.Router();
studentLoginRoute.get("/", (req, res) => {
    res.sendFile("login.html", { root: "public/views/student" });
});
export default studentLoginRoute;
