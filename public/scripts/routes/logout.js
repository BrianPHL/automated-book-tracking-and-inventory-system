import express from "express";
const logoutRoute = express.Router();
logoutRoute.get("/", (req, res) => {
    console.log('Logout?');
    res.redirect("/");
});
export default logoutRoute;
