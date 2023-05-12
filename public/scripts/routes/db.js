import express from "express";
import { performDatabaseOperation } from "../controllers/db.js";
const dbRoute = express.Router();
dbRoute.get('/availableBooks/count', (req, res) => {
    const queryString = "SELECT COUNT(*) as count FROM books WHERE status = ?";
    const queryArgs = ['available'];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result[0].count);
    });
});
dbRoute.get('/availableBooks/data', (req, res) => {
    const queryString = "SELECT * FROM books WHERE status = ?";
    const queryArgs = ['available'];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result);
    });
});
dbRoute.get('/borrowedBooks/count', (req, res) => {
    const queryString = "SELECT COUNT(*) as count FROM books WHERE status = ?";
    const queryArgs = ['borrowed'];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result[0].count);
    });
});
dbRoute.get('/borrowedBooks/data', (req, res) => {
    const queryString = "SELECT * FROM books WHERE status = ?";
    const queryArgs = ['borrowed'];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result);
    });
});
dbRoute.get('/dueBooks/count', (req, res) => {
    const queryString = "SELECT COUNT(*) as count FROM books WHERE status = ?";
    const queryArgs = ['due'];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result[0].count);
    });
});
dbRoute.get('/students/count', (req, res) => {
    const queryString = "SELECT COUNT(*) as count FROM students";
    const queryArgs = [null];
    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result[0].count);
    });
});
export default dbRoute;
