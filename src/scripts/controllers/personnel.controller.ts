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

export const personnelTableFetch = async (req: Request, res: Response): Promise<void> => {

    try {

        let tableData: string[]

        !req.params.query
        ? tableData = await utils.fetchTableData('personnel', req.params.tab)
        : tableData = await utils.fetchTableData('personnel', req.params.tab, req.params.query)

        res.json(tableData)

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
                    borrowed: DateTime.now().toFormat("dd LLLL yyyy"),
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