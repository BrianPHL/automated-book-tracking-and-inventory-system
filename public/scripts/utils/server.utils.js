import { pool } from "../app.js";
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
export const isQueryError = async (result) => { return result && result.constructor && result.constructor.name === "QueryError"; };
