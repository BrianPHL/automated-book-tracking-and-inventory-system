import express from "express";
import { performDatabaseOperation } from "../controllers/db.js";
import { DateTime } from "luxon";
const dbRoute = express.Router();
// TODO: Simplify everything. Only leave to 2 to 3 handlers. Let the request header contain the needed request for better efficiency.
dbRoute.post('/books/due/compute', async (req, res) => {
    const getDaysBetween = (startDate, endDate) => {
        const dayMilliseconds = 24 * 60 * 60 * 1000;
        const timeDifference = (endDate.getTime() - startDate.getTime());
        return (timeDifference / dayMilliseconds);
    };
    const updateBorrowedDate = async () => {
        const queryString = "SELECT * FROM books WHERE status = ? OR status = ?";
        const queryArgs = ['borrowed', 'due'];
        performDatabaseOperation(queryString, queryArgs, (result) => {
            if (Array.isArray(result) && result.constructor.name !== "QueryError") {
                for (let i = 0; i < result.length; i++) {
                    const timeNow = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
                    const queryString = "UPDATE books SET date_borrowed = ? WHERE id = ?";
                    const queryArgs = [timeNow, result[i].id];
                    performDatabaseOperation(queryString, queryArgs);
                }
            }
        });
    };
    await updateBorrowedDate();
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
dbRoute.post('/books/mark-as-returned', async (req, res) => {
    const queryString = "UPDATE books SET status = ?, date_borrowed = ?, date_due = ?, duration_due = ?, duration_borrowed = ? WHERE title = ?";
    const queryArgs = ['available', null, null, null, null, req.body.title];
    try {
        setTimeout(() => {
            performDatabaseOperation(queryString, queryArgs);
        }, 1000);
    }
    catch (err) {
        res.send(err);
    }
    finally {
        res.send(200);
    }
});
dbRoute.post('/students/studentNumber/validate', (req, res) => {
    const { studentNumber } = req.body;
    const queryString = "SELECT first_name, last_name FROM students WHERE number = ?";
    const queryArgs = [studentNumber];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        if (Array.isArray(result) && result.length > 0 && result.constructor.name != 'QueryError') {
            console.log(result.length);
            const concatenatedName = `${result[0].first_name} ${result[0].last_name}`;
            res.json({ ok: true, name: concatenatedName });
        }
        else {
            res.json({ ok: false, error: 'Invalid student number passed!' });
        }
    });
});
dbRoute.post('/books/lend', async (req, res) => {
    const { lendedBook, studentName, studentNumber, dateDue } = req.body;
    const dateBorrowed = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
    const queryString = `UPDATE books SET borrower = ?, borrower_number = ?, date_borrowed = ?, date_due = ?, status = ? WHERE title = ?`;
    const queryArgs = [studentName, studentNumber, dateBorrowed, dateDue, 'borrowed', lendedBook];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result);
    });
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
