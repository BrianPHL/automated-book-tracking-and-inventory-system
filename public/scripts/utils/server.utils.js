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
export const validateCookies = async (cookies) => {
    if (!cookies || cookies === undefined) {
        return false;
    }
    let results = [];
    for await (let cookie of cookies) {
        results.push(uuidValidate(cookie));
    }
    for await (let result of results) {
        if (result === false) {
            return false;
        }
    }
    return true;
};
