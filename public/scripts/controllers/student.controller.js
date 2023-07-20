import * as utils from "../utils/server.utils.js";
import { v4 as uuidv4 } from "uuid";
export const studentLogin = async (req, res) => {
    const memoryCookie = req.cookies['sMemory'];
    await utils.validateToken('students', memoryCookie)
        ? res.redirect("/student/dashboard")
        : res.sendFile("login.html", { root: "public/views/student" });
};
export const studentLoginAuth = async (req, res) => {
    const { studentOrPhoneNum, password } = req.body;
    const queryArgs = [studentOrPhoneNum.toString(), password.toString()];
    let queryString;
    studentOrPhoneNum[0] === 'R'
        ? queryString = "SELECT * FROM students WHERE student_number = ? AND password = ?"
        : queryString = "SELECT * FROM students WHERE phone_number = ? AND password = ?";
    await utils.executeDatabaseQuery(queryString, queryArgs, async (result) => {
        if (await utils.isQueryError(result)) {
            res.sendStatus(500);
        }
        try {
            if (Array.isArray(result) && result.length > 0) {
                res
                    .cookie("sMemory", uuidv4(), {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    secure: true
                })
                    .cookie("sAccess", uuidv4(), {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    secure: true
                })
                    .sendStatus(200);
            }
            else {
                res.sendStatus(403);
            }
        }
        catch (err) {
            throw err;
        }
    });
};
export const studentDashboard = async (req, res) => {
    const accessCookie = req.cookies['sAccess'];
    await utils.validateToken('students', accessCookie)
        ? res.sendFile("dashboard.html", { root: "public/views/student" })
        : utils.errorPrompt(res, {
            status: 401,
            title: "Unauthorized",
            body: "You are not authorized to enter this webpage!"
        });
};
export const studentLogout = async (req, res) => {
    res
        .clearCookie('sMemory')
        .clearCookie('sAccess')
        .sendStatus(200);
};
