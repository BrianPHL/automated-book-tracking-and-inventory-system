import { pool } from "../app.js";
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
export const isQueryError = async (result) => {
    return result && result.constructor && result.constructor.name === "QueryError";
};
export const validateToken = async (table, token) => {
    try {
        const result = await executeDatabaseQuery(`SELECT access_token FROM ${table} WHERE access_token = ?`, [token]);
        if (await isQueryError(result)) {
            console.log(result);
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
export const errorPrompt = (res, data) => {
    const params = new URLSearchParams();
    for (let [key, value] of Object.entries(data)) {
        params.append(key, value);
    }
    res.redirect(`/error?${params.toString()}`);
};
export const addAccessToken = async (data) => {
    try {
        await executeDatabaseQuery("UPDATE personnel SET access_token = ? WHERE username = ? AND password = ?", [data.token, data.username, data.password]);
    }
    catch (err) {
        console.log(err);
        return false;
    }
    return true;
};
export const removeAccessToken = async (data) => {
    try {
        await executeDatabaseQuery(`UPDATE ${data.table} SET access_token = NULL WHERE access_token = ?`, [data.token]);
    }
    catch (err) {
        console.log(err);
        return false;
    }
    return true;
};
