import { pool } from "../app.js";
import { Response } from "express";
import { UUID } from "crypto";

// TODO: export function status: partial, could be improved.
export const executeDatabaseQuery = async (query: string, argument?: string | string[] | null, callback?: (result: any) => void): Promise<any> => {

    try {

        if (!callback) {

            const [rows] = await pool.promise().query(query, argument)

            return rows


        } else { pool.query(query, argument, (results) => { callback(results) }) }

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }
    
}

// * export function status: complete
export const isQueryError = async (result: any) => { 
    
    return result && result.constructor && result.constructor.name === "QueryError" 

}

// * export function status: complete
export const errorPrompt = async (data: object): Promise<URLSearchParams> => {

    const params = new URLSearchParams()

    for (let [key, value] of Object.entries(data)) { params.append(key, value) }
    
    return params

}

// TODO: export function status: partial, could be improved. (Let the controller handle the response. Only return the string; It might be feasible to merge this with errorPromptURL())
export const errorPromptRedirect = async (res: Response, data: {status: number, title: string, body: string}): Promise<void> => {

    const params = await errorPrompt(data)

    res.redirect(`/error?${params.toString()}`)

}

// * export function status: complete
export const errorPromptURL = async (res: Response, data: { status: number, title: string, body: string }): Promise<string> => {

    const params = await errorPrompt(data)

    return params.toString()

}

// TODO: export function status: partial, could be improved.
export const validateAccessToken = async (data: { table: string, token: UUID }): Promise<boolean> => {

    try {

        const result = await executeDatabaseQuery(
            `SELECT access_token FROM ${ data.table } WHERE access_token = ?`,
            [ data.token ]
        )
        
        return !await isQueryResultEmpty(result)

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }

}

// * export function status: complete
export const addAccessToken = async (data: { table: string, column: string, token: UUID, identifier: string, password: string }): Promise<boolean> => {

    try {

        const result = await executeDatabaseQuery(
            `UPDATE ${data.table} SET access_token = ? WHERE ${data.column} = ? AND password = ?`,
            [ data.token, data.identifier, data.password ]
        )

        return !result ? false : true

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }

}

// * export function status: complete
export const removeAccessToken = async (data: { table: string, token: UUID }): Promise<boolean> => {

    try {

        const result = await executeDatabaseQuery(
            `UPDATE ${ data.table } SET access_token = NULL WHERE access_token = ?`,
            [ data.token ]
        )

        return !result ? false : true

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }

}

export const retrieveAccountData = async (type: string, token: UUID): Promise<object | boolean> => {

    let result: object = {}

    try {

        result = await executeDatabaseQuery(
            `SELECT first_name, last_name, role FROM ${ type } WHERE access_token = ?`,
            [ token ]
        )

        return result[0]

        
    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }
    
}

export const retrieveOverviewData = async (type: string, tab: string): Promise<object | boolean> => {

    let result: object = {}

    const retrieveDashboardData = async (): Promise<void> => {

        try {

            const [ students, books, availableBooks, unavailableBooks ] = await Promise.all([
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM students'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "available"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "due" OR status = "borrowed"')    
            ])

            Object.assign(
                result, 
                { studentsCount: students[0].count },
                { bookCount: books[0].count },
                { availableBookCount: availableBooks[0].count },
                { availableBookCountPercentage: Math.floor( availableBooks[0].count / books[0].count * 100 ) },
                { unavailableBookCount: unavailableBooks[0].count },
                { unavailableBookCountPercentage: Math.floor( unavailableBooks[0].count / books[0].count * 100 ) }
            )

        } catch(err) {

            console.error(err.name, err.message)
            throw err

        }

    }

    const retrieveInventoryData = async (): Promise<void> => {

        try {

            const [ books, availableBooks, borrowedBooks, dueBooks ] = await Promise.all([
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "available"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "borrowed"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "due"')    
            ])

            Object.assign(
                result,
                { booksCount: books[0].count },
                { availableBooksCount: availableBooks[0].count },
                { availableBooksPercentage: Math.floor( availableBooks[0].count / books[0].count * 100 ) },
                { borrowedBooksCount: borrowedBooks[0].count },
                { borrowedBooksPercentage: Math.floor( borrowedBooks[0].count / books[0].count * 100 ) },
                { dueBooksCount: dueBooks[0].count },
                { dueBooksPercentage: Math.floor( dueBooks[0].count / books[0].count * 100 ) }
            )

        } catch(err) {

            console.error(err.name, err.message)
            throw err

        }

    }

    const retrieveStudentsData = async () => {

        try {

            const [ students, vacantStudents, borrowerStudents, dueStudents ] = await Promise.all([
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM students'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "available"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "borrowed"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "due"')    
            ])

            Object.assign(
                result,
                { studentsCount: students[0].count },
                { vacantStudentsCount: vacantStudents[0].count },
                { vacantStudentsPercentage: Math.floor( vacantStudents[0].count / students[0].count * 100 ) },
                { borrowerStudentsCount: borrowerStudents[0].count },
                { borrowerStudentsPercentage: Math.floor( borrowerStudents[0].count / students[0].count * 100 ) },
                { dueStudentsCount: dueStudents[0].count },
                { dueStudentsPercentage: Math.floor( dueStudents[0].count / students[0].count * 100 ) }
            )

        } catch(err) {

            console.error(err.name, err.message)
            throw err

        }

    }

    const retrieveUsersData = async () => {

        try {

            const [ personnel, itPersonnel, librarianPersonnel ] = await Promise.all([
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM personnel'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM personnel WHERE role = "IT"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM personnel WHERE role = "Librarian"')
            ])

            Object.assign(
                result,
                { personnelCount: personnel[0].count },
                { itPersonnelCount: itPersonnel[0].count },
                { itPersonnelPercentage: Math.floor(itPersonnel[0].count / personnel[0].count * 100) },
                { librarianPersonnelCount: librarianPersonnel[0].count },
                { librarianPersonnelPercentage: Math.floor(librarianPersonnel[0].count / personnel[0].count * 100) }
            )

        } catch(err) {

            console.error(err.name, err.message)
            throw err

        }

    }

    const retrieveStudentData = async () => {

        try {

            const [ books, availableBooks, unavailableBooks ] = await Promise.all([
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "available"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "due" OR status = "borrowed"')    
            ])

            Object.assign(
                result,
                { bookCount: books[0].count },
                { availableBookCount: availableBooks[0].count },
                { availableBookCountPercentage: Math.floor( availableBooks[0].count / books[0].count * 100 ) },
                { unavailableBookCount: unavailableBooks[0].count },
                { unavailableBookCountPercentage: Math.floor( unavailableBooks[0].count / books[0].count * 100 ) }
            )

        } catch(err) {

            console.error(err.name, err.message)
            throw err

        }

    }

    try {

        if (type !== 'students') {

            switch (tab) {
                
                case 'dashboard': 
                    await retrieveDashboardData()
                    break
                case 'inventory': 
                    await retrieveInventoryData()
                    break
                case 'students': 
                    await retrieveStudentsData()
                    break
                case 'users': 
                    await retrieveUsersData()
                    break
                default: 
                    throw `Error in switch-case; passed argument: ${tab} did not match any case.`
            
            }

        } else { await retrieveStudentData() }

        return result

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }

}

export const retrieveTableData = async (type: string, tab: string): Promise<object | boolean> => {

    let result: object = {}

    const retrieveDashboardData = async (): Promise<void> => {

        try {

            const queryResult = await executeDatabaseQuery(
                `
                SELECT 
                    title, status, borrower, borrower_number, 
                    date_borrowed, date_due, date_publicized, 
                    date_added
                FROM 
                    books
                `
            )

            Object.assign(result, queryResult)

        } catch(err) {

            console.error(err.name, err.message)
            throw err
            
        }

    }

    const retrieveInventoryData = async (): Promise<void> => {

        try {
        
            const queryResult = await executeDatabaseQuery(
                `
                SELECT
                    title, status, author, genre, 
                    date_publicized, date_added 
                FROM
                    books
                `
            )

            Object.assign(result, queryResult)

        } catch(err) {

            console.error(err.name, err.message)
            throw err
            
        }
        
    }

    const retrieveStudentsData = async (): Promise<void> => {

        try {

            const queryResult = await executeDatabaseQuery(
                `
                SELECT
                    first_name, last_name, student_number, 
                    status, borrowed_book, phone_number, email
                FROM
                    students
                `
            )

            Object.assign(result, queryResult)

        } catch(err) {

            console.error(err.name, err.message)
            throw err
            
        }

    }

    const retrieveUsersData = async (): Promise<void> => {

        try {

            const queryResult = await executeDatabaseQuery(
                `
                SELECT
                    first_name, last_name, username, role
                FROM
                    personnel
                `
            )

            Object.assign(result, queryResult)

        } catch(err) {

            console.error(err.name, err.message)
            throw err
            
        }
        
    }

    const retrieveStudentData = async (): Promise<void> => {

        try {

            const queryResult = await executeDatabaseQuery(
                `
                SELECT
                    title, status, author, genre, 
                    date_publicized, date_added 
                FROM
                    books
                `
            )

            Object.assign(result, queryResult)


        } catch(err) {

            console.error(err.name, err.message)
            throw err
            
        }

    }
    
    try {

        if (type !== 'students') {

            switch (tab) {
                
                case 'dashboard': 
                    await retrieveDashboardData()
                    break
                case 'inventory': 
                    await retrieveInventoryData()
                    break
                case 'students': 
                    await retrieveStudentsData()
                    break
                case 'users': 
                    await retrieveUsersData()
                    break
                default: 
                    throw `Error in switch-case; passed argument: ${tab} did not match any case.`
            
            }

        } else { await retrieveStudentData() }

        return result

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }
    
}

export const isQueryResultEmpty = async (queryResult: any) => {

    return !(Array.isArray(queryResult) && queryResult.length > 0)

}