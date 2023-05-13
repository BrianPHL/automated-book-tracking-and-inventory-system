import express from "express";
import { performDatabaseOperation } from "../controllers/db.js";
const dbRoute = express.Router();
dbRoute.post('/books/due/compute', async (req, res) => {
    const getDaysBetween = (startDate, endDate) => {
        const dayMilliseconds = 24 * 60 * 60 * 1000;
        const timeDifference = (endDate.getTime() - startDate.getTime());
        return (timeDifference / dayMilliseconds);
    };
    const checkBorrowedBooks = async () => {
        const queryString = "SELECT * FROM books WHERE status = ?";
        const queryArgs = ['borrowed'];
        performDatabaseOperation(queryString, queryArgs, (result) => {
            if (Array.isArray(result) && result.constructor.name !== "QueryError") {
                for (let i = 0; i < result.length; i++) {
                    const dateBorrowed = new Date(result[i].date_borrowed);
                    const dateDue = new Date(result[i].date_due);
                    if (getDaysBetween(dateBorrowed, dateDue) < 1) {
                        const queryString = "UPDATE books SET status = ? WHERE id = ?";
                        const queryArgs = ['due', result[i].id];
                        performDatabaseOperation(queryString, queryArgs);
                    }
                }
            }
        });
    };
    await checkBorrowedBooks();
    const computeBooksDuration = async () => {
        const computeBorrowedDuration = async () => {
            const queryString = "SELECT * FROM books WHERE status = ?";
            const queryArgs = ['borrowed'];
            performDatabaseOperation(queryString, queryArgs, (result) => {
                if (Array.isArray(result) && result.constructor.name !== "QueryError") {
                    for (let i = 0; i < result.length; i++) {
                        const dateBorrowed = new Date(result[i].date_borrowed);
                        const dateDue = new Date(result[i].date_due);
                        const queryString = "UPDATE books SET duration_borrowed = ? WHERE id = ?";
                        const queryArgs = [Math.abs(getDaysBetween(dateBorrowed, dateDue)), result[i].id];
                        performDatabaseOperation(queryString, queryArgs);
                    }
                }
            });
        };
        await computeBorrowedDuration();
        const computeDueDuration = async () => {
            const queryString = "SELECT * FROM books WHERE status = ?";
            const queryArgs = ['due'];
            performDatabaseOperation(queryString, queryArgs, (result) => {
                if (Array.isArray(result) && result.constructor.name !== "QueryError") {
                    for (let i = 0; i < result.length; i++) {
                        const dateBorrowed = new Date(result[i].date_borrowed);
                        const dateDue = new Date(result[i].date_due);
                        const queryString = "UPDATE books SET duration_due = ? WHERE id = ?";
                        const queryArgs = [Math.abs(getDaysBetween(dateBorrowed, dateDue)), result[i].id];
                        performDatabaseOperation(queryString, queryArgs);
                    }
                }
            });
        };
        await computeDueDuration();
    };
    await computeBooksDuration();
    res.sendStatus(200);
});
dbRoute.get('/books/available/count', (req, res) => {
    const queryString = "SELECT COUNT(*) as count FROM books WHERE status = ?";
    const queryArgs = ['available'];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result[0].count);
    });
});
dbRoute.get('/books/available/data', (req, res) => {
    const queryString = "SELECT * FROM books WHERE status = ?";
    const queryArgs = ['available'];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result);
    });
});
dbRoute.get('/books/borrowed/count', (req, res) => {
    const queryString = "SELECT COUNT(*) as count FROM books WHERE status = ?";
    const queryArgs = ['borrowed'];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result[0].count);
    });
});
dbRoute.get('/books/borrowed/data', (req, res) => {
    const queryString = "SELECT * FROM books WHERE status = ?";
    const queryArgs = ['borrowed'];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result);
    });
});
dbRoute.get('/books/due/count', (req, res) => {
    const queryString = "SELECT COUNT(*) as count FROM books WHERE status = ?";
    const queryArgs = ['due'];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result[0].count);
    });
});
dbRoute.get('/books/due/data', (req, res) => {
    const queryString = "SELECT * FROM books WHERE status = ?";
    const queryArgs = ['due'];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result);
    });
});
dbRoute.get('/students/registered/count', (req, res) => {
    const queryString = "SELECT COUNT(*) as count FROM students";
    const queryArgs = [null];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result[0].count);
    });
});
export default dbRoute;
