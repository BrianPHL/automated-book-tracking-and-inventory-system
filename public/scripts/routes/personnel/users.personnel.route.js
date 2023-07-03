import express from "express";
const personnelUsersRoute = express.Router();
personnelUsersRoute.use("/", (req, res) => {
    res.sendFile("users.html", { root: "public/views/personnel" });
});
export default personnelUsersRoute;
