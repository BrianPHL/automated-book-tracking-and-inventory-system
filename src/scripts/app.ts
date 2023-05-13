// ? Dependencies
import express from "express";
import { Pool, createPool } from "mysql2";
import { createServer } from "http";
import { Server } from "socket.io";
import { EventEmitter } from "events";
import dotenv from "dotenv";

// ? Express Router Routes
import loginRoute from "./routes/login.js";
import studentRoute from "./routes/student.js";
import staffRoute from "./routes/staff.js"
import errorRoute from "./routes/error.js";
import logoutRoute from "./routes/logout.js";
import dbRoute from "./routes/db.js";

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const pool: Pool = createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME
})
const eventEmitter = new EventEmitter()

eventEmitter.setMaxListeners(0)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/static", express.static("public"))
app.use("/node_modules", express.static("node_modules"))

app.use("/", loginRoute)
app.use("/student", studentRoute)
app.use("/staff", staffRoute)
app.use("/error", errorRoute)
app.use("/logout", logoutRoute)
app.use("/db", dbRoute)

httpServer.listen(process.env.EXPRESS_PORT)

export { io, pool }