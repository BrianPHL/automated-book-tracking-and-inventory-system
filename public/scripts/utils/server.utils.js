import { pool } from "../app.js";
import { DateTime } from "luxon";
export const executeDatabaseQuery = async (query, argument, callback) => {
    try {
        if (!callback) {
            const [rows] = await pool.promise().query(query, argument);
            return rows;
        }
        else {
            pool.query(query, argument, (results) => { callback(results); });
        }
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
export const isQueryError = async (result) => {
    return result && result.constructor && result.constructor.name === "QueryError";
};
export const errorPrompt = async (data) => {
    const params = new URLSearchParams();
    for (let [key, value] of Object.entries(data)) {
        params.append(key, value);
    }
    return params;
};
export const errorPromptRedirect = async (res, data) => {
    const params = await errorPrompt(data);
    res.redirect(`/error?${params.toString()}`);
};
export const errorPromptURL = async (res, data) => {
    const params = await errorPrompt(data);
    return params.toString();
};
export const validateAccessToken = async (data) => {
    try {
        const result = await executeDatabaseQuery(`SELECT access_token FROM ${data.table} WHERE access_token = ?`, [data.token]);
        return !await isQueryResultEmpty(result);
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
export const addAccessToken = async (data) => {
    try {
        const result = await executeDatabaseQuery(`UPDATE ${data.table} SET access_token = ? WHERE ${data.column} = ? AND password = ?`, [data.token, data.identifier, data.password]);
        return !result ? false : true;
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
export const removeAccessToken = async (data) => {
    try {
        const result = await executeDatabaseQuery(`UPDATE ${data.table} SET access_token = NULL WHERE access_token = ?`, [data.token]);
        return !result ? false : true;
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
export const retrieveDashboardData = async (type, tab, token) => {
    let resultData = {};
    try {
        const [accountData, overviewData, tableData] = await Promise.all([
            retrieveAccountData(type, token),
            retrieveOverviewData(type, tab),
            retrieveTableData(type, tab)
        ]);
        Object.assign(resultData, { accountData: accountData }, { overviewData: overviewData }, { tableData: tableData });
        return resultData;
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
export const retrieveAccountData = async (type, token) => {
    let result = {};
    try {
        result = await executeDatabaseQuery(`SELECT first_name, last_name, role FROM ${type} WHERE access_token = ?`, [token]);
        return result[0];
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
export const retrieveOverviewData = async (type, tab) => {
    let result = {};
    const retrieveDashboardData = async () => {
        try {
            const [students, books, availableBooks, unavailableBooks] = await Promise.all([
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM students'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Available"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Past Due" OR status = "Borrowed"')
            ]);
            Object.assign(result, { studentCount: students[0].count }, { bookCount: books[0].count }, { availableBookCount: availableBooks[0].count }, { availableBookCountPercentage: Math.floor(availableBooks[0].count / books[0].count * 100) }, { unavailableBookCount: unavailableBooks[0].count }, { unavailableBookCountPercentage: Math.floor(unavailableBooks[0].count / books[0].count * 100) });
        }
        catch (err) {
            console.error(err.name, err.message);
            throw err;
        }
    };
    const retrieveInventoryData = async () => {
        try {
            const [books, availableBooks, borrowedBooks, dueBooks] = await Promise.all([
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Available"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Borrowed"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Past Due"')
            ]);
            Object.assign(result, { bookCount: books[0].count }, { availableBookCount: availableBooks[0].count }, { availableBookCountPercentage: Math.floor(availableBooks[0].count / books[0].count * 100) }, { borrowedBookCount: borrowedBooks[0].count }, { borrowedBookCountPercentage: Math.floor(borrowedBooks[0].count / books[0].count * 100) }, { dueBookCount: dueBooks[0].count }, { dueBookCountPercentage: Math.floor(dueBooks[0].count / books[0].count * 100) });
        }
        catch (err) {
            console.error(err.name, err.message);
            throw err;
        }
    };
    const retrieveStudentsData = async () => {
        try {
            const [students, vacantStudents, borrowerStudents, dueStudents] = await Promise.all([
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM students'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Available"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Borrowed"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Past Due"')
            ]);
            Object.assign(result, { studentCount: students[0].count }, { vacantStudentCount: vacantStudents[0].count }, { vacantStudentCountPercentage: Math.floor(vacantStudents[0].count / students[0].count * 100) }, { borrowerStudentCount: borrowerStudents[0].count }, { borrowerStudentCountPercentage: Math.floor(borrowerStudents[0].count / students[0].count * 100) }, { dueStudentCount: dueStudents[0].count }, { dueStudentCountPercentage: Math.floor(dueStudents[0].count / students[0].count * 100) });
        }
        catch (err) {
            console.error(err.name, err.message);
            throw err;
        }
    };
    const retrieveUsersData = async () => {
        try {
            const [personnel, itPersonnel, librarianPersonnel] = await Promise.all([
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM personnel'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM personnel WHERE role = "IT"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM personnel WHERE role = "Librarian"')
            ]);
            Object.assign(result, { personnelCount: personnel[0].count }, { itPersonnelCount: itPersonnel[0].count }, { itPersonnelCountPercentage: Math.floor(itPersonnel[0].count / personnel[0].count * 100) }, { librarianPersonnelCount: librarianPersonnel[0].count }, { librarianPersonnelCountPercentage: Math.floor(librarianPersonnel[0].count / personnel[0].count * 100) });
        }
        catch (err) {
            console.error(err.name, err.message);
            throw err;
        }
    };
    const retrieveStudentData = async () => {
        try {
            const [books, availableBooks, unavailableBooks] = await Promise.all([
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "available"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "due" OR status = "borrowed"')
            ]);
            Object.assign(result, { bookCount: books[0].count }, { availableBookCount: availableBooks[0].count }, { availableBookCountPercentage: Math.floor(availableBooks[0].count / books[0].count * 100) }, { unavailableBookCount: unavailableBooks[0].count }, { unavailableBookCountPercentage: Math.floor(unavailableBooks[0].count / books[0].count * 100) });
        }
        catch (err) {
            console.error(err.name, err.message);
            throw err;
        }
    };
    try {
        if (type !== 'students') {
            switch (tab) {
                case 'dashboard':
                    await retrieveDashboardData();
                    break;
                case 'inventory':
                    await retrieveInventoryData();
                    break;
                case 'students':
                    await retrieveStudentsData();
                    break;
                case 'users':
                    await retrieveUsersData();
                    break;
                default:
                    throw `Error in switch-case; passed argument: ${tab} did not match any case.`;
            }
        }
        else {
            await retrieveStudentData();
        }
        return result;
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
export const retrieveTableData = async (type, tab, query) => {
    let result = {};
    const retrieveDashboardData = async () => {
        let entries = [];
        try {
            let queryResult = '';
            !query
                ? queryResult = await executeDatabaseQuery(`
                SELECT 
                    id, title, status, borrower, borrower_number, 
                    date_borrowed, date_due, date_publicized, 
                    date_added
                FROM 
                    books
                `)
                : queryResult = await executeDatabaseQuery(`
                SELECT 
                    id, title, status, borrower, borrower_number, 
                    date_borrowed, date_due, date_publicized, 
                    date_added
                FROM 
                    books
                WHERE
                    LOWER(title) LIKE LOWER('%${query}%') 
                    OR LOWER(status) LIKE LOWER('%${query}%')
                    OR LOWER(borrower) LIKE LOWER('%${query}%')
                    OR LOWER(borrower_number) LIKE LOWER('%${query}%')
                    OR LOWER(date_borrowed) LIKE LOWER('%${query}%')
                    OR LOWER(date_due) LIKE LOWER('%${query}%')
                    OR LOWER(date_publicized) LIKE LOWER('%${query}%')
                    OR LOWER(date_added) LIKE LOWER('%${query}%')
                `);
            Object.values(queryResult).forEach(async (data) => {
                const identifier = data['id'];
                const title = data['title'];
                const dueDate = data['date_due'] === null ? 'No data' : data['date_due'];
                const publicationDate = data['date_publicized'];
                const acquisitionDate = data['date_added'];
                let borrowerAndBorrowerNumber = ``;
                let borrowDateAndDuration = ``;
                let visibility = ``;
                let status = ``;
                data['borrower'] === null
                    ? borrowerAndBorrowerNumber = `<h2>No data</h2>`
                    : borrowerAndBorrowerNumber = `<h2>${data['borrower']}</h2><h3>${data['borrower_number']}</h3>`;
                data['date_borrowed'] === null
                    ? borrowDateAndDuration = `<h2>No data</h2>`
                    : borrowDateAndDuration = `<h2>${data['date_borrowed']}</h2><h3>${getDaysBetween(data['date_borrowed'], data['date_due'])}</h3>`;
                data['status'] === 'Available'
                    ? status = `<h2>${data['status']}</h2>`
                    : status = `<h2>Unavailable</h2><h3>${data['status']}</h3>`;
                status.includes('Past Due')
                    ? visibility = 'visible'
                    : visibility = 'hidden';
                const entry = `
                <div class="entry" data-identifier="${identifier}">
                    <i style="visibility: ${visibility};" class="warning fa-solid fa-triangle-exclamation"></i>
                    <div class="title"><h2>${title}</h2></div>
                    <div class="status">${status}</div>
                    <div class="borrower">${borrowerAndBorrowerNumber}</div>
                    <div class="borrowDate">${borrowDateAndDuration}</div>
                    <div class="dueDate"><h2>${dueDate}</h2></div>
                    <div class="publicationDate"><h2>${publicationDate}</h2></div>
                    <div class="acquisitionDate"><h2>${acquisitionDate}</h2></div>
                    <div class="actions">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </div>
                </div>
                `;
                entries.push(entry);
            });
            Object.assign(result, entries);
        }
        catch (err) {
            console.error(err.name, err.message);
            throw err;
        }
    };
    const retrieveInventoryData = async () => {
        let entries = [];
        try {
            let queryResult = '';
            !query
                ? queryResult = await executeDatabaseQuery(`
                SELECT
                    id, title, status, author, genre, 
                    date_publicized, date_added 
                FROM
                    books
                `)
                : queryResult = await executeDatabaseQuery(`
                SELECT
                    id, title, status, author, genre, 
                    date_publicized, date_added 
                FROM
                    books
                WHERE
                    LOWER(title) LIKE LOWER('%${query}%')
                    OR LOWER(status) LIKE LOWER('%${query}%')
                    OR LOWER(author) LIKE LOWER('%${query}%')
                    OR LOWER(genre) LIKE LOWER('%${query}%')
                    OR LOWER(date_publicized) LIKE LOWER('%${query}%')
                    OR LOWER(date_added) LIKE LOWER('%${query}%')
                `);
            Object.values(queryResult).forEach(async (data) => {
                const identifier = data['id'];
                const title = data['title'];
                const author = data['author'];
                const genre = data['genre'];
                const publicationDate = data['date_publicized'];
                const acquisitionDate = data['date_added'];
                let visibility = ``;
                let status = ``;
                data['status'] === 'Available'
                    ? status = `<h2>${data['status']}</h2>`
                    : status = `<h2>Unavailable</h2><h3>${data['status']}</h3>`;
                status.includes('Past Due')
                    ? visibility = 'visible'
                    : visibility = 'hidden';
                const entry = `
                <div class="entry" data-identifier="${identifier}">
                    <i style="visibility: ${visibility};" class="warning fa-solid fa-triangle-exclamation"></i>
                    <div class="title"><h2>${title}</h2></div>
                    <div class="status"><h2>${status}</h2></div>
                    <div class="author"><h2>${author}</h2></div>
                    <div class="genre"><h2>${genre}</h2></div>
                    <div class="publicationDate"><h2>${publicationDate}</h2></div>
                    <div class="acquisitionDate"><h2>${acquisitionDate}</h2></div>
                    <div class="actions">
                        <i class="fa-regular fa-arrow-right-from-arc"></i>
                        <i class="fa-regular fa-pen-to-square"></i>
                        <i class="fa-regular fa-xmark"></i>
                    </div>
                </div>
                `;
                entries.push(entry);
            });
            Object.assign(result, entries);
        }
        catch (err) {
            console.error(err.name, err.message);
            throw err;
        }
    };
    const retrieveStudentsData = async () => {
        let entries = [];
        try {
            let queryResult = '';
            !query
                ? queryResult = await executeDatabaseQuery(`
                SELECT
                    id, CONCAT(first_name, ' ', last_name) AS full_name, student_number, 
                    status, borrowed_book, phone_number, email
                FROM
                    students
                `)
                : queryResult = await executeDatabaseQuery(`
                SELECT
                    id, CONCAT(first_name, ' ', last_name) AS full_name, student_number, 
                    status, borrowed_book, phone_number, email
                FROM
                    students
                WHERE
                    LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER('%${query}%')
                    OR LOWER(student_number) LIKE LOWER('%${query}%')
                    OR LOWER(status) LIKE LOWER('%${query}%')
                    OR LOWER(borrowed_book) LIKE LOWER('%${query}%')
                    OR LOWER(phone_number) LIKE LOWER('%${query}%')
                    OR LOWER(email) LIKE LOWER('%${query}%')
                `);
            Object.values(queryResult).forEach(async (data) => {
                const identifier = data['id'];
                const studentName = data['full_name'];
                const studentNumber = data['student_number'];
                const borrowedBook = data['borrowed_book'] === null ? 'No data' : data['borrowed_book'];
                const phoneNumber = data['phone_number'];
                const emailAddress = data['email'];
                let studentStatus = ``;
                let visibility = ``;
                data['status'] === 'Vacant'
                    ? studentStatus = `<h2>${data['status']}</h2>`
                    : studentStatus = `<h2>Unavailable</h2><h3>${data['status']}</h3>`;
                studentStatus.includes('Past Due')
                    ? visibility = 'visible'
                    : visibility = 'hidden';
                const entry = `
                <div class="entry" data-identifier="${identifier}">
                    <i style="visibility: ${visibility};" class="warning fa-solid fa-triangle-exclamation"></i>
                    <div class="name"><h2>${studentName}</h2></div>
                    <div class="studentNumber"><h2>${studentNumber}</h2></div>
                    <div class="status">${studentStatus}</div>
                    <div class="borrowedBook"><h2>${borrowedBook}</h2></div>
                    <div class="phoneNumber"><h2>${phoneNumber}</h2></div>
                    <div class="emailAddress"><h2>${emailAddress}</h2></div>
                    <div class="actions">
                        <i class="fa-regular fa-message"></i>
                        <i class="fa-regular fa-pen-to-square"></i>
                        <i class="fa-regular fa-xmark"></i>
                    </div>
                </div>
                `;
                entries.push(entry);
            });
            Object.assign(result, entries);
        }
        catch (err) {
            console.error(err.name, err.message);
            throw err;
        }
    };
    const retrieveUsersData = async () => {
        let entries = [];
        try {
            let queryResult = '';
            !query
                ? queryResult = await executeDatabaseQuery(`
                SELECT
                    id, CONCAT(first_name, ' ', last_name) AS full_name, username, role
                FROM
                    personnel
                `)
                : queryResult = await executeDatabaseQuery(`
                SELECT
                    id, CONCAT(first_name, ' ', last_name) AS full_name, username, role
                FROM
                    personnel
                WHERE
                    LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER('%${query}%')
                    OR LOWER(last_name) LIKE LOWER('%${query}%')
                    OR LOWER(username) LIKE LOWER('%${query}%')
                    OR LOWER(role) LIKE LOWER('%${query}%')
                `);
            Object.values(queryResult).forEach(async (data) => {
                const identifier = data['id'];
                const fullName = data['full_name'];
                const username = data['username'];
                const role = data['role'];
                let privilege = ``;
                data['role'] === 'Librarian'
                    ? privilege = `<h3>Dashboard</h3><h3>Inventory</h3><h3>Students</h3>`
                    : privilege = `<h3>Dashboard</h3><h3>Inventory</h3><h3>Students</h3><h3>Users</h3>`;
                const entry = `
                <div class="entry" data-identifier="${identifier}">
                    <i style="visibility: hidden;" class="warning fa-solid fa-triangle-exclamation"></i>
                    <div class="fullName"><h2>${fullName}</h2></div>
                    <div class="username"><h2>${username}</h2></div>
                    <div class="role"><h2>${role}</h2></div>
                    <div class="privilege">${privilege}</div>
                    <div class="emailAddress"><h2>${username}</h2><h3>@feuroosevelt.edu.ph</h3></div>
                    <div class="actions">
                    <i class="fa-regular fa-pen-to-square"></i>
                    <i class="fa-regular fa-xmark"></i>
                    </div>
                </div>
                `;
                entries.push(entry);
            });
            Object.assign(result, entries);
        }
        catch (err) {
            console.error(err.name, err.message);
            throw err;
        }
    };
    const retrieveStudentData = async () => {
        try {
            const queryResult = await executeDatabaseQuery(`
                SELECT
                    id, title, status, author, genre, 
                    date_publicized, date_added 
                FROM
                    books
                `);
            Object.assign(result, queryResult);
        }
        catch (err) {
            console.error(err.name, err.message);
            throw err;
        }
    };
    try {
        if (type !== 'students') {
            switch (tab) {
                case 'dashboard':
                    await retrieveDashboardData();
                    break;
                case 'inventory':
                    await retrieveInventoryData();
                    break;
                case 'students':
                    await retrieveStudentsData();
                    break;
                case 'users':
                    await retrieveUsersData();
                    break;
                default:
                    throw `Error in switch-case; passed argument: ${tab} did not match any case.`;
            }
        }
        else {
            await retrieveStudentData();
        }
        return result;
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
export const setTableData = async (type, tab, data) => {
    return new Promise(async (resolve) => {
        const registerTableData = async () => {
            let sqlString = '';
            let sqlArgs = '';
            let sqlData = [];
            try {
                if (tab === 'inventory') {
                    tab = 'books';
                }
                if (tab === 'users') {
                    tab = 'personnel';
                }
                const dateFormat = "dd LLLL yyyy";
                const setVariablesData = async () => {
                    return new Promise((resolve) => {
                        if (tab === 'books') {
                            sqlString = `title, author, genre, date_publicized, date_added`;
                            sqlArgs = '?, ?, ?, ?, ?';
                            sqlData =
                                [
                                    data['title'], data['author'], data['genre'],
                                    DateTime.fromFormat(data['dPublicized'], 'yyyy-MM-dd').toFormat(dateFormat),
                                    DateTime.now().toFormat(dateFormat)
                                ];
                        }
                        else if (tab === 'students') {
                            sqlString = 'student_number, phone_number, email, status, first_name, last_name';
                            sqlArgs = '?, ?, ?, ?, ?, ?';
                            sqlData =
                                [
                                    data['studentNumber'], data['phoneNumber'], data['email'],
                                    'Vacant', data['firstName'], data['lastName']
                                ];
                        }
                        else if (tab === 'personnel') {
                            sqlString = 'first_name, last_name, username, role';
                            sqlArgs = '?, ?, ?, ?';
                            sqlData = [
                                data['firstName'], data['lastName'],
                                data['username'], data['role']
                            ];
                        }
                        resolve();
                    });
                };
                await setVariablesData();
                await executeDatabaseQuery(`INSERT INTO ${tab} (${sqlString}) VALUES (${sqlArgs})`, sqlData);
            }
            catch (err) {
                console.error(err.name, err.message);
                throw err;
            }
        };
        const editTableData = async () => {
        };
        try {
            switch (type) {
                case 'register':
                    await registerTableData();
                    break;
                case 'edit':
                    await editTableData();
                    break;
                default:
                    throw `Error in switch-case; passed argument: ${type} did not match any case.`;
            }
        }
        catch (err) {
            console.error(err.name, err.message);
            throw err;
        }
        resolve();
    });
};
export const isQueryResultEmpty = async (queryResult) => {
    return !(Array.isArray(queryResult) && queryResult.length > 0);
};
export const getDaysBetween = (firstDate, secondDate) => {
    if (!firstDate && !secondDate) {
        return;
    }
    const dateFormat = "yyyy-MM-dd HH:mm:ss";
    const fFirstDate = DateTime.fromFormat(firstDate, dateFormat);
    const fSecondDate = DateTime.fromFormat(secondDate, dateFormat);
    const dateNow = DateTime.now();
    const borrowDateDiff = Math.abs(Math.floor(fSecondDate.diff(fFirstDate).as('days')));
    const dueDateDiff = Math.abs(Math.floor(dateNow.diff(fSecondDate).as('days')));
    return fFirstDate > fSecondDate
        ? `${dueDateDiff} ${dueDateDiff === 1 ? 'day' : 'days'} past due`
        : `${borrowDateDiff} ${borrowDateDiff === 1 ? 'day' : 'days'} remaining`;
};
