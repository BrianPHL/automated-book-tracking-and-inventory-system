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
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
    }
};
export const personnelLoginAuth = async (req, res) => {
    try {
        const { username, password } = req.body;
        const queryString = "SELECT * FROM personnel WHERE username = ? AND password = ?";
        const result = await utils.executeDatabaseQuery(queryString, [username, password]);
        if (!utils.isQueryResultEmpty(result)) {
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
            const title = 'Incorrect username or password!';
            const body = 'Make sure that everything is typed correctly.';
            res.status(403).json({ title: title, body: body });
        }
    }
    catch (err) {
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
    }
};
export const personnelTableOverview = async (req, res) => {
    const type = "personnel";
    const tab = req.params.tab;
    try {
        setTimeout(async () => res.json(await utils.fetchOverviewData(type, tab)), 250);
    }
    catch (err) {
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
    }
};
export const personnelTableData = async (req, res) => {
    const type = "personnel";
    const tab = req.params.tab;
    try {
        setTimeout(async () => res.json(await utils.fetchTableEntries(type, tab)), 500);
    }
    catch (err) {
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
    }
};
export const personnelTableSearch = async (req, res) => {
    const type = 'personnel';
    const tab = req.params.tab;
    const query = req.params.query || null;
    try {
        setTimeout(async () => res.json(await utils.fetchTableEntries(type, tab, query)), 500);
    }
    catch (err) {
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
    }
};
export const personnelTableFetch = async (req, res) => {
    const fetchType = "personnel";
    const fetchTab = req.params.tab;
    const fetchQuery = req.params.query || null;
    try {
        setTimeout(async () => res.json(await utils.fetchTableData(fetchType, fetchTab, fetchQuery)), 2500);
    }
    catch (err) {
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
    }
};
export const personnelTableRegister = async (req, res) => {
    try {
        const type = req.params.tab;
        const data = req.body;
        const inventory = async () => {
            return new Promise(resolve => {
                const title = data['title'];
                const author = data['author'];
                const genre = data['genre'];
                const publicationDate = DateTime.fromFormat(data['dPublicized'], 'yyyy-MM-dd').toFormat('dd MMMM yyyy');
                const acquisitionDate = DateTime.now().toFormat("dd MMMM yyyy");
                utils.executeDatabaseQuery(`
                    INSERT INTO
                        books
                        (title, author, genre, date_publicized, date_added)
                    VALUES
                        (?, ?, ?, ?, ?) 
                    `, [title, author, genre, publicationDate, acquisitionDate]);
                resolve();
            });
        };
        const students = async () => {
            return new Promise(resolve => {
                const name = data['studentName'].split(' ');
                const number = data['studentNumber'];
                const phone = data['phoneNumber'];
                const email = data['email'];
                let firstName;
                let lastName;
                (name.length > 2)
                    ? (firstName = `${name[0]} ${name[1]}`, lastName = name[2])
                    : (firstName = name[0], lastName = name[1]);
                utils.executeDatabaseQuery(`
                    INSERT INTO
                        students
                        (student_number, phone_number, email, first_name, last_name)
                    VALUES
                        (?, ?, ?, ?, ?)
                    `, [number, phone, email, firstName, lastName]);
                resolve();
            });
        };
        const users = async () => {
            return new Promise(resolve => {
                const name = data['personnelName'].split(' ');
                const username = data['username'];
                const role = data['role'];
                let firstName;
                let lastName;
                (name.length > 2)
                    ? (firstName = `${name[0]} ${name[1]}`, lastName = name[2])
                    : (firstName = name[0], lastName = name[1]);
                utils.executeDatabaseQuery(`
                    INSERT INTO
                        personnel
                        (first_name, last_name, username, role)
                    VALUES
                        (?, ?, ?, ?)
                    `, [firstName, lastName, username, role]);
                resolve();
            });
        };
        switch (type) {
            case 'inventory':
                await inventory();
                break;
            case 'students':
                await students();
                break;
            case 'users':
                await users();
                break;
        }
        setTimeout(() => res.sendStatus(200), 2500);
    }
    catch (err) {
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
    }
};
export const personnelTableEdit = async (req, res) => {
    try {
        const type = req.params.tab;
        const data = req.body;
        const inventory = async () => {
            return new Promise(async (resolve) => {
                const id = data['id'];
                const title = data['title'];
                const author = data['author'];
                const genre = data['genre'];
                const publicationDate = DateTime.fromFormat(data['dPublicized'], 'yyyy-MM-dd').toFormat('dd MMMM yyyy');
                await utils.executeDatabaseQuery(`
                    UPDATE
                        books
                    SET
                        title = ?, author = ?, genre = ?, date_publicized = ?
                    WHERE
                        id = ?
                `, [title, author, genre, publicationDate, id]);
                resolve();
            });
        };
        const students = async () => {
            return new Promise(async (resolve) => {
                const id = data['id'];
                const name = data['studentName'].split(' ');
                const number = data['studentNumber'];
                const phone = data['phoneNumber'];
                const email = data['email'];
                let firstName;
                let lastName;
                (name.length > 2)
                    ? (firstName = `${name[0]} ${name[1]}`, lastName = name[2])
                    : (firstName = name[0], lastName = name[1]);
                await utils.executeDatabaseQuery(`
                    UPDATE
                        students
                    SET
                        first_name = ?, last_name = ?, student_number = ?, phone_number = ?, email = ?
                    WHERE
                        id = ?
                `, [firstName, lastName, number, phone, email, id]);
                resolve();
            });
        };
        const users = async () => {
            return new Promise(async (resolve) => {
                const id = data['id'];
                const name = data['personnelName'].split(' ');
                const username = data['username'];
                const role = data['role'];
                let firstName;
                let lastName;
                (name.length > 2)
                    ? (firstName = `${name[0]} ${name[1]}`, lastName = name[2])
                    : (firstName = name[0], lastName = name[1]);
                await utils.executeDatabaseQuery(`
                    UPDATE
                        personnel
                    SET
                        first_name = ?, last_name = ?, username = ?, role = ?
                    WHERE
                        id = ?
                `, [firstName, lastName, username, role, id]);
                resolve();
            });
        };
        switch (type) {
            case 'inventory':
                await inventory();
                break;
            case 'students':
                await students();
                break;
            case 'users':
                await users();
                break;
        }
        setTimeout(() => res.sendStatus(200), 2500);
    }
    catch (err) {
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
    }
};
export const personnelTableLend = async (req, res) => {
    try {
        const type = req.params.tab;
        const { entryId, modalId, dueDate } = req.body;
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
                    borrowed: DateTime.now().toFormat("dd MMM yyyy HH:mm"),
                    due: `${DateTime.fromISO(dueDate).toFormat("dd MMM yyyy")} ${DateTime.now().toFormat('HH:mm')}`
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
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
    }
};
export const personnelTableDelete = async (req, res) => {
    try {
        let table;
        const id = req.params.id;
        switch (req.params.tab) {
            case 'inventory':
                table = 'books';
                break;
            case 'students':
                table = 'students';
                break;
            case 'users':
                table = 'personnel';
                break;
        }
        await utils.executeDatabaseQuery(`DELETE FROM ${table} WHERE id = ?`, [id]);
        setTimeout(async () => res.sendStatus(200), 2500);
    }
    catch (err) {
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
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
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ title: name, status: 500, body: message });
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
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ error: { name: name, message: message } });
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
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ error: { name: name, message: message } });
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
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ error: { name: name, message: message } });
    }
};
export const personnelAccountData = async (req, res) => {
    try {
        const token = req.cookies['pData'];
        const response = await utils.executeDatabaseQuery(`
                SELECT
                    first_name, role
                FROM
                    personnel
                WHERE
                    access_token = ?
            `, [token]);
        const data = {
            firstName: response[0]['first_name'],
            role: response[0]['role']
        };
        res.json(data);
    }
    catch (err) {
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ error: { name: name, message: message } });
    }
};
export const personnelAccountLogout = async (req, res) => {
    try {
        const token = req.cookies['pData'];
        await utils.modifyAccessToken('remove', {
            table: 'personnel',
            token: token
        });
        res.clearCookie('pMemory').clearCookie('pAccess').clearCookie('pData');
        setTimeout(() => res.sendStatus(200), 2500);
    }
    catch (err) {
        const { name, message } = err;
        console.error(name, message);
        res.status(500).json({ error: { name: name, message: message } });
    }
};
export const error = async (_, res) => {
    res.sendFile("error.html", { root: "public/views" });
};
