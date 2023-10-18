import * as utils from "../utils/server.utils.js";
import { v4 as uuidv4 } from "uuid";
export const studentLogin = async (req, res) => {
    try {
        const memoryCookie = req.cookies['sMemory'];
        const isTokenValid = await utils.validateAccessToken({
            table: 'students',
            token: memoryCookie
        });
        !isTokenValid
            ? res.sendFile("login.html", { root: "public/views/student" })
            : res.redirect("/student/dashboard");
    }
    catch (err) {
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
    }
};
export const studentLoginAuth = async (req, res) => {
    try {
        const { studentOrPhoneNum, password } = req.body;
        const queryString = studentOrPhoneNum[0] === 'R'
            ? "SELECT * FROM students WHERE student_number = ? AND password = ?"
            : "SELECT * FROM students WHERE phone_number = ? AND password = ?";
        const result = await utils.executeDatabaseQuery(queryString, [studentOrPhoneNum, password]);
        const uuidToken = uuidv4();
        if (!utils.isQueryResultEmpty(result)) {
            await utils.modifyAccessToken('add', {
                table: 'students',
                column: studentOrPhoneNum[0] === 'R' ? 'student_number' : 'phone_number',
                token: uuidToken,
                identifier: studentOrPhoneNum,
                password: password
            });
            res
                .cookie("sMemory", uuidToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: "strict",
                httpOnly: true,
                secure: true
            })
                .cookie("sAccess", uuidToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: "strict",
                httpOnly: true,
                secure: true
            })
                .cookie("sData", uuidToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: "strict",
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
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
    }
};
export const studentDashboard = async (req, res) => {
    try {
        const accessCookie = req.cookies['sAccess'];
        const isTokenValid = await utils.validateAccessToken({
            table: 'students',
            token: accessCookie
        });
        !isTokenValid
            ? await utils.errorPrompt(res, 'redirect', {
                status: 401,
                title: 'Unauthorized',
                body: 'You are not authorized to enter this webpage!'
            })
            : res.sendFile("dashboard.html", { root: "public/views/student" });
    }
    catch (err) {
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
    }
};
export const studentLogout = async (req, res) => {
    try {
        const dataCookie = req.cookies['sData'];
        await utils.modifyAccessToken('remove', {
            table: 'students',
            token: dataCookie
        });
        res
            .clearCookie('sMemory')
            .clearCookie('sAccess')
            .clearCookie('sData')
            .sendStatus(200);
    }
    catch (err) {
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
    }
};
