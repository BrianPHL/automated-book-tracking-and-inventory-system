import express from "express";
import { Request, Response } from "express";
import { performDatabaseOperation } from "../controllers/db.js";
import { DateTime } from "luxon";

const dbRoute = express.Router()

dbRoute.post('/books/due/compute', async (req: Request, res: Response) => {


    const getDaysBetween = (startDate: Date, endDate: Date): number => {

        const dayMilliseconds = 24 * 60 * 60 * 1000;
        const timeDifference = (endDate.getTime() - startDate.getTime())

        return (timeDifference / dayMilliseconds)

    }

    const updateBorrowedDate = async () => {

        const updateBorrowedBooks = async () => {

            const queryString = "SELECT * FROM books WHERE status = ?"
            const queryArgs = [ 'borrowed' ]

            performDatabaseOperation(queryString, queryArgs, (result: any) => {

                if (Array.isArray(result) && result.constructor.name !== "QueryError") {

                    for (let i = 0; i < result.length; i++) {

                        const timeNow = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
                        const queryString = "UPDATE books SET date_borrowed = ? WHERE id = ?"
                        const queryArgs = [ timeNow, result[i].id ]

                        performDatabaseOperation(queryString, queryArgs)

                    }

                }
                
            })

        }
        await updateBorrowedBooks()

        const updateDueBooks = async () => {

            const queryString = "SELECT * FROM books WHERE status = ?"
            const queryArgs = [ 'due' ]

            performDatabaseOperation(queryString, queryArgs, (result: any) => {

                if (Array.isArray(result) && result.constructor.name !== "QueryError") {

                    for (let i = 0; i < result.length; i++) {

                        const timeNow = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
                        const queryString = "UPDATE books SET date_borrowed = ? WHERE id = ?"
                        const queryArgs = [ timeNow, result[i].id ]

                        performDatabaseOperation(queryString, queryArgs)

                    }

                }
                
            })

        }
        await updateDueBooks()

    }
    await updateBorrowedDate()

    const checkBorrowedBooks = async () => {

        const queryString = "SELECT * FROM books WHERE status = ?"
        const queryArgs = [ 'borrowed' ]

        performDatabaseOperation(queryString, queryArgs, (result: any) => {

            if (Array.isArray(result) && result.constructor.name !== "QueryError") {

                for (let i = 0; i < result.length; i++) {

                    const dateBorrowed: Date = new Date(result[i].date_borrowed)
                    const dateDue: Date = new Date(result[i].date_due)
                
                    if (getDaysBetween(dateBorrowed, dateDue) < 1) {
                    
                        const queryString = "UPDATE books SET status = ? WHERE id = ?"
                        const queryArgs = [ 'due', result[i].id ]
                    
                        performDatabaseOperation(queryString, queryArgs)
                    
                    }
                
                }

            }

        })



    }
    await checkBorrowedBooks()

    const computeBooksDuration = async () => {

        const computeBorrowedDuration = async () => {

            const queryString = "SELECT * FROM books WHERE status = ?"
            const queryArgs = [ 'borrowed' ]

            performDatabaseOperation(queryString, queryArgs, (result: any) => {

                if (Array.isArray(result) && result.constructor.name !== "QueryError") {

                    for (let i = 0; i < result.length; i++) {

                        const dateBorrowed: Date = new Date(result[i].date_borrowed)
                        const dateDue: Date = new Date(result[i].date_due)
                        const queryString = "UPDATE books SET duration_borrowed = ? WHERE id = ?"
                        const queryArgs = [ Math.abs(getDaysBetween(dateBorrowed, dateDue)), result[i].id ]

                        performDatabaseOperation(queryString, queryArgs)

                    }

                }
                
            })

        }
        await computeBorrowedDuration()

        const computeDueDuration = async () => {
            
            const queryString = "SELECT * FROM books WHERE status = ?"
            const queryArgs = [ 'due' ]
            
            performDatabaseOperation(queryString, queryArgs, (result: any) => {
                
                if (Array.isArray(result) && result.constructor.name !== "QueryError") {
                    
                    for (let i = 0; i < result.length; i++) {
                        
                        const dateBorrowed: Date = new Date(result[i].date_borrowed)
                        const dateDue: Date = new Date(result[i].date_due)
                        const queryString = "UPDATE books SET duration_due = ? WHERE id = ?"
                        const queryArgs = [ Math.abs(getDaysBetween(dateBorrowed, dateDue)), result[i].id ]
                        performDatabaseOperation(queryString, queryArgs)
                    
                    }
                
                }
                
            })
        }

        await computeDueDuration()

    }
    await computeBooksDuration()

    res.sendStatus(200)

})

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

dbRoute.get('/books/due/data', (req: Request, res: Response):void => {

    const queryString = "SELECT * FROM books WHERE status = ?"
    const queryArgs = [ 'due' ]

    performDatabaseOperation(queryString, queryArgs, (result) => {
        res.json(result)
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