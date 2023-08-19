import * as utils from "../utils/server.utils.js";
import { v4 as uuidv4 } from "uuid";
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
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const personnelLoginAuth = async (req, res) => {
    try {
        const { username, password } = req.body;
        const queryString = "SELECT * FROM personnel WHERE username = ? AND password = ?";
        const result = await utils.executeDatabaseQuery(queryString, [username, password]);
        if (await utils.isQueryError(result)) {
            console.error(result);
            res.sendStatus(500);
        }
        if (!await utils.isQueryResultEmpty(result)) {
            const uuidToken = uuidv4();
            const isTokenAdded = await utils.addAccessToken({
                table: 'personnel',
                column: 'username',
                token: uuidToken,
                identifier: username,
                password: password
            });
            !isTokenAdded
                ? res.sendStatus(500)
                : res
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
                    .sendStatus(200);
        }
        else {
            res.sendStatus(403);
        }
    }
    catch (err) {
        await utils.errorPromptURL(res, {
            status: 500,
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const personnelTableSearch = async (req, res) => {
    try {
        const tableData = await utils.retrieveTableData('personnel', req.params.tab, req.params.query);
        res.json(tableData);
    }
    catch (err) {
        await utils.errorPromptURL(res, {
            status: 500,
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const personnelTableActions = async (req, res) => {
    try {
        await utils.setTableData(req.params.type, req.params.tab, req.body);
        res.sendStatus(200);
    }
    catch (err) {
        await utils.errorPromptURL(res, {
            status: 500,
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
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
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const personnelDashboardData = async (req, res) => {
    try {
        const token = req.cookies['pData'];
        const result = await utils.retrieveDashboardData('personnel', 'dashboard', token);
        res.json(result);
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
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
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const personnelInventoryData = async (req, res) => {
    try {
        const token = req.cookies['pData'];
        const result = await utils.retrieveDashboardData('personnel', 'inventory', token);
        res.json(result);
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
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
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const personnelStudentsData = async (req, res) => {
    try {
        const token = req.cookies['pData'];
        const result = await utils.retrieveDashboardData('personnel', 'students', token);
        res.json(result);
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
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
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const personnelUsersData = async (req, res) => {
    try {
        const token = req.cookies['pData'];
        const result = await utils.retrieveDashboardData('personnel', 'users', token);
        res.json(result);
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
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
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const error = async (req, res) => {
    res.sendFile("error.html", { root: "public/views" });
};
