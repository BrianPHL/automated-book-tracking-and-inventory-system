import { Request, Response } from "express";
import * as utils from "../utils/server.utils.js";
import { v4 as uuidv4 } from "uuid";
import { UUID } from "crypto";
import { DateTime } from "luxon";

export const personnelLogin = async (req: Request, res: Response): Promise<void> => {
    
    try {

        const memoryCookie: UUID = req.cookies['pMemory']
        const isTokenValid: boolean = await utils.validateAccessToken({
            table: 'personnel', 
            token: memoryCookie
        })

        !isTokenValid
        ? res.sendFile("login.html", { root: "public/views/personnel" })
        : res.redirect("/personnel/dashboard")

    } catch(err) {

        await utils.errorPrompt(res, 'redirect', {
            status: 500,
            title: `Internal Server Error - ${ err.name }`,
            body: err.message
        })

    }

}

export const personnelLoginAuth = async (req: Request, res: Response): Promise<void> => {

    try {

        const { username, password } = req.body
        const queryString = "SELECT * FROM personnel WHERE username = ? AND password = ?"
        const result = await utils.executeDatabaseQuery(queryString, [username, password])
        
        if (await utils.isQueryError(result)) {
            
            console.error(result)
            res.sendStatus(500)
        
        }

        if (!await utils.isQueryResultEmpty(result)) {

            const uuidToken: UUID = uuidv4()

            await utils.modifyAccessToken('add', {
                table: 'personnel',
                column: 'username',
                token: uuidToken,
                identifier: username,
                password: password                
            })

            res
            .cookie("pMemory", uuidToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: "strict",
                httpOnly: true,
                secure: true    
            })
            .cookie("pAccess", uuidToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: "strict",
                httpOnly: true,
                secure: true
            })
            .cookie("pData", uuidToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: "strict",
                httpOnly: true,
                secure: true
            })
            .sendStatus(200)

        } else { res.sendStatus(403) }

    } catch (err) { 
        
        await utils.errorPrompt(res, 'url', {
            status: 500,
            title: `Internal Server Error - ${ err.name }`,
            body: err.message
        })
    
    }

}

export const personnelTableSearch = async (req: Request, res: Response): Promise<void> => {
    
    let fetchedTableEntries: string[] = []

    const fetchTab: string = req.params.tab
    const fetchQuery: string = req.params.query || null
    
    const Dashboard = async (): Promise<void> => {

        return new Promise(async (resolve) => {

            const fetchedTableData = await utils.fetchTableData('personnel', 'dashboard', fetchQuery)

            for (const data of Object.values(fetchedTableData)) {
    
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
                : borrowDateAndDuration = `<h2>${ data['date_borrowed'] }</h2><h3>${ utils.getDaysBetween(data['date_borrowed'], data['date_due']) }</h3>`
    
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
    
                fetchedTableEntries.push(entry)
    
            }

            resolve()

        })
        
    }

    const Inventory = async (): Promise<void> => {
        
        return new Promise(async (resolve) => {

            const fetchedTableData = await utils.fetchTableData('personnel', 'inventory', fetchQuery)

            for (const data of Object.values(fetchedTableData)) {
    
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
                        ${
                            data['status'] === 'Available'
                            ? `<i data-disabled="false" class="pInventoryActionsBookLend fa-regular fa-arrow-right-from-arc"></i>`
                            : `<i data-disabled="true" class="fa-regular fa-arrow-right-from-arc"></i>`
                        }
                        <i data-disabled="false" class="pInventoryActionsEdit fa-regular fa-pen-to-square"></i>
                        <i data-disabled="false" class="pInventoryActionsDelete fa-regular fa-xmark"></i>
                    </div>
                </div>
                `
    
                fetchedTableEntries.push(entry)
            
            }

            resolve()

        })

    }

    const Students = async (): Promise<void> => {
        
        return new Promise(async (resolve) => {

            const fetchedTableData = await utils.fetchTableData('personnel', 'students', fetchQuery)

            for (const data of Object.values(fetchedTableData)) {
    
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
                        <i data-disabled="false" class="pStudentsActionsNotify fa-regular fa-message"></i>
                        ${ 
                            data['status'] === 'Vacant'
                            ? `<i data-disabled="false" class="pInventoryActionsStudentLend fa-regular fa-arrow-right-from-arc"></i>`
                            : `<i data-disabled="true" class="fa-regular fa-arrow-right-from-arc"></i>` 
                        }
                        <i data-disabled="false" class="pStudentsActionsEdit fa-regular fa-pen-to-square"></i>
                        <i data-disabled="false" class="pStudentsActionsDelete fa-regular fa-xmark"></i>
                    </div>
                </div>
                `
    
                fetchedTableEntries.push(entry)
    
            }

            resolve()

        })

    }

    const Users = async (): Promise<void> => {
        
        return new Promise(async (resolve) => {

            const fetchedTableData = await utils.fetchTableData('personnel', 'users', fetchQuery)

            for (const data of Object.values(fetchedTableData)) {

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
                    <i data-disabled="false" class="pUsersActionsEdit fa-regular fa-pen-to-square"></i>
                    <i data-disabled="false" class="pUsersActionsDelete fa-regular fa-xmark"></i>
                    </div>
                </div>
                `

                fetchedTableEntries.push(entry)

            }

            resolve()

        })

    }

    try {

        switch (fetchTab) {

            case 'dashboard': await Dashboard(); break;
            case 'inventory': await Inventory(); break;
            case 'students': await Students(); break;
            case 'users': await Users(); break;
        
        }

        setTimeout(() => res.json(fetchedTableEntries), 2500)

    } catch (err) {

        await utils.errorPrompt(res, 'url', {
            status: 500,
            title: `Internal Server Error - ${ err.name }`,
            body: err.message
        })

    }

}

export const personnelTableFetch = async (req: Request, res: Response): Promise<void> => {

    const fetchType: string = "personnel"
    const fetchTab: string = req.params.tab
    const fetchQuery: string = req.params.query || null

    try {

        setTimeout(async () => 
            
            res.json(await utils.fetchTableData(fetchType, fetchTab, fetchQuery)), 
        
        2500)

    } catch (err) {

        await utils.errorPrompt(res, 'url', {
            status: 500,
            title: `Internal Server Error - ${ err.name }`,
            body: err.message
        })

    }
    
}

export const personnelTableRegister = async (req: Request, res: Response): Promise<void> => {

    try {

        const type: string = req.params.tab
        const data: { [ key: string ]: string } = req.body
        const inventory = async (): Promise<void> => {

            return new Promise(resolve => {

                const title: string = data['title']
                const author: string = data['author']
                const genre: string = data['genre']
                const publicationDate: string = DateTime.fromFormat(data['dPublicized'], 'yyyy-MM-dd').toFormat('dd MMMM yyyy')
                const acquisitionDate: string = DateTime.now().toFormat("dd MMMM yyyy")
                
                utils.executeDatabaseQuery(
                    `
                    INSERT INTO
                        books
                        (title, author, genre, date_publicized, date_added)
                    VALUES
                        (?, ?, ?, ?, ?) 
                    `, 
                    [ title, author, genre, publicationDate, acquisitionDate ]
                )
                
                resolve()

            })

        }
        const students = async (): Promise<void> => {

            return new Promise(resolve => {

                const name: string[] = data['studentName'].split(' ')
                const number: string = data['studentNumber']
                const phone: string = data['phoneNumber']
                const email: string = data['email']
                let firstName: string
                let lastName: string
    
                ( name.length > 2 )
                ? ( firstName = `${ name[0] } ${ name[1] }`, lastName = name[2] )
                : ( firstName = name[0], lastName = name[1] )
    
                utils.executeDatabaseQuery(
                    `
                    INSERT INTO
                        students
                        (student_number, phone_number, email, first_name, last_name)
                    VALUES
                        (?, ?, ?, ?, ?)
                    `, [ number, phone, email, firstName, lastName]
                )

                resolve()

            })

        }
        const users = async (): Promise<void> => {

            return new Promise(resolve => {

                const name: string[] = data['personnelName'].split(' ')
                const username: string = data['username']
                const role: string = data['role']
                let firstName: string
                let lastName: string
    
                ( name.length > 2 )
                ? ( firstName = `${ name[0] } ${ name[1] }`, lastName = name[2] )
                : ( firstName = name[0], lastName = name[1] )
    
                utils.executeDatabaseQuery(
                    `
                    INSERT INTO
                        personnel
                        (first_name, last_name, username, role)
                    VALUES
                        (?, ?, ?, ?)
                    `, [ firstName, lastName, username, role ]
                )

                resolve()

            })

        }

        switch (type) {
            
            case 'inventory': await inventory(); break;
            case 'students': await students(); break;
            case 'users': await users(); break;

        }

        setTimeout(() => res.sendStatus(200), 2500)

    } catch(err) {

        await utils.errorPrompt(res, 'redirect', {
            status: 500,
            title: `Internal Server Error - ${ err.name }`,
            body: err.message    
        })

    }
}

export const personnelTableEdit = async (req: Request, res: Response): Promise<void> => {

    try {

        const type: string = req.params.tab
        const data: { [ key: string ]: string } = req.body
        const inventory = async (): Promise<void> => {

            return new Promise (async (resolve) => {

                const id: string = data['id']
                const title: string = data['title']
                const author: string = data['author']
                const genre: string = data['genre']
                const publicationDate: string = DateTime.fromFormat(data['dPublicized'], 'yyyy-MM-dd').toFormat('dd MMMM yyyy')

                await utils.executeDatabaseQuery(
                `
                    UPDATE
                        books
                    SET
                        title = ?, author = ?, genre = ?, date_publicized = ?
                    WHERE
                        id = ?
                `, [ title, author, genre, publicationDate, id ]
                )
                
                resolve()

            })

        }
        const students = async (): Promise<void> => {

            return new Promise (async (resolve) => {

                const id: string = data['id']
                const name: string[] = data['studentName'].split(' ')
                const number: string = data['studentNumber']
                const phone: string = data['phoneNumber']
                const email: string = data['email']
                let firstName: string
                let lastName: string

                ( name.length > 2 )
                ? ( firstName = `${ name[0] } ${ name[1] }`, lastName = name[2] )
                : ( firstName = name[0], lastName = name[1] )

                await utils.executeDatabaseQuery(
                `
                    UPDATE
                        students
                    SET
                        first_name = ?, last_name = ?, student_number = ?, phone_number = ?, email = ?
                    WHERE
                        id = ?
                `, [ firstName, lastName, number, phone, email, id ]
                )
                
                resolve()

            })

        }
        const users = async (): Promise<void> => {

            return new Promise (async (resolve) => {

                const id: string = data['id']
                const name: string[] = data['personnelName'].split(' ')
                const username: string = data['username']
                const role: string = data['role']
                let firstName: string
                let lastName: string

                ( name.length > 2 )
                ? ( firstName = `${ name[0] } ${ name[1] }`, lastName = name[2] )
                : ( firstName = name[0], lastName = name[1] )

                await utils.executeDatabaseQuery(
                `
                    UPDATE
                        personnel
                    SET
                        first_name = ?, last_name = ?, username = ?, role = ?
                    WHERE
                        id = ?
                `, [ firstName, lastName, username, role, id ]
                )
                
                resolve()

            })

        }

        switch (type) {

            case 'inventory': await inventory(); break;
            case 'students': await students(); break;
            case 'users': await users(); break;
        
        }

        setTimeout(() => res.sendStatus(200), 2500)

    } catch(err) {

        await utils.errorPrompt(res, 'redirect', {
            status: 500,
            title: `Internal Server Error - ${ err.name }`,
            body: err.message    
        })

    }

}

export const personnelTableLend = async (req: Request, res: Response): Promise<void> => {

    try {

        const type = req.params.type
        const { entryId, modalId, dueDate } = req.body
        const [ studentData, bookData ] = await Promise.all([
            await utils.executeDatabaseQuery('SELECT * FROM students WHERE id = ?', [ type === 'students' ? entryId : modalId ]),
            await utils.executeDatabaseQuery('SELECT * FROM books WHERE id = ?', [ type === 'inventory' ? entryId : modalId ])
        ])

        const setStudent = async (): Promise<void> => {

            return new Promise(async (resolve) => {

                await utils.executeDatabaseQuery(
                    `
                    UPDATE 
                        students 
                    SET 
                        status = ?, 
                        borrowed_book = ? 
                    WHERE 
                        id = ?
                    `,
                    [ "Borrower", bookData[0]['title'], type === 'students' ? entryId : modalId ]
                )

                resolve()

            })

        }
        const setBook = async (): Promise<void> => {

            return new Promise(async (resolve) => {

                const borrower = {
                    name: `${ studentData[0]['first_name'] } ${ studentData[0]['last_name'] }`,
                    number: studentData[0]['student_number']
                }
                const date = {
                    borrowed: DateTime.now().toFormat("DD MMM YYYY HH:MM"),
                    due: dueDate
                }

                await utils.executeDatabaseQuery(
                    `
                    UPDATE 
                        books 
                    SET 
                        status = ?,
                        borrower = ?, 
                        borrower_number = ?,
                        date_borrowed = ?,
                        date_due = ? 
                    WHERE 
                        id = ?
                    `,
                    [ 
                        "Borrowed", 
                        borrower['name'], 
                        borrower['number'], 
                        date['borrowed'], 
                        date['due'], 
                        type === 'inventory' ? entryId : modalId
                    ]
                )

                resolve()

            })

        }

        await setStudent()
        await setBook()

        setTimeout(async () => res.sendStatus(200), 2500)

    } catch(err) {

        await utils.errorPrompt(res, 'redirect', {
            status: 500,
            title: `Internal Server Error - ${ err.name }`,
            body: err.message    
        })

    }

}

export const personnelTableDelete = async (req: Request, res: Response): Promise<void> => {

    try {

        let table: string 

        const id: string = req.params.id
        
        switch (req.params.tab) {
        
            case 'inventory': table = 'books'; break;
            case 'students': table = 'students'; break;
            case 'users': table = 'personnel'; break;
        
        }

        await utils.executeDatabaseQuery(`DELETE FROM ${ table } WHERE id = ?`, [ id ])

        setTimeout(async() => res.sendStatus(200), 2500)

    } catch(err) {

        await utils.errorPrompt(res, 'redirect', {
            status: 500,
            title: `Internal Server Error - ${ err.name }`,
            body: err.message
        })

    }

}

export const personnelDashboard = async (req: Request, res: Response): Promise<void> => {

    try {

        const accessCookie: UUID = req.cookies['pAccess']
        const isTokenValid: boolean = await utils.validateAccessToken({
            table: 'personnel', 
            token: accessCookie
        })

        !isTokenValid
        ? await utils.errorPrompt(res, 'redirect', {
            status: 401,
            title: 'Unauthorized',
            body: 'You are not authorized to enter this webpage!'
        })
        : res.sendFile("dashboard.html", { root: "public/views/personnel" })

    } catch(err) {

        await utils.errorPrompt(res, 'redirect', {
            status: 500,
            title: `Internal Server Error - ${ err.name }`,
            body: err.message    
        })

    }

}

export const personnelDashboardData = async (req: Request, res: Response): Promise<void> => {

    try {

        let resultData: Object = {}

        const token = req.cookies['pData']
        const [ accountData, overviewData, tableData ] = await Promise.all([
            utils.retrieveAccountData('personnel', token),
            utils.retrieveOverviewData('personnel', 'dashboard'),
            utils.fetchTableEntries('personnel', 'dashboard')
        ])
        
        Object.assign(
            resultData,
            { accountData: accountData },
            { overviewData: overviewData },
            { tableData: tableData }
        )

        res.json(resultData)

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }

}

export const personnelInventory = async (req: Request, res: Response): Promise<void> => {

    try {

        const accessCookie: UUID = req.cookies['pAccess']
        const isTokenValid: boolean = await utils.validateAccessToken({
            table: 'personnel', 
            token: accessCookie
        })
    
        !isTokenValid
        ? await utils.errorPrompt(res, 'redirect', {
            status: 401,
            title: 'Unauthorized',
            body: 'You are not authorized to enter this webpage!'
        })
        : res.sendFile("inventory.html", { root: "public/views/personnel" })

    } catch(err) {

        await utils.errorPrompt(res, 'redirect', {
            status: 500,
            title: `Internal Server Error - ${ err.name }`,
            body: err.message    
        })

    }

}

export const personnelInventoryData = async (req: Request, res: Response): Promise<void> => {

    try {

        let resultData: Object = {}

        const token = req.cookies['pData']
        const [ accountData, overviewData, tableData ] = await Promise.all([
            utils.retrieveAccountData('personnel', token),
            utils.retrieveOverviewData('personnel', 'inventory'),
            utils.fetchTableEntries('personnel', 'inventory')
        ])
        
        Object.assign(
            resultData,
            { accountData: accountData },
            { overviewData: overviewData },
            { tableData: tableData }
        )

        res.json(resultData)

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }

}

export const personnelStudents = async (req: Request, res: Response): Promise<void> => {

    try {

        const accessCookie: UUID = req.cookies['pAccess']
        const isTokenValid: boolean = await utils.validateAccessToken({
            table: 'personnel', 
            token: accessCookie
        })
    
        !isTokenValid
        ? await utils.errorPrompt(res, 'redirect', {
            status: 401,
            title: 'Unauthorized',
            body: 'You are not authorized to enter this webpage!'
        })
        : res.sendFile("students.html", { root: "public/views/personnel" })
        
    } catch(err) {

        await utils.errorPrompt(res, 'redirect', {
            status: 500,
            title: `Internal Server Error - ${ err.name }`,
            body: err.message    
        })

    }

}

export const personnelStudentsData = async (req: Request, res: Response): Promise<void> => {

    try {

        let resultData: Object = {}

        const token = req.cookies['pData']
        const [ accountData, overviewData, tableData ] = await Promise.all([
            utils.retrieveAccountData('personnel', token),
            utils.retrieveOverviewData('personnel', 'students'),
            utils.fetchTableEntries('personnel', 'students')
        ])
        
        Object.assign(
            resultData,
            { accountData: accountData },
            { overviewData: overviewData },
            { tableData: tableData }
        )

        res.json(resultData)

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }

}

export const personnelUsers = async (req: Request, res: Response): Promise<void> => {

    try {

        const accessCookie: UUID = req.cookies['pAccess']
        const isTokenValid: boolean = await utils.validateAccessToken({
            table: 'personnel', 
            token: accessCookie
        })

        !isTokenValid
        ? await utils.errorPrompt(res, 'redirect', {
            status: 401,
            title: 'Unauthorized',
            body: 'You are not authorized to enter this webpage!'
        })
        : res.sendFile("users.html", { root: "public/views/personnel" })

    } catch(err) {

        await utils.errorPrompt(res, 'redirect', {
            status: 500,
            title: `Internal Server Error - ${ err.name }`,
            body: err.message    
        })
    }

}

export const personnelUsersData = async (req: Request, res: Response): Promise<void> => {

    try {

        let resultData: Object = {}

        const token = req.cookies['pData']
        const [ accountData, overviewData, tableData ] = await Promise.all([
            utils.retrieveAccountData('personnel', token),
            utils.retrieveOverviewData('personnel', 'users'),
            utils.fetchTableEntries('personnel', 'users')
        ])
        
        Object.assign(
            resultData,
            { accountData: accountData },
            { overviewData: overviewData },
            { tableData: tableData }
        )

        res.json(resultData)

    } catch(err) {

        console.error(err.name, err.message)
        throw err

    }

}

export const personnelLogout = async (req: Request, res: Response): Promise<void> => {
    
    try {

        const dataCookie: UUID = req.cookies['pData']

        await utils.modifyAccessToken('remove', {
            table: 'personnel',
            token: dataCookie
        })

        res
        .clearCookie('pMemory')
        .clearCookie('pAccess')
        .clearCookie('pData')
        .sendStatus(200)

    } catch(err) {

        await utils.errorPrompt(res, 'url', {
            status: 500,
            title: `Internal Server Error - ${ err.name }`,
            body: err.message    
        })

    }

}

export const error = async (_, res: Response): Promise<void> => {

    res.sendFile("error.html", { root: "public/views" })

}