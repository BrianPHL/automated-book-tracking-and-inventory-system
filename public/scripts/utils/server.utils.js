import { pool } from "../app.js";
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
export const retrieveTableData = async (type, tab) => {
    let result = {};
    const retrieveDashboardData = async () => {
        try {
            const queryResult = await executeDatabaseQuery(`
                SELECT 
                    title, status, borrower, borrower_number, 
                    date_borrowed, date_due, date_publicized, 
                    date_added
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
    const retrieveInventoryData = async () => {
        try {
            const queryResult = await executeDatabaseQuery(`
                SELECT
                    title, status, author, genre, 
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
    const retrieveStudentsData = async () => {
        try {
            const queryResult = await executeDatabaseQuery(`
                SELECT
                    first_name, last_name, student_number, 
                    status, borrowed_book, phone_number, email
                FROM
                    students
                `);
            Object.assign(result, queryResult);
        }
        catch (err) {
            console.error(err.name, err.message);
            throw err;
        }
    };
    const retrieveUsersData = async () => {
        try {
            const queryResult = await executeDatabaseQuery(`
                SELECT
                    first_name, last_name, username, role
                FROM
                    personnel
                `);
            Object.assign(result, queryResult);
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
                    title, status, author, genre, 
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
export const isQueryResultEmpty = async (queryResult) => {
    return !(Array.isArray(queryResult) && queryResult.length > 0);
};
