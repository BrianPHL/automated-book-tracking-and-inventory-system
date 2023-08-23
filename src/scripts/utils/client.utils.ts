import { DateTime } from "../../../node_modules/luxon/build/es6/luxon.js"

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

export const errorPrompt = async (data: object): Promise<URLSearchParams> => {

    const params = new URLSearchParams()

    for (let [key, value] of Object.entries(data)) { params.append(key, value) }
    
    return params

}

export const manipulateURL = async (data: object) => {

    const params = new URLSearchParams()
    
    for (let [key, value] of Object.entries(data)) { params.append(key, value) }
    
    const queryString = params.toString()
    window.history.pushState(data, document.title, `?${queryString}`)


}

export const sanitizeURL = async () => {

    const href = window.location.href

    if (href.split("?").length > 1) {

        const previousUrl = href.split("?")[0]
        history.pushState({}, document.title, previousUrl);

    }

}

export const getPreferredTheme = (): boolean => {

    return window.matchMedia('(prefers-color-scheme: dark)').matches

}

export const setPreferredTheme = (cb: (cbData: { savedTheme?: string, preferredTheme: boolean }) => void): void => {

    const savedTheme: string = localStorage.getItem('theme')
    const preferredTheme: boolean = getPreferredTheme()

    cb({ savedTheme: savedTheme, preferredTheme: preferredTheme })

}

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

export const setDashboardData = async (type: string, tab?: string, data?: object) => {

    try {

        if (!tab) { tab = 'dashboard' }
        if (!data) {

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
    
                    const bodyElement: HTMLBodyElement = document.querySelector('body')
                    const setOverviewRegistered = async (): Promise<void> => {
                        
                        return new Promise((resolve) => {
                            
                            const overview: HTMLBodyElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.first')
                            const overviewCount: number = overviewData['studentCount']
                            const modalOverview: string =
                            `
                                <div class="header">
                                    <h2>Registered</h2>
                                </div>
                                <h1>${ overviewCount } students</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
                            
                            resolve()
    
                        })
                        
                    }
                    const setOverviewAvailable = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.second')
                            const overviewCount: number = overviewData['availableBookCount']
                            const overviewHeaderCount: number = overviewData['bookCount']
                            const overviewHeaderCountPercentage: number = overviewData['availableBookCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Available</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } books</h3>
                                </div>
                                <h1>${ overviewCount } books</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setOverviewUnavailable = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.third')
                            const overviewCount: number = overviewData['unavailableBookCount']
                            const overviewHeaderCount: number = overviewData['bookCount']
                            const overviewHeaderCountPercentage: number = overviewData['unavailableBookCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Unavailable</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } books</h3>
                                </div>
                                <h1>${ overviewCount } books</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setTableData = async (): Promise<void> => {
    
                        return new Promise(async (resolve) => {
    
                            const table: HTMLDivElement = document.querySelector('.table[data-tab="dashboard"]')
                            
                            const setPaginationData = async (): Promise<void> => {
    
                                return new Promise((resolve) => {
    
                                    const pagination = table.querySelector('.pagination')
                                    const maxPage = pagination.querySelector('.maxCount')
    
                                    maxPage.textContent = overviewData['bookCount']
    
                                    resolve()
    
                                })
    
                            }
                            const setEntriesData = async (): Promise<void> => {
    
                                return new Promise((resolve) => {
    
                                    const entries = table.querySelector('.data > .entries')
    
                                    entries.innerHTML = ''
    
                                    Object.values(tableData).forEach(async (data) => { entries.innerHTML += data })
    
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
    
                    const bodyElement: HTMLBodyElement = document.querySelector('body')
                    const setOverviewAvailable = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.first')
                            const overviewCount: number = overviewData['availableBookCount']
                            const overviewHeaderCount: number = overviewData['bookCount']
                            const overviewHeaderCountPercentage: number = overviewData['availableBookCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Available</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } books</h3>
                                </div>
                                <h1>${ overviewCount } books</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setOverviewBorrowed = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.second')
                            const overviewCount: number = overviewData['borrowedBookCount']
                            const overviewHeaderCount: number = overviewData['bookCount']
                            const overviewHeaderCountPercentage: number = overviewData['borrowedBookCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Borrowed</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } books</h3>
                                </div>
                                <h1>${ overviewCount } books</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setOverviewDue = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.third')
                            const overviewCount: number = overviewData['dueBookCount']
                            const overviewHeaderCount: number = overviewData['bookCount']
                            const overviewHeaderCountPercentage: number = overviewData['dueBookCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Past Due</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } books</h3>
                                </div>
                                <h1>${ overviewCount } books</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setTableData = async (): Promise<void> => {
    
                        return new Promise(async (resolve) => {
    
                            const table: HTMLDivElement = document.querySelector('.table[data-tab="inventory"]')
    
                            const setPaginationData = async (): Promise<void> => {
    
                                return new Promise((resolve) => {
    
                                    const pagination = table.querySelector('.pagination')
                                    const maxPage = pagination.querySelector('.maxCount')
    
                                    maxPage.textContent = overviewData['bookCount']
    
                                    resolve()
    
                                })
    
                            }
                            const setEntriesData = async (): Promise<void> => {
                                
                                return new Promise((resolve) => {
    
                                    const entries = table.querySelector('.data > .entries')
    
                                    entries.innerHTML = ''
    
                                    Object.values(tableData).forEach(async (data) => { entries.innerHTML += data })
    
    
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
    
                    const bodyElement: HTMLBodyElement = document.querySelector('body')
                    const setOverviewVacant = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.first')
                            const overviewCount: number = overviewData['vacantStudentCount']
                            const overviewHeaderCount: number = overviewData['studentCount']
                            const overviewHeaderCountPercentage: number = overviewData['vacantStudentCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Vacant</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } students</h3>
                                </div>
                                <h1>${ overviewCount } students</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setOverviewBorrower = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.second')
                            const overviewCount: number = overviewData['borrowerStudentCount']
                            const overviewHeaderCount: number = overviewData['studentCount']
                            const overviewHeaderCountPercentage: number = overviewData['borrowerStudentCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Borrower</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } students</h3>
                                </div>
                                <h1>${ overviewCount } students</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setOverviewDue = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.third')
                            const overviewCount: number = overviewData['dueStudentCount']
                            const overviewHeaderCount: number = overviewData['studentCount']
                            const overviewHeaderCountPercentage: number = overviewData['dueStudentCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Past Due</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } students</h3>
                                </div>
                                <h1>${ overviewCount } students</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setTableData = async (): Promise<void> => {
    
                        return new Promise(async (resolve) => {
    
                            const table: HTMLDivElement = document.querySelector('.table[data-tab="students"]')
    
                            const setPaginationData = async (): Promise<void> => {
    
                                return new Promise((resolve) => {
    
                                    const pagination = table.querySelector('.pagination')
                                    const maxPage = pagination.querySelector('.maxCount')
    
                                    maxPage.textContent = overviewData['studentCount']
    
                                    resolve()
    
                                })
    
                            }
                            const setEntriesData = async (): Promise<void> => {
                                
                                return new Promise((resolve) => {
    
                                    const entries = table.querySelector('.data > .entries')
    
                                    entries.innerHTML = ''
    
                                    Object.values(tableData).forEach(async (data) => { entries.innerHTML += data })
    
    
                                    resolve()
    
                                })
                    
                            }
    
                            await setPaginationData()
                            await setEntriesData()
    
                            resolve()
    
                        })
    
                    }
    
                    await setOverviewVacant()
                    await setOverviewBorrower()
                    await setOverviewDue()
                    await setTableData()
    
                    resolve()
    
                })
    
            }
    
            const setPersonnelUsersData = async (): Promise<void> => {
                
                return new Promise(async (resolve) => {
    
                    const bodyElement: HTMLBodyElement = document.querySelector('body')
                    const setOverviewPersonnel = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
                            
                            const overview: HTMLBodyElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.first')
                            const overviewCount: number = overviewData['personnelCount']
                            const modalOverview: string =
                            `
                                <div class="header">
                                    <h2>Personnel</h2>
                                </div>
                                <h1>${ overviewCount } personnel</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
                            
                            resolve()
    
                        })
    
                    }
                    const setOverviewIT = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.second')
                            const overviewCount: number = overviewData['itPersonnelCount']
                            const overviewHeaderCount: number = overviewData['personnelCount']
                            const overviewHeaderCountPercentage: number = overviewData['itPersonnelCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>IT</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } personnel</h3>
                                </div>
                                <h1>${ overviewCount } personnel</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setOverviewLibrarian = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.third')
                            const overviewCount: number = overviewData['librarianPersonnelCount']
                            const overviewHeaderCount: number = overviewData['personnelCount']
                            const overviewHeaderCountPercentage: number = overviewData['librarianPersonnelCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Librarian</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } personnel</h3>
                                </div>
                                <h1>${ overviewCount } personnel</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setTableData = async (): Promise<void> => {
    
                        return new Promise(async (resolve) => {
    
                            const table: HTMLDivElement = document.querySelector('.table[data-tab="users"]')
    
                            const setPaginationData = async (): Promise<void> => {
    
                                return new Promise((resolve) => {
    
                                    const pagination = table.querySelector('.pagination')
                                    const maxPage = pagination.querySelector('.maxCount')
    
                                    maxPage.textContent = overviewData['personnelCount']
    
                                    resolve()
    
                                })
    
                            }
                            const setEntriesData = async (): Promise<void> => {

                                return new Promise((resolve) => {
    
                                    const entries = table.querySelector('.data > .entries')
    
                                    entries.innerHTML = ''
    
                                    Object.values(tableData).forEach(async (data) => { entries.innerHTML += data })
    
    
                                    resolve()
    
                                })
                    
                            }
    
                            await setPaginationData()
                            await setEntriesData()
    
                            resolve()
    
                        })
    
                    }
    
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

        } else {

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
    
                    const bodyElement: HTMLBodyElement = document.querySelector('body')
                    const setOverviewRegistered = async (): Promise<void> => {
                        
                        return new Promise((resolve) => {
                            
                            const overview: HTMLBodyElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.first')
                            const overviewCount: number = overviewData['studentCount']
                            const modalOverview: string =
                            `
                                <div class="header">
                                    <h2>Registered</h2>
                                </div>
                                <h1>${ overviewCount } students</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
                            
                            resolve()
    
                        })
                        
                    }
                    const setOverviewAvailable = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.second')
                            const overviewCount: number = overviewData['availableBookCount']
                            const overviewHeaderCount: number = overviewData['bookCount']
                            const overviewHeaderCountPercentage: number = overviewData['availableBookCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Available</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } books</h3>
                                </div>
                                <h1>${ overviewCount } books</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setOverviewUnavailable = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.third')
                            const overviewCount: number = overviewData['unavailableBookCount']
                            const overviewHeaderCount: number = overviewData['bookCount']
                            const overviewHeaderCountPercentage: number = overviewData['unavailableBookCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Unavailable</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } books</h3>
                                </div>
                                <h1>${ overviewCount } books</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setTableData = async (): Promise<void> => {
    
                        return new Promise(async (resolve) => {
    
                            const table: HTMLDivElement = document.querySelector('.table[data-tab="dashboard"]')
                            
                            const setPaginationData = async (): Promise<void> => {
    
                                return new Promise((resolve) => {
    
                                    const pagination = table.querySelector('.pagination')
                                    const maxPage = pagination.querySelector('.maxCount')
    
                                    maxPage.textContent = overviewData['bookCount']
    
                                    resolve()
    
                                })
    
                            }
                            const setEntriesData = async (): Promise<void> => {
    
                                return new Promise((resolve) => {
    
                                    const entries = table.querySelector('.data > .entries')
    
                                    entries.innerHTML = ''
    
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
    
                    const bodyElement: HTMLBodyElement = document.querySelector('body')
                    const setOverviewAvailable = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.first')
                            const overviewCount: number = overviewData['availableBookCount']
                            const overviewHeaderCount: number = overviewData['bookCount']
                            const overviewHeaderCountPercentage: number = overviewData['availableBookCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Available</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } books</h3>
                                </div>
                                <h1>${ overviewCount } books</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setOverviewBorrowed = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.second')
                            const overviewCount: number = overviewData['borrowedBookCount']
                            const overviewHeaderCount: number = overviewData['bookCount']
                            const overviewHeaderCountPercentage: number = overviewData['borrowedBookCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Borrowed</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } books</h3>
                                </div>
                                <h1>${ overviewCount } books</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setOverviewDue = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.third')
                            const overviewCount: number = overviewData['dueBookCount']
                            const overviewHeaderCount: number = overviewData['bookCount']
                            const overviewHeaderCountPercentage: number = overviewData['dueBookCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Past Due</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } books</h3>
                                </div>
                                <h1>${ overviewCount } books</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setTableData = async (): Promise<void> => {
    
                        return new Promise(async (resolve) => {
    
                            const table: HTMLDivElement = document.querySelector('.table[data-tab="inventory"]')
    
                            const setPaginationData = async (): Promise<void> => {
    
                                return new Promise((resolve) => {
    
                                    const pagination = table.querySelector('.pagination')
                                    const maxPage = pagination.querySelector('.maxCount')
    
                                    maxPage.textContent = overviewData['bookCount']
    
                                    resolve()
    
                                })
    
                            }
                            const setEntriesData = async (): Promise<void> => {
                                
                                return new Promise((resolve) => {
    
                                    const entries = table.querySelector('.data > .entries')
    
                                    entries.innerHTML = ''
    
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
    
                    const bodyElement: HTMLBodyElement = document.querySelector('body')
                    const setOverviewVacant = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.first')
                            const overviewCount: number = overviewData['vacantStudentCount']
                            const overviewHeaderCount: number = overviewData['studentCount']
                            const overviewHeaderCountPercentage: number = overviewData['vacantStudentCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Vacant</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } students</h3>
                                </div>
                                <h1>${ overviewCount } students</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setOverviewBorrower = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.second')
                            const overviewCount: number = overviewData['borrowerStudentCount']
                            const overviewHeaderCount: number = overviewData['studentCount']
                            const overviewHeaderCountPercentage: number = overviewData['borrowerStudentCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Borrower</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } students</h3>
                                </div>
                                <h1>${ overviewCount } students</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setOverviewDue = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.third')
                            const overviewCount: number = overviewData['dueStudentCount']
                            const overviewHeaderCount: number = overviewData['studentCount']
                            const overviewHeaderCountPercentage: number = overviewData['dueStudentCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Past Due</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } students</h3>
                                </div>
                                <h1>${ overviewCount } students</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setTableData = async (): Promise<void> => {
    
                        return new Promise(async (resolve) => {
    
                            const table: HTMLDivElement = document.querySelector('.table[data-tab="students"]')
    
                            const setPaginationData = async (): Promise<void> => {
    
                                return new Promise((resolve) => {
    
                                    const pagination = table.querySelector('.pagination')
                                    const maxPage = pagination.querySelector('.maxCount')
    
                                    maxPage.textContent = overviewData['studentCount']
    
                                    resolve()
    
                                })
    
                            }
                            const setEntriesData = async (): Promise<void> => {
                                
                                return new Promise((resolve) => {
                    
                                    const entries = table.querySelector('.data > .entries')
    
                                    entries.innerHTML = ''
    
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
    
                    await setOverviewVacant()
                    await setOverviewBorrower()
                    await setOverviewDue()
                    await setTableData()
    
                    resolve()
    
                })
    
            }
    
            const setPersonnelUsersData = async (): Promise<void> => {
                
                return new Promise(async (resolve) => {
    
                    const bodyElement: HTMLBodyElement = document.querySelector('body')
                    const setOverviewPersonnel = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
                            
                            const overview: HTMLBodyElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.first')
                            const overviewCount: number = overviewData['personnelCount']
                            const modalOverview: string =
                            `
                                <div class="header">
                                    <h2>Personnel</h2>
                                </div>
                                <h1>${ overviewCount } personnel</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
                            
                            resolve()
    
                        })
    
                    }
                    const setOverviewIT = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.second')
                            const overviewCount: number = overviewData['itPersonnelCount']
                            const overviewHeaderCount: number = overviewData['personnelCount']
                            const overviewHeaderCountPercentage: number = overviewData['itPersonnelCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>IT</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } personnel</h3>
                                </div>
                                <h1>${ overviewCount } personnel</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setOverviewLibrarian = async (): Promise<void> => {
    
                        return new Promise((resolve) => {
    
                            const overview: HTMLDivElement = bodyElement.querySelector('.overview')
                            const modal: HTMLDivElement = overview.querySelector('.third')
                            const overviewCount: number = overviewData['librarianPersonnelCount']
                            const overviewHeaderCount: number = overviewData['personnelCount']
                            const overviewHeaderCountPercentage: number = overviewData['librarianPersonnelCountPercentage']
                            const modalOverview: string = 
                            `
                                <div class="header">
                                    <h2>Librarian</h2>
                                    <h3>${ overviewHeaderCountPercentage }% of ${ overviewHeaderCount } personnel</h3>
                                </div>
                                <h1>${ overviewCount } personnel</h1>
                            `
    
                            modal.innerHTML = ''
                            modal.innerHTML = modalOverview
    
                            resolve()
    
                        })
    
                    }
                    const setTableData = async (): Promise<void> => {
    
                        return new Promise(async (resolve) => {
    
                            const table: HTMLDivElement = document.querySelector('.table[data-tab="users"]')
    
                            const setPaginationData = async (): Promise<void> => {
    
                                return new Promise((resolve) => {
    
                                    const pagination = table.querySelector('.pagination')
                                    const maxPage = pagination.querySelector('.maxCount')
    
                                    maxPage.textContent = overviewData['personnelCount']
    
                                    resolve()
    
                                })
    
                            }
                            const setEntriesData = async (): Promise<void> => {
                                
                                return new Promise((resolve) => {
                    
                                    const entries = table.querySelector('.data > .entries')
    
                                    entries.innerHTML = ''
                    
                                    Object.values(tableData).forEach(async (data) => {
                    
                                        const fullName = `${data['first_name']} ${data['last_name']}`
                                        const username = data['username']
                                        const role = data['role']
                                        let privilege = ``
    
                                        data['role'] === 'Librarian'
                                        ? privilege = `<h3>Dashboard</h3><h3>Inventory</h3><h3>Students</h3>`
                                        : privilege = `<h3>Dashboard</h3><h3>Inventory</h3><h3>Students</h3><h3>Users</h3>`
    
                                        const entry =
                                        `
                                        <div class="entry">
                                            <i style="visibility: hidden;" class="warning fa-solid fa-triangle-exclamation"></i>
                                            <div class="fullName"><h2>${ fullName }</h2></div>
                                            <div class="username"><h2>${ username }</h2></div>
                                            <div class="role"><h2>${ role }</h2></div>
                                            <div class="privilege">${ privilege }</div>
                                            <div class="emailAddress"><h2>${ username }</h2><h3>@feuroosevelt.edu.ph</h3></div>
                                            <div class="actions">
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

        }

    } catch(err) {

        const { name, message } = err 
    
        window.location.href = `/error?${ (await errorPrompt({title: name, body: message})).toString() }` 

    }

}

export const setTableAction = async (tab: string) => {

    const bodyElement: HTMLBodyElement = document.querySelector('body')
    const tableControls: HTMLDivElement = bodyElement.querySelector('.controls')
    const tableAction: HTMLButtonElement = tableControls.querySelector('button[data-type="action"]')

    try {

        tableAction.innerHTML = ''

        switch (tab) {

            case 'dashboard':
                tableAction.style.display = 'none'
                break;

            case 'inventory':
                tableAction.style.display = 'flex'
                tableAction.outerHTML =
                `
                    <button data-type="action" type="submit" enabled>
                        <i class="fa-regular fa-plus"></i>
                        Register a book
                    </button>
                `
                break;
        
            case 'students':
                tableAction.style.display = 'flex'
                tableAction.outerHTML =
                `
                    <button data-type="action" type="submit" enabled>
                        <i class="fa-regular fa-plus"></i>
                        Enroll a student
                    </button>
                `
                break;

            case 'users':
                tableAction.style.display = 'flex'    
                tableAction.outerHTML =
                `
                    <button data-type="action" type="submit" enabled>
                        <i class="fa-regular fa-plus"></i>
                        Register a library or IT personnel
                    </button>
                `
                break;

            default:
            throw `Error in switch-case; passed argument: ${tab} did not match any case.`
        }

    } catch(err) {

        const { name, message } = err

        window.location.href = `/error?${ (await errorPrompt({title: name, body: message})).toString() }`

    }

}

export const openEditModal = async (
    editData: { modal: HTMLDivElement, target: HTMLElement, active: string }, entryData: {}, modalData: {}
): Promise<void> => {

    return new Promise((resolve) => {

        const targetEntry: HTMLElement = editData.target.parentElement.parentElement
        const targetModal: HTMLDivElement = editData.modal.querySelector(`.${ editData.active } > .action`)
        const targetModalForm: HTMLFormElement = targetModal.querySelector('.form > form')
        const targetModalInputs: NodeListOf<HTMLInputElement> = targetModalForm.querySelectorAll('input')
        const targetModalHeading: HTMLHeadingElement = targetModal.querySelector('.header > .heading')

        if (editData.active === 'inventory') {

            targetModalHeading.innerHTML =
            `
                <h3>Book Entry Edit Form</h3>
                <h4>
                    Currently editing book entry
                    <strong>#<span class="entryIdentifier">${targetEntry.getAttribute('data-identifier')}</span></strong>
                </h4>
            `

        }

        if (editData.active === 'students') {

            targetModalHeading.innerHTML =
            `
                <h3>Student Entry Edit Form</h3>
                <h4>
                    Currently editing student entry
                    <strong>#<span class="entryIdentifier">${targetEntry.getAttribute('data-identifier')}</span></strong>
                </h4>
            `

        }

        if (editData.active === 'users') {

            targetModalHeading.innerHTML =
            `
                <h3>Personnel Entry Edit Form</h3>
                <h4>
                    Currently editing personnel entry
                    <strong>#<span class="entryIdentifier">${targetEntry.getAttribute('data-identifier')}</span></strong>
                </h4>
            `

        }

        targetModalInputs.forEach((targetModalInput: HTMLInputElement) => { targetModalInput.value = '' })
        editData.modal.style.display = 'grid'
        targetModal.style.display = 'grid'
        targetModal.setAttribute('data-type', 'edit')

        setTimeout(() => { for (const key in entryData) { modalData[key].value = entryData[key] } }, 250);

        resolve()

    })

}