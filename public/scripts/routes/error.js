import express from "express";
const errorRoute = express.Router();
errorRoute.get("/", (req, res) => {
    console.log(`Existing cookies: ${req.headers.cookie}`);
    res.sendFile("error.html", { root: "public/views" });
});
export default errorRoute;
