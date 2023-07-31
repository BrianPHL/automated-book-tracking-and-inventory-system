import { DateTime } from "../../../node_modules/luxon/build/es6/luxon.js"

// * export function status: complete
export const checkFormInputs = async (form: HTMLFormElement) => {

    const formInputs: NodeListOf<HTMLInputElement> = form.querySelectorAll('input');
    const formSubmit: HTMLButtonElement = form.querySelector('button[type="submit"]');

    for (const formInput of formInputs) {

        if (formInput.value.trim() === '') {
        
            formSubmit.disabled = true;
            return;

        }

    }

    formSubmit.disabled = false;

}

// * export function status: complete
export const errorPrompt = async (data: object): Promise<URLSearchParams> => {

    const params = new URLSearchParams()

    for (let [key, value] of Object.entries(data)) { params.append(key, value) }
    
    return params

}

// * export function status: complete
export const manipulateURL = async (data: object) => {

    const params = new URLSearchParams()
    
    for (let [key, value] of Object.entries(data)) { params.append(key, value) }
    
    const queryString = params.toString()
    window.history.pushState(data, document.title, `?${queryString}`)


}

// * export function status: complete
export const sanitizeURL = async () => {

    const href = window.location.href

    if (href.split("?").length > 1) {

        const previousUrl = href.split("?")[0]
        history.pushState({}, document.title, previousUrl);

    }

}

// * export function status: complete
export const getPreferredTheme = (): boolean => {

    return window.matchMedia('(prefers-color-scheme: dark)').matches

}

// * export function status: complete
export const setPreferredTheme = (cb: (cbData: { savedTheme?: string, preferredTheme: boolean }) => void): void => {

    const savedTheme: string = localStorage.getItem('theme')
    const preferredTheme: boolean = getPreferredTheme()

    cb({ savedTheme: savedTheme, preferredTheme: preferredTheme })

}

// * export function status: complete
export const setLightTheme = (): void => {

    const htmlElement: HTMLElement = document.querySelector('html')
    const bodyElement: HTMLBodyElement = htmlElement.querySelector('body')


    if (htmlElement.getAttribute('data-site') === 'dashboard') {

        const header: HTMLElement = bodyElement.querySelector('header')
        const nav: HTMLElement = header.querySelector('nav')
        const navActions: HTMLDivElement = nav.querySelector('.actions')
        const navActionsTheme: HTMLButtonElement = navActions.querySelector('.themeSwitch')

        navActionsTheme.innerHTML = 
        `
            <i class="fa-regular fa-moon"></i>
            <h2>Dark mode</h2>
        `

    }

    htmlElement.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', 'light')

}

// * export function status: complete
export const setDarkTheme = () => {

    const htmlElement: HTMLElement = document.querySelector('html')
    const bodyElement: HTMLBodyElement = htmlElement.querySelector('body')

    if (htmlElement.getAttribute('data-site') === 'dashboard') {

        const header: HTMLElement = bodyElement.querySelector('header')
        const nav: HTMLElement = header.querySelector('nav')
        const navActions: HTMLDivElement = nav.querySelector('.actions')
        const navActionsTheme: HTMLButtonElement = navActions.querySelector('.themeSwitch')

        navActionsTheme.innerHTML = 
        `
            <i class="fa-regular fa-sun-bright"></i>
            <h2>Light mode</h2>
        `

    }

    htmlElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')

}

// * export function status: complete
export const getURLData = async (url: string, identifier: string): Promise<string> => {

    return new URLSearchParams(url).get(identifier)

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

export const retrieveDashboardData = async (type: string, tab: string) => { 

    try {

        const response: Response = await fetch(`/${ type }/${ tab }/retrieve`, { 
            
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }

        })

        return response
    
    } catch(err) { 
        
        console.error(err.name, err.message)
        throw err
    
    } 
    
}

export const setDashboardData = async (type: string, tab?: string) => {

    try {

        if (!tab) { tab = 'dashboard' }

        const response: Response = await retrieveDashboardData(type, tab)
        const responseBody: JSON = await response.json()
        const accountData: JSON = responseBody['accountData']
        const overviewData: JSON = responseBody['overviewData']
        const tableData: JSON = responseBody['tableData']

        const setAccountData = async (): Promise<void> => {

            return new Promise((resolve) => {

                const header = document.querySelector('header')
                const headerInfo = header.querySelector('.info')
                const headerInfoName = headerInfo.querySelector('.name')
                const headerInfoRole = headerInfo.querySelector('.role')
                
                headerInfoName.textContent = `${ accountData['first_name'] } ${ accountData['last_name'] }`
                headerInfoRole.textContent = accountData['role']

                resolve()

            })

        }

        const setPersonnelDashboardData = async (): Promise<void> => {

            return new Promise(async (resolve) => {

                const main = document.querySelector('main[data-tab="dashboard"]')
                const setOverviewRegistered = async (): Promise<void> => {
                    
                    return new Promise((resolve) => {
                        
                        const overview = main.querySelector('.overview')
                        const registeredCount = overview.querySelector('.registered > h1 > .count')

                        registeredCount.textContent = overviewData['studentCount']
                        
                        resolve()

                    })
                    
                }
                const setOverviewAvailable = async (): Promise<void> => {

                    return new Promise((resolve) => {

                        const overview = main.querySelector('.overview')
                        const available = overview.querySelector('.available')
                        const availableCount = available.querySelector('h1 > .count')
                        const availableHeaderCount = available.querySelector('.header > h3 > .count')
                        const availableHeaderPercentage = available.querySelector('.header > h3 > .percentage')
        
                        availableCount.textContent = overviewData['availableBookCount']
                        availableHeaderCount.textContent = overviewData['bookCount']
                        availableHeaderPercentage.textContent = overviewData['availableBookCountPercentage']

                        resolve()

                    })

                }
                const setOverviewUnavailable = async (): Promise<void> => {

                    return new Promise((resolve) => {

                        const overview = main.querySelector('.overview')
                        const unavailable = overview.querySelector('.unavailable')
                        const unavailableCount = unavailable.querySelector('h1 > .count')
                        const unavailableHeaderCount = unavailable.querySelector('.header > h3 > .count')
                        const unavailableHeaderPercentage = unavailable.querySelector('.header > h3 > .percentage')
        
                        unavailableCount.textContent = overviewData['unavailableBookCount']
                        unavailableHeaderCount.textContent = overviewData['bookCount']
                        unavailableHeaderPercentage.textContent = overviewData['unavailableBookCountPercentage']

                        resolve()

                    })

                }
                const setTableData = async (): Promise<void> => {

                    return new Promise(async (resolve) => {

                        const table = main.querySelector('.table')
                        
                        const setPaginationData = async (): Promise<void> => {

                            return new Promise((resolve) => {

                                const pagination = table.querySelector('.data > .pagination')
                                const paginationMax = pagination.querySelector('.maxCount')

                                paginationMax.textContent = overviewData['bookCount']

                                resolve()

                            })

                        }
                        const setEntriesData = async (): Promise<void> => {

                            return new Promise((resolve) => {

                                const entries = table.querySelector('.data > .entries')

                                Object.values(tableData).forEach(async (data) => {
                                    
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
                                    <div class="entry">
                                        <i style="visibility: ${ visibility };" class="warning fa-solid fa-triangle-exclamation"></i>
                                        <div class="title"><h2>${ title }</h2></div>
                                        <div class="status">${ status }</div>
                                        <div class="borrower">${ borrowerAndBorrowerNumber }</div>
                                        <div class="borrowDate">${ borrowDateAndDuration }</div>
                                        <div class="dueDate"><h2>${ dueDate }</h2></div>
                                        <div class="publicationDate"><h2>${ publicationDate }</h2></div>
                                        <div class="acquisitionDate"><h2>${ acquisitionDate }</h2></div>
                                        <div class="actions">
                                            <i class="fa-regular fa-message"></i>
                                            <i class="fa-regular fa-pen-to-square"></i>
                                        </div>
                                    </div>
                                    `

                                    entries.innerHTML += entry
        
                                })

                                resolve()

                            })

                        }

                        await setPaginationData()
                        await setEntriesData()

                        resolve()

                    })

                }
                
                await setAccountData()
                await setOverviewRegistered()
                await setOverviewAvailable()
                await setOverviewUnavailable()
                await setTableData()

                resolve()

            })

        }

        const setPersonnelInventoryData = async (): Promise<void> => {

            return new Promise(async (resolve) => {

                const main = document.querySelector('main[data-tab="inventory"]')
                const setOverviewAvailable = async (): Promise<void> => {

                    return new Promise((resolve) => {

                        const overview = main.querySelector('.overview')
                        const available = overview.querySelector('.available')
                        const availableCount = available.querySelector('h1 > .count')
                        const availableHeaderCount = available.querySelector('.header > h3 > .count')
                        const availableHeaderPercentage = available.querySelector('.header > h3 > .percentage')
        
                        availableCount.textContent = overviewData['availableBookCount']
                        availableHeaderCount.textContent = overviewData['bookCount']
                        availableHeaderPercentage.textContent = overviewData['availableBookCountPercentage']

                        resolve()

                    })

                }
                const setOverviewBorrowed = async (): Promise<void> => {

                    return new Promise((resolve) => {

                        const overview = main.querySelector('.overview')
                        const borrowed = overview.querySelector('.borrowed')
                        const borrowedCount = borrowed.querySelector('h1 > .count')
                        const borrowedHeaderCount = borrowed.querySelector('.header > h3 > .count')
                        const borrowedHeaderPercentage = borrowed.querySelector('.header > h3 > .percentage')
        
                        borrowedCount.textContent = overviewData['borrowedBookCount']
                        borrowedHeaderCount.textContent = overviewData['bookCount']
                        borrowedHeaderPercentage.textContent = overviewData['borrowedBookCountPercentage']

                        resolve()

                    })

                }
                const setOverviewDue = async (): Promise<void> => {

                    return new Promise((resolve) => {

                        const overview = main.querySelector('.overview')
                        const due = overview.querySelector('.pastDue')
                        const dueCount = due.querySelector('h1 > .count')
                        const dueHeaderCount = due.querySelector('.header > h3 > .count')
                        const dueHeaderPercentage = due.querySelector('.header > h3 > .percentage')
        
                        dueCount.textContent = overviewData['dueBookCount']
                        dueHeaderCount.textContent = overviewData['bookCount']
                        dueHeaderPercentage.textContent = overviewData['dueBookCountPercentage']

                        resolve()

                    })

                }
                const setTableData = async (): Promise<void> => {

                    return new Promise(async (resolve) => {

                        const table = main.querySelector('.table')

                        const setPaginationData = async (): Promise<void> => {

                            return new Promise((resolve) => {

                                const pagination = table.querySelector('.data > .pagination')
                                const paginationMax = pagination.querySelector('.maxCount')

                                paginationMax.textContent = overviewData['bookCount']

                                resolve()

                            })

                        }
                        const setEntriesData = async (): Promise<void> => {
                            
                            return new Promise((resolve) => {

                                const entries = table.querySelector('.data > .entries')

                                Object.values(tableData).forEach(async (data) => {
                                    
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
                                    <div class="entry">
                                        <i style="visibility: ${ visibility };" class="warning fa-solid fa-triangle-exclamation"></i>
                                        <div class="title"><h2>${ title }</h2></div>
                                        <div class="status"><h2>${ status }</h2></div>
                                        <div class="author"><h2>${ author }</h2></div>
                                        <div class="genre"><h2>${ genre }</h2></div>
                                        <div class="publicationDate"><h2>${ publicationDate }</h2></div>
                                        <div class="acquisitionDate"><h2>${ acquisitionDate }</h2></div>
                                        <div class="actions">
                                            <i class="fa-regular fa-arrow-right-from-arc"></i>
                                            <i class="fa-regular fa-message"></i>
                                            <i class="fa-regular fa-pen-to-square"></i>
                                        </div>
                                    </div>
                                    `

                                    entries.innerHTML += entry
        
                                })

                                resolve()

                            })

                        }

                        await setPaginationData()
                        await setEntriesData()

                        resolve()

                    })

                }

                await setOverviewAvailable()
                await setOverviewBorrowed()
                await setOverviewDue()
                await setTableData()

                resolve()

            })

        }

        const setPersonnelStudentsData = async (): Promise<void> => {

            return new Promise(async (resolve) => {

                const main = document.querySelector('main[data-tab="students"]')
                const setOverviewVacant = async (): Promise<void> => {

                    return new Promise((resolve) => {

                        const overview = main.querySelector('.overview')
                        const vacant = overview.querySelector('.vacant')
                        const vacantCount = vacant.querySelector('h1 > .count')
                        const vacantHeaderCount = vacant.querySelector('.header > h3 > .count')
                        const vacantHeaderPercentage = vacant.querySelector('.header > h3 > .percentage')
        
                        vacantCount.textContent = overviewData['vacantStudentCount']
                        vacantHeaderCount.textContent = overviewData['studentCount']
                        vacantHeaderPercentage.textContent = overviewData['vacantStudentCountPercentage']

                        resolve()

                    })

                }
                const setOverviewBorrower = async (): Promise<void> => {
                    
                    return new Promise((resolve) => {

                        const overview = main.querySelector('.overview')
                        const borrower = overview.querySelector('.borrower')
                        const borrowerCount = borrower.querySelector('h1 > .count')
                        const borrowerHeaderCount = borrower.querySelector('.header > h3 > .count')
                        const borrowerHeaderPercentage = borrower.querySelector('.header > h3 > .percentage')
        
                        borrowerCount.textContent = overviewData['borrowerStudentCount']
                        borrowerHeaderCount.textContent = overviewData['studentCount']
                        borrowerHeaderPercentage.textContent = overviewData['borrowerStudentCountPercentage']

                        resolve()

                    })

                }
                const setOverviewDue = async (): Promise<void> => {
                    
                    return new Promise((resolve) => {

                        const overview = main.querySelector('.overview')
                        const due = overview.querySelector('.pastDue')
                        const dueCount = due.querySelector('h1 > .count')
                        const dueHeaderCount = due.querySelector('.header > h3 > .count')
                        const dueHeaderPercentage = due.querySelector('.header > h3 > .percentage')
        
                        dueCount.textContent = overviewData['dueStudentCount']
                        dueHeaderCount.textContent = overviewData['studentCount']
                        dueHeaderPercentage.textContent = overviewData['dueStudentCountPercentage']

                        resolve()

                    })

                }
                const setTableData = async (): Promise<void> => {

                    return new Promise(async (resolve) => {

                        const table = main.querySelector('.table')

                        const setPaginationData = async (): Promise<void> => {

                            return new Promise((resolve) => {

                                const pagination = table.querySelector('.data > .pagination')
                                const paginationMax = pagination.querySelector('.maxCount')

                                paginationMax.textContent = overviewData['studentCount']

                                resolve()

                            })

                        }
                        const setEntriesData = async (): Promise<void> => {
                            
                            return new Promise((resolve) => {

                                const entries = table.querySelector('.data > .entries')

                                Object.values(tableData).forEach(async (data) => {

                                    const studentName = `${data['first_name']} ${data['last_name']}`
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
                                    <div class="entry">
                                        <i style="visibility: ${ visibility };" class="warning fa-solid fa-triangle-exclamation"></i>
                                        <div class="name"><h2>${ studentName }</h2></div>
                                        <div class="studentNumber"><h2>${ studentNumber }</h2></div>
                                        <div class="status">${ studentStatus }</div>
                                        <div class="borrowedBook"><h2>${ borrowedBook }</h2></div>
                                        <div class="phoneNumber"><h2>${ phoneNumber }</h2></div>
                                        <div class="emailAddress"><h2>${ emailAddress }</h2></div>
                                        <div class="actions">
                                            <i class="fa-regular fa-message"></i>
                                            <i class="fa-regular fa-pen-to-square"></i>
                                            <i class="fa-regular fa-xmark"></i>
                                        </div>
                                    </div>
                                    `

                                    entries.innerHTML += entry
        
                                })

                                resolve()

                            })

                        }

                        await setPaginationData()
                        await setEntriesData()

                        resolve()

                    })

                }

                await setAccountData()
                await setOverviewVacant()
                await setOverviewBorrower()
                await setOverviewDue()
                await setTableData()

                resolve()

            })

        }

        const setPersonnelUsersData = async (): Promise<void> => {

            return new Promise(async (resolve) => {

                const main = document.querySelector('main[data-tab="users"]')
                const setOverviewPersonnel = async (): Promise<void> => {

                    return new Promise((resolve) => {

                        resolve()

                    })

                }
                const setOverviewIT = async (): Promise<void> => {

                    return new Promise((resolve) => {

                        resolve()

                    })

                }
                const setOverviewLibrarian = async (): Promise<void> => {

                    return new Promise((resolve) => {

                        resolve()

                    })

                }
                const setTableData = async (): Promise<void> => {



                }

                await setAccountData()
                await setOverviewPersonnel()
                await setOverviewIT()
                await setOverviewLibrarian()
                await setTableData()

                resolve()

            })

        }

        const setStudentDashboardData = async (): Promise<void> => {

            return new Promise(async (resolve) => {

                await setAccountData()

                resolve()

            })

        }

        try {

            if (type !== 'students') {

                switch (tab) {
                    
                    case 'dashboard': 
                        await setPersonnelDashboardData()
                        break
                    case 'inventory': 
                        await setPersonnelInventoryData()
                        break
                    case 'students': 
                        await setPersonnelStudentsData()
                        break
                    case 'users': 
                        await setPersonnelUsersData()
                        break
                    default: 
                        throw `Error in switch-case; passed argument: ${tab} did not match any case.`
                
                }
    
            } else { await setStudentDashboardData() }

        } catch(err) {

            console.error(err.name, err.message)
            throw err

        }

    } catch(err) {

        const { name, message } = err 
    
        window.location.href = `/error?${ (await errorPrompt({title: name, body: message})).toString() }` 

    }

}