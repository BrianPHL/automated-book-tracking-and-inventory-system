import express from "express";
import { Request, Response } from "express";
import { performDatabaseOperation } from "../controllers/db.js";

const dbRoute = express.Router()

dbRoute.get('/books/available/count', (req: Request, res: Response):void => {

    const queryString = "SELECT COUNT(*) as count FROM books WHERE status = ?"
    const queryArgs = [ 'available' ]

    performDatabaseOperation(queryString, queryArgs, (result) => { 
        res.json(result[0].count)
    })

})

dbRoute.get('/books/available/data', (req: Request, res: Response):void => {

    const queryString = "SELECT * FROM books WHERE status = ?"
    const queryArgs = [ 'available' ]

    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result)
    })

})

dbRoute.get('/books/borrowed/count', (req: Request, res: Response):void => {

    const queryString = "SELECT COUNT(*) as count FROM books WHERE status = ?"
    const queryArgs = [ 'borrowed' ]

    performDatabaseOperation(queryString, queryArgs, (result) => { 
        res.json(result[0].count)
    })

})

dbRoute.get('/books/borrowed/data', (req: Request, res: Response):void => {

    const queryString = "SELECT * FROM books WHERE status = ?"
    const queryArgs = [ 'borrowed' ]

    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result)
    })

})

dbRoute.get('/books/due/count', (req: Request, res: Response):void => {

    const queryString = "SELECT COUNT(*) as count FROM books WHERE status = ?"
    const queryArgs = [ 'due' ]

    performDatabaseOperation(queryString, queryArgs, (result) => { 
        res.json(result[0].count)
    })

})

dbRoute.get('/students/registered/count', (req: Request, res: Response):void => {

    const queryString = "SELECT COUNT(*) as count FROM students"
    const queryArgs = [ null ]

    performDatabaseOperation(queryString, queryArgs, (result) => { 
        res.json(result[0].count)
    })

})

export default dbRoute