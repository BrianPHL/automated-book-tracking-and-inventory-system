import express from "express";
const logoutRoute = express.Router();
logoutRoute.get("/", (req, res) => {
    res.redirect("/");
});
export default logoutRoute;
