import * as utils from "../utils/server.utils.js";
import { v4 as uuidv4 } from "uuid";
export const personnelLogin = async (req, res) => {
    const memoryCookie = req.cookies['pMemory'];
    await utils.validateToken('personnel', memoryCookie)
        ? res.redirect("/personnel/dashboard")
        : res.sendFile("login.html", { root: "public/views/personnel" });
};
export const personnelLoginAuth = async (req, res) => {
    const { username, password } = req.body;
    try {
        await utils.executeDatabaseQuery("SELECT * FROM personnel WHERE username = ? AND password = ?", [username, password], async (result) => {
            if (await utils.isQueryError(result)) {
                console.log(result);
                res.sendStatus(500);
            }
            if (Array.isArray(result) && result.length > 0) {
                const uuidToken = uuidv4();
                const isTokenAdded = await utils.addAccessToken({
                    table: 'personnel',
                    token: uuidToken,
                    username: username,
                    password: password
                });
                isTokenAdded
                    ? (res
                        .cookie("pMemory", uuidToken, {
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        secure: true
                    })
                        .cookie("pAccess", uuidToken, {
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        secure: true
                    })
                        .cookie("pData", uuidToken, {
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        secure: true
                    })
                        .sendStatus(200))
                    : res.sendStatus(500);
            }
            else {
                res.sendStatus(403);
            }
        });
    }
    catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
};
export const personnelDashboard = async (req, res) => {
    const accessCookie = req.cookies['pAccess'];
    await utils.validateToken('personnel', accessCookie)
        ? res.sendFile("dashboard.html", { root: "public/views/personnel" })
        : utils.errorPrompt(res, {
            status: 401,
            title: "Unauthorized",
            body: "You are not authorized to enter this webpage!"
        });
};
export const personnelInventory = async (req, res) => {
    const accessCookie = req.cookies['pAccess'];
    await utils.validateToken('personnel', accessCookie)
        ? res.sendFile("inventory.html", { root: "public/views/personnel" })
        : utils.errorPrompt(res, {
            status: 401,
            title: "Unauthorized",
            body: "You are not authorized to enter this webpage!"
        });
};
export const personnelStudents = async (req, res) => {
    const accessCookie = req.cookies['pAccess'];
    await utils.validateToken('personnel', accessCookie)
        ? res.sendFile("students.html", { root: "public/views/personnel" })
        : utils.errorPrompt(res, {
            status: 401,
            title: "Unauthorized",
            body: "You are not authorized to enter this webpage!"
        });
};
export const personnelUsers = async (req, res) => {
    const accessCookie = req.cookies['pAccess'];
    await utils.validateToken('personnel', accessCookie)
        ? res.sendFile("users.html", { root: "public/views/personnel" })
        : utils.errorPrompt(res, {
            status: 401,
            title: "Unauthorized",
            body: "You are not authorized to enter this webpage!"
        });
};
export const personnelLogout = async (req, res) => {
    const dataCookie = req.cookies['pData'];
    const isTokenRemoved = await utils.removeAccessToken({
        table: 'personnel',
        token: dataCookie
    });
    isTokenRemoved
        ? (res
            .clearCookie('pMemory')
            .clearCookie('pAccess')
            .clearCookie('pData')
            .sendStatus(200))
        : res.sendStatus(500);
};
export const error = async (req, res) => {
    res.sendFile("error.html", { root: "public/views" });
};
