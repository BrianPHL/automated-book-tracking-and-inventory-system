import * as utils from "../utils/server.utils.js";
import { v4 as uuidv4 } from "uuid";
export const personnelLogin = async (req, res) => {
    const memoryCookie = req.cookies['memory'];
    await utils.validateCookies([memoryCookie])
        ? res.redirect("/personnel/dashboard")
        : res.sendFile("login.html", { root: "public/views/personnel" });
};
export const personnelLoginAuth = async (req, res) => {
    const { username, password } = req.body;
    const queryString = "SELECT * FROM personnel WHERE username = ? AND password = ?";
    const queryArgs = [username, password];
    await utils.executeDatabaseQuery(queryString, queryArgs, async (result) => {
        if (await utils.isQueryError(result)) {
            res.sendStatus(500);
        }
        try {
            if (Array.isArray(result) && result.length > 0) {
                // TODO: Create two separate "Access" cookies for "student" and "personnel".
                res
                    .cookie("memory", uuidv4(), {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    secure: true
                })
                    .cookie("access", uuidv4(), {
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
export const personnelDashboard = async (req, res) => {
    const accessCookie = req.cookies['access'];
    await utils.validateCookies([accessCookie])
        ? res.sendFile("dashboard.html", { root: "public/views/personnel" })
        : utils.errorPrompt(res, {
            status: 401,
            title: "Unauthorized",
            body: "You are not authorized to enter this webpage!"
        });
};
export const personnelInventory = async (req, res) => {
    const accessCookie = req.cookies['access'];
    await utils.validateCookies([accessCookie])
        ? res.sendFile("inventory.html", { root: "public/views/personnel" })
        : utils.errorPrompt(res, {
            status: 401,
            title: "Unauthorized",
            body: "You are not authorized to enter this webpage!"
        });
};
export const personnelStudents = async (req, res) => {
    const accessCookie = req.cookies['access'];
    await utils.validateCookies([accessCookie])
        ? res.sendFile("students.html", { root: "public/views/personnel" })
        : utils.errorPrompt(res, {
            status: 401,
            title: "Unauthorized",
            body: "You are not authorized to enter this webpage!"
        });
};
export const personnelUsers = async (req, res) => {
    const accessCookie = req.cookies['access'];
    await utils.validateCookies([accessCookie])
        ? res.sendFile("users.html", { root: "public/views/personnel" })
        : utils.errorPrompt(res, {
            status: 401,
            title: "Unauthorized",
            body: "You are not authorized to enter this webpage!"
        });
};
export const personnelLogout = async (req, res) => {
    res
        .clearCookie('memory')
        .clearCookie('access')
        .sendStatus(200);
};
export const error = async (req, res) => {
    res.sendFile("error.html", { root: "public/views" });
};
