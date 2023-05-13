import express from "express";
const errorRoute = express.Router();
errorRoute.get("/", (req, res) => {
    res.sendFile("error.html", { root: "public/views" });
});
export default errorRoute;
