import express from "express";
const studentRoute = express.Router();
studentRoute.get("/", (req, res) => {
    res.sendFile("student.html", { root: "public/views" });
});
export default studentRoute;
