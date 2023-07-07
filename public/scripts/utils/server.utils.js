import { pool } from "../app.js";
import { validate as uuidValidate } from 'uuid';
export const executeDatabaseQuery = async (query, argument, callback) => {
    pool.query(query, argument, (error, results) => {
        if (callback) {
            if (error) {
                callback(error);
            }
            callback(results);
        }
    });
};
export const isQueryError = async (result) => {
    return result && result.constructor && result.constructor.name === "QueryError";
};
export const isLoggedIn = async (cookie) => {
    return cookie && uuidValidate(cookie);
};
