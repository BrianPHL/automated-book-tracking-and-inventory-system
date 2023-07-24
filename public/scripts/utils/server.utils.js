import { pool } from "../app.js";
// TODO: export function status: partial, could be improved.
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
// * export function status: complete
export const isQueryError = async (result) => {
    return result && result.constructor && result.constructor.name === "QueryError";
};
// * export function status: complete
export const errorPrompt = async (data) => {
    const params = new URLSearchParams();
    for (let [key, value] of Object.entries(data)) {
        params.append(key, value);
    }
    return params;
};
// TODO: export function status: partial, could be improved. (Let the controller handle the response. Only return the string; It might be feasible to merge this with errorPromptURL())
export const errorPromptRedirect = async (res, data) => {
    const params = await errorPrompt(data);
    res.redirect(`/error?${params.toString()}`);
};
// * export function status: complete
export const errorPromptURL = async (res, data) => {
    const params = await errorPrompt(data);
    return params.toString();
};
// TODO: export function status: partial, could be improved.
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
// * export function status: complete
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
// * export function status: complete
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
export const isQueryResultEmpty = async (queryResult) => {
    return !(Array.isArray(queryResult) && queryResult.length > 0);
};
