import * as utils from "../utils/server.utils.js";
import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";
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
        await utils.errorPrompt(res, 'redirect', {
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
            await utils.modifyAccessToken('add', {
                table: 'personnel',
                column: 'username',
                token: uuidToken,
                identifier: username,
                password: password
            });
            res
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
        await utils.errorPrompt(res, 'url', {
            status: 500,
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const personnelTableFetch = async (req, res) => {
    try {
        let tableData;
        !req.params.query
            ? tableData = await utils.fetchTableData('personnel', req.params.tab)
            : tableData = await utils.fetchTableData('personnel', req.params.tab, req.params.query);
        res.json(tableData);
    }
    catch (err) {
        await utils.errorPrompt(res, 'url', {
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
        await utils.errorPrompt(res, 'url', {
            status: 500,
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const personnelTableLend = async (req, res) => {
    try {
        const { type, entryId, modalId, dueDate } = req.body;
        const [studentData, bookData] = await Promise.all([
            await utils.executeDatabaseQuery('SELECT * FROM students WHERE id = ?', [type === 'students' ? entryId : modalId]),
            await utils.executeDatabaseQuery('SELECT * FROM books WHERE id = ?', [type === 'inventory' ? entryId : modalId])
        ]);
        const setStudent = async () => {
            return new Promise(async (resolve) => {
                await utils.executeDatabaseQuery(`
                    UPDATE 
                        students 
                    SET 
                        status = ?, 
                        borrowed_book = ? 
                    WHERE 
                        id = ?
                    `, ["Borrower", bookData[0]['title'], type === 'students' ? entryId : modalId]);
                resolve();
            });
        };
        const setBook = async () => {
            return new Promise(async (resolve) => {
                const borrower = {
                    name: `${studentData[0]['first_name']} ${studentData[0]['last_name']}`,
                    number: studentData[0]['student_number']
                };
                const date = {
                    borrowed: DateTime.now().toFormat("dd LLLL yyyy"),
                    due: dueDate
                };
                await utils.executeDatabaseQuery(`
                    UPDATE 
                        books 
                    SET 
                        status = ?,
                        borrower = ?, 
                        borrower_number = ?,
                        date_borrowed = ?,
                        date_due = ? 
                    WHERE 
                        id = ?
                    `, [
                    "Borrowed",
                    borrower['name'],
                    borrower['number'],
                    date['borrowed'],
                    date['due'],
                    type === 'inventory' ? entryId : modalId
                ]);
                resolve();
            });
        };
        await setStudent();
        await setBook();
        setTimeout(async () => res.sendStatus(200), 2500);
    }
    catch (err) {
        await utils.errorPrompt(res, 'redirect', {
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
            ? await utils.errorPrompt(res, 'redirect', {
                status: 401,
                title: 'Unauthorized',
                body: 'You are not authorized to enter this webpage!'
            })
            : res.sendFile("dashboard.html", { root: "public/views/personnel" });
    }
    catch (err) {
        await utils.errorPrompt(res, 'redirect', {
            status: 500,
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const personnelDashboardData = async (req, res) => {
    try {
        let resultData = {};
        const token = req.cookies['pData'];
        const [accountData, overviewData, tableData] = await Promise.all([
            utils.retrieveAccountData('personnel', token),
            utils.retrieveOverviewData('personnel', 'dashboard'),
            utils.fetchTableEntries('personnel', 'dashboard')
        ]);
        Object.assign(resultData, { accountData: accountData }, { overviewData: overviewData }, { tableData: tableData });
        res.json(resultData);
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
            ? await utils.errorPrompt(res, 'redirect', {
                status: 401,
                title: 'Unauthorized',
                body: 'You are not authorized to enter this webpage!'
            })
            : res.sendFile("inventory.html", { root: "public/views/personnel" });
    }
    catch (err) {
        await utils.errorPrompt(res, 'redirect', {
            status: 500,
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const personnelInventoryData = async (req, res) => {
    try {
        let resultData = {};
        const token = req.cookies['pData'];
        const [accountData, overviewData, tableData] = await Promise.all([
            utils.retrieveAccountData('personnel', token),
            utils.retrieveOverviewData('personnel', 'inventory'),
            utils.fetchTableEntries('personnel', 'inventory')
        ]);
        Object.assign(resultData, { accountData: accountData }, { overviewData: overviewData }, { tableData: tableData });
        res.json(resultData);
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
            ? await utils.errorPrompt(res, 'redirect', {
                status: 401,
                title: 'Unauthorized',
                body: 'You are not authorized to enter this webpage!'
            })
            : res.sendFile("students.html", { root: "public/views/personnel" });
    }
    catch (err) {
        await utils.errorPrompt(res, 'redirect', {
            status: 500,
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const personnelStudentsData = async (req, res) => {
    try {
        let resultData = {};
        const token = req.cookies['pData'];
        const [accountData, overviewData, tableData] = await Promise.all([
            utils.retrieveAccountData('personnel', token),
            utils.retrieveOverviewData('personnel', 'students'),
            utils.fetchTableEntries('personnel', 'students')
        ]);
        Object.assign(resultData, { accountData: accountData }, { overviewData: overviewData }, { tableData: tableData });
        res.json(resultData);
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
            ? await utils.errorPrompt(res, 'redirect', {
                status: 401,
                title: 'Unauthorized',
                body: 'You are not authorized to enter this webpage!'
            })
            : res.sendFile("users.html", { root: "public/views/personnel" });
    }
    catch (err) {
        await utils.errorPrompt(res, 'redirect', {
            status: 500,
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const personnelUsersData = async (req, res) => {
    try {
        let resultData = {};
        const token = req.cookies['pData'];
        const [accountData, overviewData, tableData] = await Promise.all([
            utils.retrieveAccountData('personnel', token),
            utils.retrieveOverviewData('personnel', 'users'),
            utils.fetchTableEntries('personnel', 'users')
        ]);
        Object.assign(resultData, { accountData: accountData }, { overviewData: overviewData }, { tableData: tableData });
        res.json(resultData);
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
export const personnelLogout = async (req, res) => {
    try {
        const dataCookie = req.cookies['pData'];
        await utils.modifyAccessToken('remove', {
            table: 'personnel',
            token: dataCookie
        });
        res
            .clearCookie('pMemory')
            .clearCookie('pAccess')
            .clearCookie('pData')
            .sendStatus(200);
    }
    catch (err) {
        await utils.errorPrompt(res, 'url', {
            status: 500,
            title: `Internal Server Error - ${err.name}`,
            body: err.message
        });
    }
};
export const error = async (req, res) => {
    res.sendFile("error.html", { root: "public/views" });
};
