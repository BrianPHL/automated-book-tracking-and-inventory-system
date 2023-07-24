import * as utils from "../utils/server.utils.js";
import { v4 as uuidv4 } from "uuid";
// * export function status: complete
export const personnelLogin = async (req, res) => {
    try {
        const memoryCookie = req.cookies['pMemory'];
        const isTokenValid = await utils.validateAccessToken({
            table: 'personnel',
            token: memoryCookie
        });
        !isTokenValid
            ? res.sendFile("login.html", { root: "public/views/personnel" })
            : res.redirect("/personnel/dashboard");
    }
    catch (err) {
        await utils.errorPromptRedirect(res, {
            status: 500,
            title: 'Internal Server Error',
            body: err.message
        });
    }
};
// TODO: export function status: partial, could be improved.
export const personnelLoginAuth = async (req, res) => {
    try {
        const { username, password } = req.body;
        await utils.executeDatabaseQuery("SELECT * FROM personnel WHERE username = ? AND password = ?", [username, password], async (result) => {
            if (await utils.isQueryError(result)) {
                console.error(result);
                res.sendStatus(500);
            }
            if (await utils.isQueryResultEmpty(result)) {
                const uuidToken = uuidv4();
                const isTokenAdded = await utils.addAccessToken({
                    table: 'personnel',
                    column: 'username',
                    token: uuidToken,
                    identifier: username,
                    password: password
                });
                isTokenAdded
                    ? (res
                        .cookie("pMemory", uuidToken, {
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                        sameSite: "strict",
                        httpOnly: true,
                        secure: true
                    })
                        .cookie("pAccess", uuidToken, {
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                        sameSite: "strict",
                        httpOnly: true,
                        secure: true
                    })
                        .cookie("pData", uuidToken, {
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                        sameSite: "strict",
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
        console.error(err);
        res.sendStatus(500);
    }
};
// * export function status: complete
export const personnelDashboard = async (req, res) => {
    try {
        const accessCookie = req.cookies['pAccess'];
        const isTokenValid = await utils.validateAccessToken({
            table: 'personnel',
            token: accessCookie
        });
        !isTokenValid
            ? utils.errorPromptRedirect(res, {
                status: 401,
                title: "Unauthorized",
                body: "You are not authorized to enter this webpage!"
            })
            : res.sendFile("dashboard.html", { root: "public/views/personnel" });
    }
    catch (err) {
        await utils.errorPromptRedirect(res, {
            status: 500,
            title: 'Internal Server Error',
            body: err.message
        });
    }
};
// * export function status: complete
export const personnelInventory = async (req, res) => {
    try {
        const accessCookie = req.cookies['pAccess'];
        const isTokenValid = await utils.validateAccessToken({
            table: 'personnel',
            token: accessCookie
        });
        !isTokenValid
            ? utils.errorPromptRedirect(res, {
                status: 401,
                title: "Unauthorized",
                body: "You are not authorized to enter this webpage!"
            })
            : res.sendFile("inventory.html", { root: "public/views/personnel" });
    }
    catch (err) {
        await utils.errorPromptRedirect(res, {
            status: 500,
            title: 'Internal Server Error',
            body: err.message
        });
    }
};
// * export function status: complete
export const personnelStudents = async (req, res) => {
    try {
        const accessCookie = req.cookies['pAccess'];
        const isTokenValid = await utils.validateAccessToken({
            table: 'personnel',
            token: accessCookie
        });
        !isTokenValid
            ? utils.errorPromptRedirect(res, {
                status: 401,
                title: "Unauthorized",
                body: "You are not authorized to enter this webpage!"
            })
            : res.sendFile("students.html", { root: "public/views/personnel" });
    }
    catch (err) {
        await utils.errorPromptRedirect(res, {
            status: 500,
            title: 'Internal Server Error',
            body: err.message
        });
    }
};
// * export function status: complete
export const personnelUsers = async (req, res) => {
    try {
        const accessCookie = req.cookies['pAccess'];
        const isTokenValid = await utils.validateAccessToken({
            table: 'personnel',
            token: accessCookie
        });
        !isTokenValid
            ? utils.errorPromptRedirect(res, {
                status: 401,
                title: "Unauthorized",
                body: "You are not authorized to enter this webpage!"
            })
            : res.sendFile("users.html", { root: "public/views/personnel" });
    }
    catch (err) {
        await utils.errorPromptRedirect(res, {
            status: 500,
            title: 'Internal Server Error',
            body: err.message
        });
    }
};
// * export function status: complete
export const personnelLogout = async (req, res) => {
    try {
        const dataCookie = req.cookies['pData'];
        const isTokenRemoved = await utils.removeAccessToken({
            table: 'personnel',
            token: dataCookie
        });
        !isTokenRemoved
            ? await utils.errorPromptURL(res, {
                status: 500,
                title: 'Internal Server Error',
                body: 'The server was unable to handle your request'
            })
            : res.clearCookie('pMemory').clearCookie('pAccess').clearCookie('pData').sendStatus(200);
    }
    catch (err) {
        await utils.errorPromptURL(res, {
            status: 500,
            title: 'Internal Server Error',
            body: err.message
        });
    }
};
// TODO: export function status: partial, could be improved.
export const error = async (req, res) => {
    res.sendFile("error.html", { root: "public/views" });
};
