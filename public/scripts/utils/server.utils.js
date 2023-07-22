import { pool } from "../app.js";
// TODO: export function status: partial, could be improved.
export const executeDatabaseQuery = async (query, argument, callback) => {
    if (!callback) {
        const [rows] = await pool.promise().query(query, argument);
        return rows;
    }
    else {
        pool.query(query, argument, (error, results) => {
            !error
                ? callback(results)
                : callback(error);
        });
    }
};
// * export function status: complete
export const isQueryError = async (result) => {
    return result && result.constructor && result.constructor.name === "QueryError";
};
// TODO: export function status: partial, could be improved.
export const validateToken = async (table, token) => {
    try {
        const result = await executeDatabaseQuery(`SELECT access_token FROM ${table} WHERE access_token = ?`, [token]);
        if (await isQueryError(result)) {
            console.error(result);
            return false;
        }
        if (Array.isArray(result) && result.length < 1) {
            return false;
        }
        return result[0].access_token === token;
    }
    catch (err) {
        console.error(err);
        return false;
    }
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
export const errorPromptURL = async (data) => {
    const params = await errorPrompt(data);
    return params.toString();
};
// * export function status: complete
export const addAccessToken = async (data) => {
    try {
        await executeDatabaseQuery(`UPDATE ${data.table} SET access_token = ? WHERE ${data.column} = ? AND password = ?`, [data.token, data.identifier, data.password]);
    }
    catch (err) {
        console.error(err);
        return false;
    }
    return true;
};
// * export function status: complete
export const removeAccessToken = async (data) => {
    try {
        await executeDatabaseQuery(`UPDATE ${data.table} SET access_token = NULL WHERE access_token = ?`, [data.token]);
    }
    catch (err) {
        console.error(err);
        return false;
    }
    return true;
};
