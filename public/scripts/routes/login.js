import express from "express";
const loginRoute = express.Router();
loginRoute.get("/", (req, res) => {
    console.log(`Existing cookies: ${req.headers.cookie}`);
    res.sendFile("login.html", { root: "public/views" });
});
export default loginRoute;
