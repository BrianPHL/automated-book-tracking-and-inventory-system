import express from "express";
import dotenv from "dotenv";
import { Pool, createPool } from "mysql2";
import { createServer } from "http";
import cookieParser from "cookie-parser";

import personnelLoginRoute from "./routes/personnel/login.route.js";
import personnelDashboardRoute from "./routes/personnel/dashboard.route.js";
import personnelInventoryRoute from "./routes/personnel/inventory.route.js";
import personnelStudentsRoute from "./routes/personnel/students.route.js";
import personnelUsersRoute from "./routes/personnel/users.route.js";
import personnelLogoutRoute from "./routes/personnel/logout.route.js";
import studentLoginRoute from "./routes/student/login.route.js";
import studentDashboardRoute from "./routes/student/dashboard.route.js";
import studentLogoutRoute from "./routes/student/logout.route.js";
import errorRoute from "./routes/error.routes.js";

dotenv.config()

export const pool: Pool = createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME
})

const app = express()
const httpServer = createServer(app)

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/static", express.static("public"))
app.use("/node_modules", express.static("node_modules"))

app.use("/", personnelLoginRoute)
app.use("/personnel/dashboard", personnelDashboardRoute)
app.use("/personnel/inventory", personnelInventoryRoute)
app.use("/personnel/students", personnelStudentsRoute)
app.use("/personnel/users", personnelUsersRoute)
app.use("/personnel/logout", personnelLogoutRoute)

app.use("/student", studentLoginRoute)
app.use("/student/dashboard", studentDashboardRoute)
app.use("/student/logout", studentLogoutRoute)

app.use("/error", errorRoute)

httpServer.listen(process.env.EXPRESS_PORT || 3000)