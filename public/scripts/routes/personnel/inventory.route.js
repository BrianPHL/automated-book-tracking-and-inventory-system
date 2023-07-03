import express from "express";
const personnelInventoryRoute = express.Router();
personnelInventoryRoute.use("/", (req, res) => {
    res.sendFile("inventory.html", { root: "public/views/personnel" });
});
export default personnelInventoryRoute;
