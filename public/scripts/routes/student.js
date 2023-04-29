import express from "express";
const studentRoute = express.Router();
studentRoute.get("/", (req, res) => {
    console.log(`Existing cookies: ${req.headers.cookie}`);
    res.sendFile("student.html", { root: "public/views" });
});
export default studentRoute;
