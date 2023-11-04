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

    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ title: name, status: 500, body: message })

    }

}

export const personnelLoginAuth = async (req: Request, res: Response): Promise<void> => {

    try {

        const { username, password } = req.body
        const queryString = "SELECT * FROM personnel WHERE username = ? AND password = ?"
        const result = await utils.executeDatabaseQuery(queryString, [username, password])

        if (!utils.isQueryResultEmpty(result)) {

            const uuidToken: UUID = uuidv4()

            await utils.modifyAccessToken('add', {
                table: 'personnel',
                column: 'username',
                token: uuidToken,
                identifier: username,
                password: password                
            })
            await utils.delay(500)
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

        } else { 
            
            const title: string = 'Incorrect username or password!'
            const body: string = 'Make sure that everything is typed correctly.'

            res.status(403).json({ title: title, body: body })
        }

    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ title: name, status: 500, body: message });

    }

}

export const personnelTableOverview = async (req: Request, res: Response): Promise<void> => {

    const type: string = "personnel"
    const tab: string = req.params.tab

    try {

        await utils.delay(500)
        res.status(200).json(await utils.fetchOverviewData(type, tab))

    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ title: name, status: 500, body: message });

    }

}

export const personnelTableEntries = async (req: Request, res: Response): Promise<void> => {

    const type: string = "personnel"
    const tab: string = req.params.tab
    const query: string = req.params.query || ''

    try {

        await utils.delay(500)
        res.status(200).json(await utils.fetchTableEntries(type, tab, query))

    } catch (err) {

        const { name, message } = err
        
        console.error(name, message)
        res.status(500).json({ title: name, status: 500, body: message })

    }

}

export const personnelModalData = async (req: Request, res: Response): Promise<void> => {

    let fetchedModalData: string[] = []

    const type: string = req.params.tab

    try {

        const Students = async (): Promise<void> => {

            return new Promise(async (resolve) => {

                const fetchedData = await utils.executeDatabaseQuery(
                    `
                        SELECT
                            id, CONCAT(first_name, ' ', last_name) AS full_name, student_number, 
                            status, borrowed_book, phone_number, email
                        FROM
                            students
                        WHERE
                            status = ?    
                        `,
                    ['Vacant']
                )

                for (const data of Object.values(fetchedData)) {
    
                    const entry =
                    `
                        <div class="entry" data-selected="false">
                            <div class="preview">
                                <h3 class="name">${data['full_name']}</h3>
                                <i class="toggleDropdown fa-solid fa-caret-down"></i>
                            </div>
                            <div class="dropdown" data-hidden="true">
                                <div class="identifier">
                                    <h3>
                                        <span class="heading">Identifier: </span> 
                                        <span class="data">${data['id']}</span>
                                    </h3>
                                </div>
                                <div class="studentNumber">
                                    <h3>
                                        <span class="heading">Student number: </span> 
                                        <span class="data">${data['student_number']}</span>
                                    </h3>
                                </div>
                                <div class="phoneNumber">
                                    <h3>        
                                        <span class="heading">Phone number: </span> 
                                        <span class="data">${data['phone_number']}</span>
                                    </h3>
                                </div>
                                <div class="email">
                                    <h3>        
                                        <span class="heading">Email address: </span>
                                        <span class="data">${data['email']}</span>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    `

                    fetchedModalData.push(entry)
    
                }

                resolve()

            })
            
        }

        const Inventory = async (): Promise<void> => {

            return new Promise(async (resolve) => {

                const fetchedData = await utils.executeDatabaseQuery(
                    `
                        SELECT
                            id, title, status, author, genre, 
                            date_publicized, date_added 
                        FROM
                            books
                        WHERE
                            status = ?    
                        `,
                    ['Available']
                )

                for (const data of Object.values(fetchedData)) {

                    const entry =
                    `
                        <div class="entry" data-selected="false">
                            <div class="preview">
                                <h3 class="name">${data['title']}</h3>
                                <i class="toggleDropdown fa-solid fa-caret-down"></i>
                            </div>
                            <div class="dropdown" data-hidden="true">
                                <div class="identifier">
                                    <h3>    
                                        <span class="heading">Identifier: </span>
                                        <span class="data">${data['id']}</span>
                                    </h3>
                                </div>
                                <div class="genre">
                                    <h3>    
                                        <span class="heading">Genre: </span>
                                        <span class="data">${data['genre']}</span>
                                    </h3>
                                </div>
                                <div class="author">
                                    <h3>    
                                        <span class="heading">Author: </span>
                                        <span class="data">${data['author']}</span>
                                    </h3>
                                </div>
                                <div class="datePublicized">
                                    <h3>
                                        <span class="heading">Publication date: </span>
                                        <span class="data">${data['date_publicized']}</span>
                                    </h3>
                                </div>
                                <div class="dateAdded">
                                    <h3>    
                                        <span class="heading">Inventory date: </span>
                                        ${data['date_added']}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    `

                    fetchedModalData.push(entry)

                }

                resolve()

            })

        }

        switch (type) {

            case 'students': await Students(); break
            case 'inventory': await Inventory(); break

        }

        await utils.delay(500)
        res.status(200).json(fetchedModalData)

    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ title: name, status: 500, body: message })

    }

}

export const personnelModalRegister = async (req: Request, res: Response): Promise<void> => {

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

        await utils.delay(500)
        res.sendStatus(200)

    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ title: name, status: 500, body: message });

    }
}

export const personnelModalEdit = async (req: Request, res: Response): Promise<void> => {

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

        await utils.delay(500)
        res.sendStatus(200)

    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ title: name, status: 500, body: message });

    }

}

export const personnelModalLend = async (req: Request, res: Response): Promise<void> => {

    try {

        const type = req.params.tab
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
                const date: { [ key: string ]: string } = {
                    borrowed: DateTime.now().toFormat("dd MMM yyyy HH:mm"),
                    due: `${DateTime.fromISO(dueDate).toFormat("dd MMM yyyy")} ${DateTime.now().toFormat('HH:mm')}`
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

        Promise.all([ setStudent(), setBook() ])
        await utils.delay(500)
        res.sendStatus(200)

    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ title: name, status: 500, body: message });

    }

}

export const personnelModalDelete = async (req: Request, res: Response): Promise<void> => {

    try {

        let table: string 

        const id: string = req.params.id
        
        switch (req.params.tab) {
        
            case 'inventory': table = 'books'; break;
            case 'students': table = 'students'; break;
            case 'users': table = 'personnel'; break;
        
        }

        await utils.executeDatabaseQuery(`DELETE FROM ${ table } WHERE id = ?`, [ id ])
        await utils.delay(500)
        res.sendStatus(204)

    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ title: name, status: 500, body: message });

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

    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ title: name, status: 500, body: message });

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

    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ error: { name: name, message: message } })

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
        
    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ error: { name: name, message: message } })

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

    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ error: { name: name, message: message } })

    }

}

export const personnelAccountData = async (req: Request, res: Response): Promise<void> => {

    try {

        const token = req.cookies['pData']
        const response: string[] = await utils.executeDatabaseQuery(
            `
                SELECT
                    first_name, role
                FROM
                    personnel
                WHERE
                    access_token = ?
            `, 
            [ token ]
        )
        const data: Object = {

            firstName: response[0]['first_name'],
            role: response[0]['role']


        }

        res.json(data)

    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ error: { name: name, message: message } })

    }

}

export const personnelAccountLogout = async (req: Request, res: Response): Promise<void> => {

    try {

        const token: UUID = req.cookies['pData']

        await utils.modifyAccessToken('remove', {
            table: 'personnel',
            token: token
        })

        res.clearCookie('pMemory').clearCookie('pAccess').clearCookie('pData')
        await utils.delay(500)
        res.sendStatus(200)

    } catch (err) {

        const { name, message } = err

        console.error(name, message)
        res.status(500).json({ error: { name: name, message: message } })

    }

}

export const error = async (_, res: Response): Promise<void> => {

    res.sendFile("error.html", { root: "public/views" })

}