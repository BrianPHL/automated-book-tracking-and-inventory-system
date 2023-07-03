import express from "express";
import dotenv from "dotenv";
import { createPool } from "mysql2";
import { createServer } from "http";
import personnelLoginRoute from "./routes/personnel/login.personnel.route.js";
import personnelDashboardRoute from "./routes/personnel/dashboard.personnel.route.js";
import personnelInventoryRoute from "./routes/personnel/inventory.personnel.route.js";
import personnelStudentsRoute from "./routes/personnel/students.personnel.route.js";
import personnelUsersRoute from "./routes/personnel/users.personnel.route.js";
import studentLoginRoute from "./routes/student/login.student.route.js";
import studentDashboardRoute from "./routes/student/dashboard.student.route.js";
dotenv.config();
export const pool = createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME
});
const app = express();
const httpServer = createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static("public"));
app.use("/node_modules", express.static("node_modules"));
app.use("/", personnelLoginRoute);
app.use("/personnel/dashboard", personnelDashboardRoute);
app.use("/personnel/inventory", personnelInventoryRoute);
app.use("/personnel/students", personnelStudentsRoute);
app.use("/personnel/users", personnelUsersRoute);
app.use("/student", studentLoginRoute);
app.use("/student/dashboard", studentDashboardRoute);
httpServer.listen(3000); // ? Temporarily set to 3000 as dev port.
