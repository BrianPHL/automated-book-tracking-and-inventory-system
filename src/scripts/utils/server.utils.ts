import { pool } from "../app.js";
import { Response } from "express";
import { UUID } from "crypto";
import { DateTime } from "luxon";

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

export const isQueryError = async (result: any) => { 
    
    return result && result.constructor && result.constructor.name === "QueryError" 

}

export const errorPrompt = async (res: Response, type: string, data: { status: number, title: string, body: string }): Promise<void | string> => {

    const params = new URLSearchParams()

    for (let [key, value] of Object.entries(data)) { 
        
        params.append(key.toString(), value.toString()) 
    
    }

    if (type === 'redirect') {
    
        res.redirect(`/error?${ params.toString() }`)
    
    } else if (type === 'url') {

        return params.toString()

    }

}

export const modifyAccessToken = async (type: string, data: {table: string, token: UUID, column?: string, identifier?: string, password?: string}): Promise<void> => {

    return new Promise(async (resolve) => {

        try {

            if (type === 'add') {

                await executeDatabaseQuery(
                    `UPDATE ${ data.table } SET access_token = ? WHERE ${ data.column } = ? AND password = ?`,
                    [ data.token, data.identifier, data.password ]
                )
    
            } else if (type === 'remove') {

                await executeDatabaseQuery(
                    `UPDATE ${ data.table } SET access_token = NULL WHERE access_token = ?`,
                    [ data.token ]
                )
    
            }
    
        } catch (err) {
    
            console.error(err.name, err.message)
            throw err
    
        }

        resolve()

    })
    
}

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
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Available"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Past Due" OR status = "Borrowed"')    
            ])

            Object.assign(
                result, 
                { studentCount: students[0].count },
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
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Available"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Borrowed"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Past Due"')    
            ])

            Object.assign(
                result,
                { bookCount: books[0].count },
                { availableBookCount: availableBooks[0].count },
                { availableBookCountPercentage: Math.floor( availableBooks[0].count / books[0].count * 100 ) },
                { borrowedBookCount: borrowedBooks[0].count },
                { borrowedBookCountPercentage: Math.floor( borrowedBooks[0].count / books[0].count * 100 ) },
                { dueBookCount: dueBooks[0].count },
                { dueBookCountPercentage: Math.floor( dueBooks[0].count / books[0].count * 100 ) }
            )

        } catch(err) {

            console.error(err.name, err.message)
            throw err

        }

    }

    const retrieveStudentsData = async (): Promise<void> => {

        try {

            const [ students, vacantStudents, borrowerStudents, dueStudents ] = await Promise.all([
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM students'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Available"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Borrowed"'),
                executeDatabaseQuery('SELECT COUNT(*) AS count FROM books WHERE status = "Past Due"')    
            ])

            Object.assign(
                result,
                { studentCount: students[0].count },
                { vacantStudentCount: vacantStudents[0].count },
                { vacantStudentCountPercentage: Math.floor( vacantStudents[0].count / students[0].count * 100 ) },
                { borrowerStudentCount: borrowerStudents[0].count },
                { borrowerStudentCountPercentage: Math.floor( borrowerStudents[0].count / students[0].count * 100 ) },
                { dueStudentCount: dueStudents[0].count },
                { dueStudentCountPercentage: Math.floor( dueStudents[0].count / students[0].count * 100 ) }
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
                { itPersonnelCountPercentage: Math.floor(itPersonnel[0].count / personnel[0].count * 100) },
                { librarianPersonnelCount: librarianPersonnel[0].count },
                { librarianPersonnelCountPercentage: Math.floor(librarianPersonnel[0].count / personnel[0].count * 100) }
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

export const fetchTableData = async (type: string, tab: string, query?: string): Promise<string> => {

    const pDashboard = async (): Promise<string> => {

        try {

            let qResult: string

            !query
            ? qResult = await executeDatabaseQuery(
                `
                SELECT 
                    id, title, status, borrower, borrower_number, 
                    date_borrowed, date_due, date_publicized, 
                    date_added
                FROM 
                    books
                `
            )
            : qResult = await executeDatabaseQuery(
                `
                SELECT 
                    id, title, status, borrower, borrower_number, 
                    date_borrowed, date_due, date_publicized, 
                    date_added
                FROM 
                    books
                WHERE
                    LOWER(title) LIKE LOWER('%${query}%') 
                    OR LOWER(status) LIKE LOWER('%${query}%')
                    OR LOWER(borrower) LIKE LOWER('%${query}%')
                    OR LOWER(borrower_number) LIKE LOWER('%${query}%')
                    OR LOWER(date_borrowed) LIKE LOWER('%${query}%')
                    OR LOWER(date_due) LIKE LOWER('%${query}%')
                    OR LOWER(date_publicized) LIKE LOWER('%${query}%')
                    OR LOWER(date_added) LIKE LOWER('%${query}%')
                `
            )

            return qResult

        } catch(err) {

            console.error(err.name, err.message)
            throw err
            
        }

    }

    const pInventory = async (): Promise<string> => {

        try {
        
            let qResult: string

            !query
            ? qResult = await executeDatabaseQuery(
                `
                SELECT
                    id, title, status, author, genre, 
                    date_publicized, date_added 
                FROM
                    books
                `
            )
            : qResult = await executeDatabaseQuery(
                `
                SELECT
                    id, title, status, author, genre, 
                    date_publicized, date_added 
                FROM
                    books
                WHERE
                    LOWER(title) LIKE LOWER('%${query}%')
                    OR LOWER(status) LIKE LOWER('%${query}%')
                    OR LOWER(author) LIKE LOWER('%${query}%')
                    OR LOWER(genre) LIKE LOWER('%${query}%')
                    OR LOWER(date_publicized) LIKE LOWER('%${query}%')
                    OR LOWER(date_added) LIKE LOWER('%${query}%')
                `
            )

            return qResult

        } catch(err) {

            console.error(err.name, err.message)
            throw err
            
        }
        
    }

    const pStudents = async (): Promise<string> => {

        try {

            let qResult: string

            !query
            ? qResult = await executeDatabaseQuery(
                `
                SELECT
                    id, CONCAT(first_name, ' ', last_name) AS full_name, student_number, 
                    status, borrowed_book, phone_number, email
                FROM
                    students
                `
            )
            : qResult = await executeDatabaseQuery(
                `
                SELECT
                    id, CONCAT(first_name, ' ', last_name) AS full_name, student_number, 
                    status, borrowed_book, phone_number, email
                FROM
                    students
                WHERE
                    LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER('%${query}%')
                    OR LOWER(student_number) LIKE LOWER('%${query}%')
                    OR LOWER(status) LIKE LOWER('%${query}%')
                    OR LOWER(borrowed_book) LIKE LOWER('%${query}%')
                    OR LOWER(phone_number) LIKE LOWER('%${query}%')
                    OR LOWER(email) LIKE LOWER('%${query}%')
                `
            )



            return qResult

        } catch(err) {

            console.error(err.name, err.message)
            throw err
            
        }

    }

    const pUsers = async (): Promise<string> => {

        try {

            let qResult: string

            !query
            ? qResult = await executeDatabaseQuery(
                `
                SELECT
                    id, CONCAT(first_name, ' ', last_name) AS full_name, username, role
                FROM
                    personnel
                `
            )
            : qResult = await executeDatabaseQuery(
                `
                SELECT
                    id, CONCAT(first_name, ' ', last_name) AS full_name, username, role
                FROM
                    personnel
                WHERE
                    LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER('%${query}%')
                    OR LOWER(last_name) LIKE LOWER('%${query}%')
                    OR LOWER(username) LIKE LOWER('%${query}%')
                    OR LOWER(role) LIKE LOWER('%${query}%')
                `
            )

            return qResult

        } catch(err) {

            console.error(err.name, err.message)
            throw err
            
        }
        
    }

    const sDashboard = async (): Promise<string> => {

        try {

            const qResult = await executeDatabaseQuery(
                `
                SELECT
                    id, title, status, author, genre, 
                    date_publicized, date_added 
                FROM
                    books
                `
            )

            return qResult


        } catch(err) {

            console.error(err.name, err.message)
            throw err
            
        }

    }

    const tableNames = {
        'dashboard': type === 'personnel' ? pDashboard : sDashboard,
        'inventory': pInventory,
        'students': pStudents,
        'users': pUsers
    }
    
    try {
    
        return await tableNames[tab]()

    } catch (err) {
        
        console.error(err.name, err.message)
        throw err

    }
    
}

export const fetchTableEntries = async (type: string, tab: string, query?: string): Promise<string[]> => {

    const pDashboard = async (): Promise<string[]> => {

        const result = await fetchTableData('personnel', 'dashboard', query)
        let entries: string[] = []

        Object.values(result).forEach(async (data) => {

            const identifier = data['id']
            const title = data['title']
            const dueDate = data['date_due'] === null ? 'No data' : data['date_due']
            const publicationDate = data['date_publicized']
            const acquisitionDate = data['date_added']
            let borrowerAndBorrowerNumber = ``
            let borrowDateAndDuration = ``
            let visibility = ``
            let status = ``

            data['borrower'] === null 
            ? borrowerAndBorrowerNumber = `<h2>No data</h2>` 
            : borrowerAndBorrowerNumber = `<h2>${ data['borrower'] }</h2><h3>${ data['borrower_number'] }</h3>`
            
            data['date_borrowed'] === null
            ? borrowDateAndDuration = `<h2>No data</h2>`
            : borrowDateAndDuration = `<h2>${ data['date_borrowed'] }</h2><h3>${ getDaysBetween(data['date_borrowed'], data['date_due']) }</h3>`

            data['status'] === 'Available' 
            ? status = `<h2>${data['status']}</h2>` 
            : status = `<h2>Unavailable</h2><h3>${ data['status'] }</h3>`

            status.includes('Past Due') 
            ? visibility = 'visible' 
            : visibility = 'hidden'

            const entry =
            `
            <div class="entry" data-identifier="${ identifier }">
                <i style="visibility: ${ visibility };" class="warning fa-solid fa-triangle-exclamation"></i>
                <div class="title"><h2>${ title }</h2></div>
                <div class="status">${ status }</div>
                <div class="borrower">${ borrowerAndBorrowerNumber }</div>
                <div class="borrowDate">${ borrowDateAndDuration }</div>
                <div class="dueDate"><h2>${ dueDate }</h2></div>
                <div class="publicationDate"><h2>${ publicationDate }</h2></div>
                <div class="acquisitionDate"><h2>${ acquisitionDate }</h2></div>
                <div class="actions"><i class="fa-regular fa-pen-to-square" style="visibility: hidden;"></i></div>
            </div>
            `

            entries.push(entry)

        })

        return entries
        
    }

    const pInventory = async (): Promise<string[]> => {
        
        const result = await fetchTableData('personnel', 'inventory', query)
        let entries: string[] = []

        Object.values(result).forEach(async (data) => {

            const identifier = data['id']
            const title = data['title']
            const author = data['author']
            const genre = data['genre']
            const publicationDate = data['date_publicized']
            const acquisitionDate = data['date_added']
            let visibility = ``
            let status = ``

            data['status'] === 'Available' 
            ? status = `<h2>${data['status']}</h2>` 
            : status = `<h2>Unavailable</h2><h3>${ data['status'] }</h3>`

            status.includes('Past Due') 
            ? visibility = 'visible' 
            : visibility = 'hidden'

            const entry =
            `
            <div class="entry" data-identifier="${ identifier }">
                <i style="visibility: ${ visibility };" class="warning fa-solid fa-triangle-exclamation"></i>
                <div class="title"><h2>${ title }</h2></div>
                <div class="status"><h2>${ status }</h2></div>
                <div class="author"><h2>${ author }</h2></div>
                <div class="genre"><h2>${ genre }</h2></div>
                <div class="publicationDate"><h2>${ publicationDate }</h2></div>
                <div class="acquisitionDate"><h2>${ acquisitionDate }</h2></div>
                <div class="actions">
                    <i class="pInventoryActionsLend fa-regular fa-arrow-right-from-arc"></i>
                    <i class="pInventoryActionsEdit fa-regular fa-pen-to-square"></i>
                    <i class="pInventoryActionsDelete fa-regular fa-xmark"></i>
                </div>
            </div>
            `

            entries.push(entry)

        })

        return entries

    }

    const pStudents = async (): Promise<string[]> => {
        
        const result = await fetchTableData('personnel', 'students', query)
        let entries: string[] = [] 

        Object.values(result).forEach(async (data) => {

            const identifier = data['id']
            const studentName = data['full_name']
            const studentNumber = data['student_number']
            const borrowedBook = data['borrowed_book'] === null ? 'No data' : data['borrowed_book']
            const phoneNumber = data['phone_number']
            const emailAddress = data['email']
            let studentStatus = ``
            let visibility = ``

            data['status'] === 'Vacant' 
            ? studentStatus = `<h2>${data['status']}</h2>` 
            : studentStatus = `<h2>Unavailable</h2><h3>${ data['status'] }</h3>`

            studentStatus.includes('Past Due') 
            ? visibility = 'visible' 
            : visibility = 'hidden'

            const entry =
            `
            <div class="entry" data-identifier="${ identifier }">
                <i style="visibility: ${ visibility };" class="warning fa-solid fa-triangle-exclamation"></i>
                <div class="name"><h2>${ studentName }</h2></div>
                <div class="studentNumber"><h2>${ studentNumber }</h2></div>
                <div class="status">${ studentStatus }</div>
                <div class="borrowedBook"><h2>${ borrowedBook }</h2></div>
                <div class="phoneNumber"><h2>${ phoneNumber }</h2></div>
                <div class="emailAddress"><h2>${ emailAddress }</h2></div>
                <div class="actions">
                    <i class="pStudentsActionsNotify fa-regular fa-message"></i>
                    <i class="pStudentsActionsEdit fa-regular fa-pen-to-square"></i>
                    <i class="pStudentsActionsDelete fa-regular fa-xmark"></i>
                </div>
            </div>
            `

            entries.push(entry)

        })

        return entries

    }

    const pUsers = async (): Promise<string[]> => {
        
        const result = await fetchTableData('personnel', 'users', query)
        let entries: string[] = []

        Object.values(result).forEach(async (data) => {

            const identifier = data['id']
            const fullName = data['full_name']
            const username = data['username']
            const role = data['role']
            let privilege = ``

            data['role'] === 'Librarian'
            ? privilege = `<h3>Dashboard</h3><h3>Inventory</h3><h3>Students</h3>`
            : privilege = `<h3>Dashboard</h3><h3>Inventory</h3><h3>Students</h3><h3>Users</h3>`

            const entry =
            `
            <div class="entry" data-identifier="${ identifier }">
                <i style="visibility: hidden;" class="warning fa-solid fa-triangle-exclamation"></i>
                <div class="fullName"><h2>${ fullName }</h2></div>
                <div class="username"><h2>${ username }</h2></div>
                <div class="role"><h2>${ role }</h2></div>
                <div class="privilege">${ privilege }</div>
                <div class="emailAddress"><h2>${ username }</h2><h3>@feuroosevelt.edu.ph</h3></div>
                <div class="actions">
                <i class="pUsersActionsEdit fa-regular fa-pen-to-square"></i>
                <i class="pUsersActionsDelete fa-regular fa-xmark"></i>
                </div>
            </div>
            `

            entries.push(entry)

        })

        return entries

    }

    const sDashboard = async (): Promise<void> => {

        // TODO: Do this later.
        const result = await fetchTableData('student', 'dashboard', query)

    }

    const tableNames = {
        'dashboard': type === 'personnel' ? pDashboard : sDashboard,
        'inventory': pInventory,
        'students': pStudents,
        'users': pUsers
    }

    try {

        return await tableNames[tab]()

    } catch (err) {
        
        console.error(err.name, err.message)
        throw err

    }

}

export const setTableData = async (type: string, tab: string, data: {}): Promise<void> => {

    return new Promise(async (resolve): Promise<void> => {

        const registerTableData = async () => {

            let sqlString: string = ''
            let sqlArgs: string = ''
            let sqlData: string[] = []
            
            try {
    
                if (tab === 'inventory') { tab = 'books' }
                if (tab === 'users') { tab = 'personnel' }
    
                const dateFormat = "dd LLLL yyyy"
                const setVariablesData = async (): Promise<void> => {
    
                    return new Promise((resolve) => {
    
                        if (tab === 'books') {
    
                            sqlString = `title, author, genre, date_publicized, date_added`
                            sqlArgs = '?, ?, ?, ?, ?'
                            sqlData = 
                            [ 
                                data['title'], data['author'], data['genre'], 
                                DateTime.fromFormat(data['dPublicized'], 'yyyy-MM-dd').toFormat(dateFormat), 
                                DateTime.now().toFormat(dateFormat)
                            ]
    
                        } else if (tab === 'students') {
    
                            const splitName = data['studentName'].split(' ')
                            let firstName: string
                            let lastName: string

                            if (splitName.length > 2) {
                                
                                firstName = `${ splitName[0] } ${splitName[1]}`
                                lastName = splitName[2]

                            } else {

                                firstName = splitName[0]
                                lastName = splitName[1]

                            }

                            sqlString = 'student_number, phone_number, email, status, first_name, last_name'
                            sqlArgs = '?, ?, ?, ?, ?, ?'
                            sqlData = 
                            [
                                data['studentNumber'], data['phoneNumber'], data['email'], 
                                'Vacant', firstName, lastName
                            ]
            
                        } else if (tab === 'personnel') {

                            const splitName = data['personnelName'].split(' ')
                            let firstName: string
                            let lastName: string

                            if (splitName.length > 2) {
                                
                                firstName = `${ splitName[0] } ${splitName[1]}`
                                lastName = splitName[2]

                            } else {

                                firstName = splitName[0]
                                lastName = splitName[1]

                            }
    
                            sqlString = 'first_name, last_name, username, role'
                            sqlArgs = '?, ?, ?, ?'
                            sqlData = [ 
                                firstName, lastName, 
                                data['username'], data['role'] 
                            ]
            
                        }
    
                        resolve()
    
                    })
    
                }
                await setVariablesData()
                await executeDatabaseQuery( `INSERT INTO ${ tab } (${ sqlString }) VALUES (${ sqlArgs })`, sqlData )
    
            } catch (err) {
    
                console.error(err.name, err.message)
                throw err
    
            }
    
        }
    
        const editTableData = async () => {
    
            let sqlString: string = ''
            let sqlArgs: string = ''
            let sqlData: string[] = []
            
            try {
    
                if (tab === 'inventory') { tab = 'books' }
                if (tab === 'users') { tab = 'personnel' }
    
                const dateFormat = "dd LLLL yyyy"
                const setVariablesData = async (): Promise<void> => {
    
                    return new Promise((resolve) => {
    
                        if (tab === 'books') {
    
                            sqlString = `title, author, genre, date_publicized, date_added`
                            sqlArgs = '?, ?, ?, ?, ?'
                            sqlData = 
                            [ 
                                data['title'], data['author'], data['genre'], 
                                DateTime.fromFormat(data['dPublicized'], 'yyyy-MM-dd').toFormat(dateFormat), 
                                DateTime.now().toFormat(dateFormat)
                            ]
    
                        } else if (tab === 'students') {
    
                            const splitName = data['studentName'].split(' ')
                            let firstName: string
                            let lastName: string

                            if (splitName.length > 2) {
                                
                                firstName = `${ splitName[0] } ${splitName[1]}`
                                lastName = splitName[2]

                            } else {

                                firstName = splitName[0]
                                lastName = splitName[1]

                            }

                            sqlString = 'student_number, phone_number, email, status, first_name, last_name'
                            sqlArgs = '?, ?, ?, ?, ?, ?'
                            sqlData = 
                            [
                                data['studentNumber'], data['phoneNumber'], data['email'], 
                                'Vacant', firstName, lastName
                            ]
            
                        } else if (tab === 'personnel') {

                            const splitName = data['personnelName'].split(' ')
                            let firstName: string
                            let lastName: string

                            if (splitName.length > 2) {
                                
                                firstName = `${ splitName[0] } ${splitName[1]}`
                                lastName = splitName[2]

                            } else {

                                firstName = splitName[0]
                                lastName = splitName[1]

                            }
    
                            sqlString = 'first_name, last_name, username, role'
                            sqlArgs = '?, ?, ?, ?'
                            sqlData = [ 
                                firstName, lastName, 
                                data['username'], data['role'] 
                            ]
            
                        }
    
                        resolve()
    
                    })
    
                }
                await setVariablesData()
                await executeDatabaseQuery( `INSERT INTO ${ tab } (${ sqlString }) VALUES (${ sqlArgs })`, sqlData )
    
            } catch (err) {
    
                console.error(err.name, err.message)
                throw err
    
            }
            
        }
    
        try {
    
            switch (type) {
    
                case 'register':
                    await registerTableData()
                    break;
        
                case 'edit':
                    await editTableData()
                    break;
            
                default:
                    throw `Error in switch-case; passed argument: ${type} did not match any case.`
            
            }
    
        } catch(err) {
    
            console.error(err.name, err.message)
            throw err
            
        }

        resolve()

    })

}

export const isQueryResultEmpty = async (queryResult: any) => {

    return !(Array.isArray(queryResult) && queryResult.length > 0)

}

export const getDaysBetween = (firstDate: string, secondDate: string,): string => {

    if (!firstDate && !secondDate) { return; }

    const dateFormat = "yyyy-MM-dd HH:mm:ss"
    const fFirstDate = DateTime.fromFormat(firstDate, dateFormat)
    const fSecondDate = DateTime.fromFormat(secondDate, dateFormat)
    const dateNow = DateTime.now()
    const borrowDateDiff = Math.abs(Math.floor(fSecondDate.diff(fFirstDate).as('days')))
    const dueDateDiff = Math.abs(Math.floor(dateNow.diff(fSecondDate).as('days')))

    return fFirstDate > fSecondDate
    ? `${ dueDateDiff } ${ dueDateDiff === 1 ? 'day' : 'days' } past due`
    : `${ borrowDateDiff } ${ borrowDateDiff === 1 ? 'day' : 'days' } remaining`

}