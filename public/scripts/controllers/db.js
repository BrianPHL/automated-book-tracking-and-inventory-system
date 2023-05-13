import { pool } from "../app.js";
const performDatabaseOperation = (query, argument, callback) => {
    // console.log(query, argument)
    pool.query(query, argument, (error, results) => {
        if (callback) {
            if (error) {
                callback(error);
            }
            callback(results);
        }
    });
};
export { performDatabaseOperation };
