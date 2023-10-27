import { pool } from "../app.js";
import { Response } from "express";
import { UUID } from "crypto";
import { DateTime } from "luxon";

export const delay = async (milliseconds: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export const executeDatabaseQuery = async (query: string, argument?: string | string[] | null, callback?: (result: any) => void): Promise<any> => {

    try {

        if (!callback) {

            const [rows] = await pool.promise().query(query, argument)

            return rows


        } else { pool.query(query, argument, (results) => { callback(results) }) }

    } catch (err) {

        console.error(err.name, err.message)
        throw err

    }
    
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

    try {
    
        return new Promise(async (resolve) => {

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

            resolve()

        })

    } catch (err) {

        console.error(err.name, err.message)
        throw err

    }
    
}

export const validateAccessToken = async (data: { table: string, token: UUID }): Promise<boolean> => {

    try {

        const result = await executeDatabaseQuery(
            `
                SELECT 
                    access_token 
                FROM 
                    ${ data.table } 
                WHERE 
                    access_token = ?`,
                [ data.token ]
        )
        
        return !isQueryResultEmpty(result)

    } catch (err) {

        console.error(err.name, err.message)
        throw err

    }

}

export const fetchAccountData = async (type: string, token: UUID): Promise<object | boolean> => {

    let result: object = {}

    try {

        result = await executeDatabaseQuery(
            `SELECT first_name, last_name, role FROM ${ type } WHERE access_token = ?`,
            [ token ]
        )

        return result[0]

        
    } catch (err) {

        console.error(err.name, err.message)
        throw err

    }
    
}

export const fetchOverviewData = async (type: string, tab: string): Promise<string[]> => {

    let fetchedData: string[] = []

    const Personnel: { [ key: string ]: Function } = {

        Dashboard: async (): Promise<void> => {

            return new Promise(async (resolve) => {
    
                const [ students, books, availableBooks, unavailableBooks ] = await Promise.all([
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                students
                        `
                    ),
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                books
                        `
                    ),
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                books 
                            WHERE 
                                status = "Available"
                        `
                    ),
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                books 
                            WHERE 
                                status = "Past Due" OR status = "Borrowed"
                        `
                    )
                ])
                const first: string =
                `
                    <div class="header">
                        <h2>Registered</h2>
                    </div>
                    <h1>
                        ${ students[0]['count'] }
                        ${ 
                            students[0]['count'] === 1 
                            ? 'student' 
                            : 'students' 
                        }
                    </h1>    
                `
                const second: string =
                `
                    <div class="header">
                        <h2>Available</h2>
                        <h3>
                            ${ Math.floor(availableBooks[0]['count'] / books[0]['count'] * 100) }%
                            of books
                        </h3>
                    </div>
                    <h1>
                        ${ availableBooks[0]['count'] }
                        ${ 
                            availableBooks[0]['count'] === 1 
                            ? 'book' 
                            : 'books' 
                        }
                    </h1>
                `
                const third: string =
                `
                    <div class="header">
                        <h2>Unavailable</h2>
                        <h3>
                            ${ Math.floor(unavailableBooks[0]['count'] / books[0]['count'] * 100) }%
                            of books
                        </h3>
                    </div>
                    <h1>
                        ${ unavailableBooks[0]['count'] }
                        ${ 
                            unavailableBooks[0]['count'] === 1 
                            ? 'book' 
                            : 'books' 
                        }
                    </h1>
                `
    
                fetchedData = [ first, second, third ]
    
                resolve()
    
            })
    
        },
        Inventory: async (): Promise<void> => {
    
            return new Promise(async (resolve) => {
    
                const [ books, available, borrowed, due ] = await Promise.all([
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                books
                        `
                    ),
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                books 
                            WHERE 
                                status = "Available"
                        `
                    ),
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                books 
                            WHERE 
                                status = "Borrowed"
                        `
                    ),
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                books 
                            WHERE 
                                status = "Past Due"
                        `
                    )    
                ])
                const first: string =
                `
                    <div class="header">
                        <h2>Available</h2>
                        <h3>
                            ${ Math.floor(available[0]['count'] / books[0]['count'] * 100) }%
                            of books
                        </h3>
                    </div>
                    <h1>
                        ${ available[0]['count'] }
                        ${ 
                            available[0]['count'] === 1 
                            ? 'book' 
                            : 'books' 
                        }
                    </h1>
                `
                const second: string =
                `
                    <div class="header">
                        <h2>Borrowed</h2>
                        <h3>
                            ${ Math.floor(borrowed[0]['count'] / books[0]['count'] * 100) }%
                            of books
                        </h3>
                    </div>
                    <h1>
                        ${ borrowed[0]['count'] }
                        ${ 
                            borrowed[0]['count'] === 1 
                            ? 'book' 
                            : 'books' 
                        }
                    </h1>
                `
                const third: string =
                `
                    <div class="header">
                        <h2>Due</h2>
                        <h3>
                            ${ Math.floor(due[0]['count'] / books[0]['count'] * 100) }%
                            of books
                        </h3>
                    </div>
                    <h1>
                        ${ due[0]['count'] }
                        ${ 
                            due[0]['count'] === 1 
                            ? 'book' 
                            : 'books' 
                        }
                    </h1>
                `
    
                fetchedData = [ first, second, third ]
    
                resolve()
    
            })
    
        },
        Students: async (): Promise<void> => {
    
            return new Promise(async (resolve) => {
    
                const [ students, vacant, borrower, due ] = await Promise.all([
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                students
                        `
                    ),
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                books 
                            WHERE 
                                status = "Available"
                        `
                    ),
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                books 
                            WHERE 
                                status = "Borrowed"
                        `
                    ),
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                books
                            WHERE 
                                status = "Past Due"
                        `
                    )   
                ])
                const first: string =
                `
                    <div class="header">
                        <h2>Vacant</h2>
                        <h3>
                            ${ Math.floor(vacant[0]['count'] / students[0]['count'] * 100) }%
                            of students
                        </h3>
                    </div>
                    <h1>
                        ${ vacant[0]['count'] }
                        ${ 
                            vacant[0]['count'] === 1 
                            ? 'student' 
                            : 'students'
                        }
                    </h1>
                `
                const second: string =
                `
                    <div class="header">
                        <h2>Borrower</h2>
                        <h3>
                            ${ Math.floor(borrower[0]['count'] / students[0]['count'] * 100) }%
                            of students
                        </h3>
                    </div>
                    <h1>
                        ${ borrower[0]['count'] }
                        ${ 
                            borrower[0]['count'] === 1 
                            ? 'student' 
                            : 'students'
                        }
                    </h1>
                `
                const third: string =
                `
                    <div class="header">
                        <h2>Due</h2>
                        <h3>
                            ${ Math.floor(due[0]['count'] / students[0]['count'] * 100) }%
                            of students
                        </h3>
                    </div>
                    <h1>
                        ${ due[0]['count'] }
                        ${ 
                            due[0]['count'] === 1 
                            ? 'student' 
                            : 'students'
                        }
                    </h1>
                `
    
                fetchedData = [ first, second, third ]
    
                resolve()
    
            })
            
        },
        Users: async (): Promise<void> => {
    
            return new Promise(async (resolve) => {
    
                const [ personnel, IT, librarian ] = await Promise.all([
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                personnel
                        `
                    ),
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                personnel 
                            WHERE 
                                role = "IT"
                        `
                    ),
                    executeDatabaseQuery(
                        `
                            SELECT 
                                COUNT(*) AS count 
                            FROM 
                                personnel 
                            WHERE 
                                role = "Librarian"
                        `
                    )
                ])
                const first: string =
                `
                    <div class="header">
                        <h2>Registered</h2>
                        </h3>
                    </div>
                    <h1>
                        ${ personnel[0]['count'] } 
                        ${ 
                            personnel[0]['count'] === 1 
                            ? 'staff'
                            : 'staffs'
                        }
                    </h1>
                `
                const second: string =
                `
                    <div class="header">
                        <h2>IT</h2>
                        <h3>
                            ${ Math.floor(IT[0]['count'] / personnel[0]['count'] * 100) }%
                            of staffs
                        </h3>
                    </div>
                    <h1>
                        ${ IT[0]['count'] } 
                        ${ 
                            IT[0]['count'] === 1 
                            ? 'staff'
                            : 'staffs'
                        }
                    </h1>
                `
                const third: string =
                `
                    <div class="header">
                        <h2>Librarian</h2>
                        <h3>
                            ${ Math.floor(librarian[0]['count'] / personnel[0]['count'] * 100) }%
                            of staffs
                        </h3>
                    </div>
                    <h1>
                        ${ librarian[0]['count'] }
                        ${ 
                            librarian[0]['count'] === 1
                            ? 'staff'
                            : 'staffs'
                         }
                    </h1>  
                `
    
                fetchedData = [ first, second, third ]
    
                resolve()
                
            })
    
        }

    }

    const Student: { Dashboard: Function } = {

        Dashboard: async (): Promise<void> => {

            return new Promise(async (resolve) => {

                resolve()

            })

        }

    }
    
    try {

        switch (tab) {

            case 'dashboard': 
                type === 'personnel' 
                ? await Personnel.Dashboard() 
                : await Student.Dashboard(); 
                break;
            case 'inventory': await Personnel.Inventory(); break;
            case 'students': await Personnel.Students(); break;
            case 'users': await Personnel.Users(); break;

        }

        return fetchedData

    } catch (err) {

        console.error(err.name, err.message)
        throw err

    }

}

export const fetchTableData = async (type: string, tab: string, query?: string): Promise<string[]> => {

    let fetchedTableData: string[] = []

    const Personnel: { [ key: string ]: Function } = {

        Dashboard: (): Promise<void> => {

            return new Promise(async (resolve) => {

                !query
                ? fetchedTableData = await executeDatabaseQuery(
                    `
                    SELECT 
                        id, title, status, borrower, borrower_number, 
                        date_borrowed, date_due, date_publicized, 
                        date_added
                    FROM 
                        books
                    `
                )
                : fetchedTableData = await executeDatabaseQuery(
                    `
                    SELECT 
                        id, title, status, borrower, borrower_number, 
                        date_borrowed, date_due, date_publicized, 
                        date_added
                    FROM 
                        books
                    WHERE
                        LOWER(title) LIKE LOWER('%${ query }%') 
                        OR LOWER(status) LIKE LOWER('%${ query }%')
                        OR LOWER(borrower) LIKE LOWER('%${ query }%')
                        OR LOWER(borrower_number) LIKE LOWER('%${ query }%')
                        OR LOWER(date_borrowed) LIKE LOWER('%${ query }%')
                        OR LOWER(date_due) LIKE LOWER('%${ query }%')
                        OR LOWER(date_publicized) LIKE LOWER('%${ query }%')
                        OR LOWER(date_added) LIKE LOWER('%${ query }%')
                    `
                )
    
                resolve()
    
            })

        },
        Inventory: (): Promise<void> => {

            return new Promise(async (resolve) => {

                !query
                ? fetchedTableData = await executeDatabaseQuery(
                    `
                    SELECT
                        id, title, status, author, genre, 
                        date_publicized, date_added 
                    FROM
                        books
                    `
                )
                : fetchedTableData = await executeDatabaseQuery(
                    `
                    SELECT
                        id, title, status, author, genre, 
                        date_publicized, date_added 
                    FROM
                        books
                    WHERE
                        LOWER(title) LIKE LOWER('%${ query }%')
                        OR LOWER(status) LIKE LOWER('%${ query }%')
                        OR LOWER(author) LIKE LOWER('%${ query }%')
                        OR LOWER(genre) LIKE LOWER('%${ query }%')
                        OR LOWER(date_publicized) LIKE LOWER('%${ query }%')
                        OR LOWER(date_added) LIKE LOWER('%${ query }%')
                    `
                )
    
                resolve()
    
            })

        },
        Students: (): Promise<void> => {

            return new Promise(async (resolve) => {

                !query
                ? fetchedTableData = await executeDatabaseQuery(
                    `
                    SELECT
                        id, CONCAT(first_name, ' ', last_name) AS full_name, student_number, 
                        status, borrowed_book, phone_number, email
                    FROM
                        students
                    `
                )
                : fetchedTableData = await executeDatabaseQuery(
                    `
                    SELECT
                        id, CONCAT(first_name, ' ', last_name) AS full_name, student_number, 
                        status, borrowed_book, phone_number, email
                    FROM
                        students
                    WHERE
                        LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER('%${ query }%')
                        OR LOWER(student_number) LIKE LOWER('%${ query }%')
                        OR LOWER(status) LIKE LOWER('%${ query }%')
                        OR LOWER(borrowed_book) LIKE LOWER('%${ query }%')
                        OR LOWER(phone_number) LIKE LOWER('%${ query }%')
                        OR LOWER(email) LIKE LOWER('%${ query }%')
                    `
                )
    
                resolve()
    
            })

        },
        Users: (): Promise<void> => {

            return new Promise(async (resolve) => {

                !query
                ? fetchedTableData = await executeDatabaseQuery(
                    `
                    SELECT
                        id, CONCAT(first_name, ' ', last_name) AS full_name, username, role
                    FROM
                        personnel
                    `
                )
                : fetchedTableData = await executeDatabaseQuery(
                    `
                    SELECT
                        id, CONCAT(first_name, ' ', last_name) AS full_name, username, role
                    FROM
                        personnel
                    WHERE
                        LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER('%${ query }%')
                        OR LOWER(last_name) LIKE LOWER('%${ query }%')
                        OR LOWER(username) LIKE LOWER('%${ query }%')
                        OR LOWER(role) LIKE LOWER('%${ query }%')
                    `
                )
    
                resolve()
    
            })

        }

    }

    const Student: { Dashboard: Function } = {

        Dashboard: (): Promise<void> => {

            return new Promise(async (resolve) => {

                // TODO: idjot.
                resolve()

            })

        }

    }

    try {

        switch (tab) {

            case 'dashboard': 
                type === 'personnel' 
                ? await Personnel.Dashboard() 
                : await Student.Dashboard(); 
                break;
            case 'inventory': await Personnel.Inventory(); break;
            case 'students': await Personnel.Students(); break;
            case 'users': await Personnel.Users(); break;

        }

        return fetchedTableData

    } catch (err) {

        console.error(err.name, err.message)
        throw err

    }

}

export const fetchTableEntries = async (type: string, tab: string, query?: string): Promise<string[]> => {

    let fetchedTableEntries: string[] = []

    const Personnel: { [ key: string ]: Function } = {

        Dashboard: (): Promise<void> => {

            return new Promise(async (resolve) => {

                const fetchedTableData = await fetchTableData('personnel', 'dashboard')

                for (const data of Object.values(fetchedTableData)) {

                    const entry =
                    `
                        <div class="entry" data-identifier="${data['id'] }">
                            <i style="visibility: 
                            ${
                                data['status'] === 'Past Due'
                                ? 'visible'
                                : 'hidden'
                            }
                            ;" class="warning fa-solid fa-triangle-exclamation"></i>
                            <div class="title">
                                <h2>
                                    ${ data['title'] }
                                </h2>
                            </div>
                            <div class="status">
                                ${ 
                                    data['status'] === 'Available'
                                    ? '<h2>Available</h2>'
                                    : 
                                    `
                                        <h2>Unavailable</h2>
                                        <h3>${ data['status'] }</h3>
                                    `
                                 }
                            </div>
                            <div class="borrower">
                                <h2>
                                    ${
                                        data['borrower'] === null 
                                        ? `<h2>- </h2>` 
                                        : 
                                        `
                                            <h2>${ data['borrower'] }</h2>
                                            <h3>${ data['borrower_number'] }</h3>
                                        `
                                    }
                                </h2>
                            </div>
                            <div class="borrowDate">
                                <h2>
                                    ${
                                        data['date_borrowed'] === null 
                                        ? '-' 
                                        : data['date_borrowed']
                                    }
                                </h2>
                            </div>
                            <div class="dueDate">
                                <h2>
                                    ${
                                        data['date_due'] === null
                                        ? `<h2>-</h2>`
                                        :  
                                        `
                                            <h2>${ data['date_due'] }</h2>
                                            <h3>${ getDueStatus(data['date_due']) }</h3>
                                        `
                                    }
                                </h2>
                            </div>
                            <div class="publicationDate">
                                <h2>
                                    ${ data['date_publicized'] }
                                </h2>
                            </div>
                            <div class="acquisitionDate">
                                <h2>
                                    ${ data['date_added'] }
                                </h2>
                            </div>
                            <div class="actions">
                                <i data-disabled="false" class="pDashboardActionsView fa-regular fa-arrow-up-right-from-square"></i>
                            </div>

                        </div>
                    `

                    fetchedTableEntries.push(entry)
                
                }

                resolve()

            })

        },

        Inventory: (): Promise<void> => {

            return new Promise(async (resolve) => {

                const fetchedTableData = await fetchTableData('personnel', 'inventory', query)

                for (const data of Object.values(fetchedTableData)) {

                    const entry =
                    `
                        <div class="entry" data-identifier="${ data['id'] }">
                            <i style="visibility: 
                                ${ 
                                    data['status'] === 'Past Due'
                                    ? 'visible'
                                    : 'hidden'
                                }
                                ;" class="warning fa-solid fa-triangle-exclamation">
                            </i>
                            <div class="title">
                                <h2>
                                    ${ data['title'] }
                                </h2>
                            </div>
                            <div class="status">
                                    ${
                                        data['status'] === 'Available' 
                                        ? `<h2>${data['status']}</h2>` 
                                        : `<h2>Unavailable</h2><h3>${ data['status'] }</h3>`
                                    }
                            </div>
                            <div class="author">
                                <h2>
                                    ${ data['author'] }
                                </h2>
                            </div>
                            <div class="genre">
                                <h2>
                                    ${ data['genre'] }
                                </h2>
                            </div>
                            <div class="publicationDate">
                                <h2>
                                    ${ data['date_publicized'] }
                                </h2>
                            </div>
                            <div class="acquisitionDate">
                                <h2>
                                    ${ data['date_added'] }
                                </h2>
                            </div>
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

        },

        Students: (): Promise<void> => {

            return new Promise(async (resolve) => {

                const fetchedTableData = await fetchTableData('personnel', 'students', query)

                for (const data of Object.values(fetchedTableData)) {
                
                    const entry =
                    `
                    <div class="entry" data-identifier="${ data['id'] }">
                        <i style="visibility: 
                            ${ 
                                data['status'] === 'Past Due'
                                ? 'visible'
                                : 'hidden'
                            }
                            ;" class="warning fa-solid fa-triangle-exclamation">
                        </i>
                        <div class="name">
                            <h2>
                                ${ data['full_name'] }
                            </h2>
                        </div>
                        <div class="studentNumber">
                            <h2>
                                ${ data['student_number'] }
                            </h2>
                        </div>
                        <div class="status">
                            ${
                                data['status'] === 'Vacant' 
                                ? `<h2>${data['status']}</h2>` 
                                : `<h2>Unavailable</h2><h3>${ data['status'] }</h3>`
                            }
                        </div>
                        <div class="borrowedBook">
                            <h2>
                                ${
                                    data['borrowed_book'] === null 
                                    ? '-' 
                                    : data['borrowed_book']
                                }
                            </h2>
                        </div>
                        <div class="phoneNumber">
                            <h2>
                                ${ data['phone_number'] }
                            </h2>
                        </div>
                        <div class="emailAddress">
                            <h2>
                                ${ data['email'] }
                            </h2>
                        </div>
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

        },

        Users: (): Promise<void> => {

            return new Promise(async (resolve) => {

                const fetchedTableData = await fetchTableData('personnel', 'users', query)

                for (const data of Object.values(fetchedTableData)) {

                    const entry =
                    `
                    <div class="entry" data-identifier="${ data['id'] }">
                        <i style="visibility: hidden;" class="warning fa-solid fa-triangle-exclamation"></i>
                        <div class="fullName">
                            <h2>
                                ${ data['full_name'] }
                            </h2>
                        </div>
                        <div class="username">
                            <h2>
                                ${ data['username'] }
                            </h2>
                        </div>
                        <div class="role">
                            <h2>
                                ${ data['role'] }
                            </h2>
                        </div>
                        <div class="privilege">
                            ${
                                data['role'] === 'Librarian'
                                ? 
                                `
                                    <h3>Dashboard</h3>
                                    <h3>Inventory</h3>
                                    <h3>Students</h3>
                                `
                                : 
                                `
                                    <h3>Dashboard</h3>
                                    <h3>Inventory</h3><h3>Students</h3>
                                    <h3>Users</h3>
                                `
                            }
                        </div>
                        <div class="emailAddress">
                            <h2>
                                ${ data['username'] }
                            </h2>
                            <h3>@feuroosevelt.edu.ph</h3>
                        </div>
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

    }

    const Student: { [ key: string ]: Function } = {

        Dashboard: (): Promise<void> => {

            return new Promise(async (resolve) => {

                resolve()

            })
            
        }

    }
    
    try {

        switch (tab) {

            case 'dashboard': 
                type === 'personnel' 
                ? await Personnel.Dashboard() 
                : await Student.Dashboard()
                break;
            case 'inventory': await Personnel.Inventory(); break;
            case 'students': await Personnel.Students(); break;
            case 'users': await Personnel.Users(); break;

        }

        return fetchedTableEntries

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

                            sqlString = 
                            `
                                title = ?, 
                                author = ?, 
                                genre = ?, 
                                date_publicized = ?, 
                                date_added = ?
                            `
                            sqlArgs = 'id = ?'
                            sqlData = 
                            [ 
                                data['title'], data['author'], data['genre'], 
                                DateTime.fromFormat(data['dPublicized'], 'yyyy-MM-dd').toFormat(dateFormat), 
                                DateTime.now().toFormat(dateFormat), data['id']
                            ]
    
                        } else if (tab === 'students') {

                            const splitName = data['studentName'].split(' ')
                            let firstName: string
                            let lastName: string

                            (splitName.length > 2)
                            ? (firstName = `${ splitName[0] } ${splitName[1]}`, lastName = splitName[2])
                            : (firstName = splitName[0], lastName = splitName[1])

                            sqlString = 
                            `
                                student_number = ?, 
                                phone_number = ?, 
                                email = ?, 
                                first_name = ?, 
                                last_name = ?
                            `
                            sqlArgs = 'id = ?'
                            sqlData = [data['studentNumber'], data['phoneNumber'], data['email'], firstName, lastName, data['id']]
            
                        } else if (tab === 'personnel') {

                            const splitName = data['personnelName'].split(' ')
                            let firstName: string
                            let lastName: string

                            (splitName.length > 2)
                            ? (firstName = `${ splitName[0] } ${splitName[1]}`, lastName = splitName[2])
                            : (firstName = splitName[0], lastName = splitName[1])
    
                            sqlString = 
                            `
                                first_name = ?, 
                                last_name = ?, 
                                username = ?, 
                                role = ?
                            `
                            sqlArgs = 'id = ?'
                            sqlData = [firstName, lastName, data['username'], data['role'], data['id']]
            
                        }
    
                        resolve()
    
                    })
    
                }

                await setVariablesData()
                await executeDatabaseQuery(
                `
                    UPDATE 
                        ${ tab } 
                    SET 
                        ${ sqlString } 
                    WHERE 
                        ${ sqlArgs }
                `, sqlData
                )
    
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
    
        } catch (err) {
    
            console.error(err.name, err.message)
            throw err
            
        }

        resolve()

    })

}

export const isQueryResultEmpty = (queryResult: any) => {

    return !(Array.isArray(queryResult) && queryResult.length > 0)

}

export const getDueStatus = (pDueDate: string): string => {

    const dueDate: DateTime = DateTime.fromFormat(pDueDate, 'dd MMM yyyy HH:mm')
    const currentDate: DateTime = DateTime.now()
    const diffDate: number = Math.floor(dueDate.diff(currentDate, 'days').toObject().days)
    const absDiffDate: number = Math.abs(diffDate)

    return diffDate === 0
    ? 'Due today' 
    : diffDate < 0
        ? `${ absDiffDate } ${ absDiffDate === 1 ? 'day' : 'days' } past due`
        : `${ absDiffDate } ${ absDiffDate === 1 ? 'day' : 'days' } remaining`

}