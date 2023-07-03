import express from "express";
const personnelStudentsRoute = express.Router();
personnelStudentsRoute.use("/", (req, res) => {
    res.sendFile("students.html", { root: "public/views/personnel" });
});
export default personnelStudentsRoute;
