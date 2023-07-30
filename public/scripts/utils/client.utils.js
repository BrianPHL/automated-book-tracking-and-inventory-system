import { DateTime } from "../../../node_modules/luxon/build/es6/luxon.js";
// * export function status: complete
export const checkFormInputs = async (form) => {
    const formInputs = form.querySelectorAll('input');
    const formSubmit = form.querySelector('button[type="submit"]');
    for (const formInput of formInputs) {
        if (formInput.value.trim() === '') {
            formSubmit.disabled = true;
            return;
        }
    }
    formSubmit.disabled = false;
};
// * export function status: complete
export const errorPrompt = async (data) => {
    const params = new URLSearchParams();
    for (let [key, value] of Object.entries(data)) {
        params.append(key, value);
    }
    return params;
};
// * export function status: complete
export const manipulateURL = async (data) => {
    const params = new URLSearchParams();
    for (let [key, value] of Object.entries(data)) {
        params.append(key, value);
    }
    const queryString = params.toString();
    window.history.pushState(data, document.title, `?${queryString}`);
};
// * export function status: complete
export const sanitizeURL = async () => {
    const href = window.location.href;
    if (href.split("?").length > 1) {
        const previousUrl = href.split("?")[0];
        history.pushState({}, document.title, previousUrl);
    }
};
// * export function status: complete
export const getPreferredTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};
// * export function status: complete
export const setPreferredTheme = (cb) => {
    const savedTheme = localStorage.getItem('theme');
    const preferredTheme = getPreferredTheme();
    cb({ savedTheme: savedTheme, preferredTheme: preferredTheme });
};
// * export function status: complete
export const setLightTheme = () => {
    const htmlElement = document.querySelector('html');
    const bodyElement = htmlElement.querySelector('body');
    if (htmlElement.getAttribute('data-site') === 'dashboard') {
        const header = bodyElement.querySelector('header');
        const nav = header.querySelector('nav');
        const navActions = nav.querySelector('.actions');
        const navActionsTheme = navActions.querySelector('.themeSwitch');
        navActionsTheme.innerHTML =
            `
            <i class="fa-regular fa-moon"></i>
            <h2>Dark mode</h2>
        `;
    }
    htmlElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
};
// * export function status: complete
export const setDarkTheme = () => {
    const htmlElement = document.querySelector('html');
    const bodyElement = htmlElement.querySelector('body');
    if (htmlElement.getAttribute('data-site') === 'dashboard') {
        const header = bodyElement.querySelector('header');
        const nav = header.querySelector('nav');
        const navActions = nav.querySelector('.actions');
        const navActionsTheme = navActions.querySelector('.themeSwitch');
        navActionsTheme.innerHTML =
            `
            <i class="fa-regular fa-sun-bright"></i>
            <h2>Light mode</h2>
        `;
    }
    htmlElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
};
// * export function status: complete
export const getURLData = async (url, identifier) => {
    return new URLSearchParams(url).get(identifier);
};
export const getDaysBetween = (firstDate, secondDate) => {
    if (!firstDate && !secondDate) {
        return;
    }
    const dateFormat = "yyyy-MM-dd HH:mm:ss";
    const fFirstDate = DateTime.fromFormat(firstDate, dateFormat);
    const fSecondDate = DateTime.fromFormat(secondDate, dateFormat);
    const dateNow = DateTime.now();
    const borrowDateDiff = Math.abs(Math.floor(fSecondDate.diff(fFirstDate).as('days')));
    const dueDateDiff = Math.abs(Math.floor(dateNow.diff(fSecondDate).as('days')));
    return fFirstDate > fSecondDate
        ? `${dueDateDiff} ${dueDateDiff === 1 ? 'day' : 'days'} past due`
        : `${borrowDateDiff} ${borrowDateDiff === 1 ? 'day' : 'days'} remaining`;
};
export const retrieveDashboardData = async (type, tab) => {
    try {
        const response = await fetch(`/${type}/${tab}/retrieve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return response;
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
export const setDashboardData = async (type, tab) => {
    try {
        if (!tab) {
            tab = 'dashboard';
        }
        const response = await retrieveDashboardData(type, tab);
        const responseBody = await response.json();
        const accountData = responseBody['accountData'];
        const overviewData = responseBody['overviewData'];
        const tableData = responseBody['tableData'];
        const setAccountData = async () => {
            return new Promise((resolve) => {
                const header = document.querySelector('header');
                const headerInfo = header.querySelector('.info');
                const headerInfoName = headerInfo.querySelector('.name');
                const headerInfoRole = headerInfo.querySelector('.role');
                headerInfoName.textContent = `${accountData['first_name']} ${accountData['last_name']}`;
                headerInfoRole.textContent = accountData['role'];
                resolve();
            });
        };
        const setPersonnelDashboardData = async () => {
            return new Promise(async (resolve) => {
                const main = document.querySelector('main[data-tab="dashboard"]');
                const setOverviewRegistered = async () => {
                    return new Promise((resolve) => {
                        const overview = main.querySelector('.overview');
                        const registeredCount = overview.querySelector('.registered > h1 > .count');
                        registeredCount.textContent = overviewData['studentsCount'];
                        resolve();
                    });
                };
                const setOverviewAvailable = async () => {
                    return new Promise((resolve) => {
                        const overview = main.querySelector('.overview');
                        const available = overview.querySelector('.available');
                        const availableCount = available.querySelector('h1 > .count');
                        const availableHeaderCount = available.querySelector('.header > h3 > .count');
                        const availableHeaderPercentage = available.querySelector('.header > h3 > .percentage');
                        availableCount.textContent = overviewData['availableBookCount'];
                        availableHeaderCount.textContent = overviewData['bookCount'];
                        availableHeaderPercentage.textContent = overviewData['availableBookCountPercentage'];
                        resolve();
                    });
                };
                const setOverviewUnavailable = async () => {
                    return new Promise((resolve) => {
                        const overview = main.querySelector('.overview');
                        const unavailable = overview.querySelector('.unavailable');
                        const unavailableCount = unavailable.querySelector('h1 > .count');
                        const unavailableHeaderCount = unavailable.querySelector('.header > h3 > .count');
                        const unavailableHeaderPercentage = unavailable.querySelector('.header > h3 > .percentage');
                        unavailableCount.textContent = overviewData['unavailableBookCount'];
                        unavailableHeaderCount.textContent = overviewData['bookCount'];
                        unavailableHeaderPercentage.textContent = overviewData['unavailableBookCountPercentage'];
                        resolve();
                    });
                };
                const setTableData = async () => {
                    return new Promise(async (resolve) => {
                        const table = main.querySelector('.table');
                        const setPaginationData = async () => {
                            return new Promise((resolve) => {
                                const pagination = table.querySelector('.data > .pagination');
                                const paginationMax = pagination.querySelector('.maxCount');
                                paginationMax.textContent = overviewData['bookCount'];
                                resolve();
                            });
                        };
                        const setEntriesData = async () => {
                            return new Promise((resolve) => {
                                const entries = table.querySelector('.data > .entries');
                                Object.values(tableData).forEach(async (data) => {
                                    const title = data['title'];
                                    const status = data['status'];
                                    const dueDate = data['date_due'] === null ? 'No data' : data['date_due'];
                                    const publicationDate = data['date_publicized'];
                                    const acquisitionDate = data['date_added'];
                                    let borrowerAndBorrowerNumber = ``;
                                    let borrowDateAndDuration = ``;
                                    let visibility = ``;
                                    data['borrower'] === null
                                        ? borrowerAndBorrowerNumber = `<h2>No data</h2>`
                                        : borrowerAndBorrowerNumber = `<h2>${data['borrower']}</h2><h3>${data['borrower_number']}</h3>`;
                                    data['date_borrowed'] === null
                                        ? borrowDateAndDuration = `<h2>No data</h2>`
                                        : borrowDateAndDuration = `<h2>${data['date_borrowed']}</h2><h3>${getDaysBetween(data['date_borrowed'], data['date_due'])}</h3>`;
                                    borrowDateAndDuration.includes('past due') ? visibility = 'visible' : visibility = 'hidden';
                                    const entry = `
                                    <div class="entry">
                                        <i style="visibility: ${visibility};" class="warning fa-solid fa-triangle-exclamation"></i>
                                        <div class="title"><h2>${title}</h2></div>
                                        <div class="status"><h2>${status}</h2></div>
                                        <div class="borrower">${borrowerAndBorrowerNumber}</div>
                                        <div class="borrowDate">${borrowDateAndDuration}</div>
                                        <div class="dueDate"><h2>${dueDate}</h2></div>
                                        <div class="publicationDate"><h2>${publicationDate}</h2></div>
                                        <div class="acquisitionDate"><h2>${acquisitionDate}</h2></div>
                                        <div class="actions">
                                            <i class="fa-regular fa-message"></i>
                                            <i class="fa-regular fa-pen-to-square"></i>
                                        </div>
                                    </div>
                                    `;
                                    entries.innerHTML += entry;
                                });
                                resolve();
                            });
                        };
                        await setPaginationData();
                        await setEntriesData();
                        resolve();
                    });
                };
                await setAccountData();
                await setOverviewRegistered();
                await setOverviewAvailable();
                await setOverviewUnavailable();
                await setTableData();
                resolve();
            });
        };
        const setPersonnelInventoryData = async () => {
            return new Promise(async (resolve) => {
                await setAccountData();
                resolve();
            });
        };
        const setPersonnelStudentsData = async () => {
            return new Promise(async (resolve) => {
                await setAccountData();
                resolve();
            });
        };
        const setPersonnelUsersData = async () => {
            return new Promise(async (resolve) => {
                const main = document.querySelector('main[data-tab="users"]');
                const setOverviewPersonnel = async () => {
                    return new Promise((resolve) => {
                        resolve();
                    });
                };
                const setOverviewIT = async () => {
                    return new Promise((resolve) => {
                        resolve();
                    });
                };
                const setOverviewLibrarian = async () => {
                    return new Promise((resolve) => {
                        resolve();
                    });
                };
                const setTableData = async () => {
                };
                await setAccountData();
                await setOverviewPersonnel();
                await setOverviewIT();
                await setOverviewLibrarian();
                await setTableData();
                resolve();
            });
        };
        const setStudentDashboardData = async () => {
            return new Promise(async (resolve) => {
                await setAccountData();
                resolve();
            });
        };
        try {
            if (type !== 'students') {
                switch (tab) {
                    case 'dashboard':
                        await setPersonnelDashboardData();
                        break;
                    case 'inventory':
                        await setPersonnelInventoryData();
                        break;
                    case 'students':
                        await setPersonnelStudentsData();
                        break;
                    case 'users':
                        await setPersonnelUsersData();
                        break;
                    default:
                        throw `Error in switch-case; passed argument: ${tab} did not match any case.`;
                }
            }
            else {
                await setStudentDashboardData();
            }
        }
        catch (err) {
            console.error(err.name, err.message);
            throw err;
        }
    }
    catch (err) {
        const { name, message } = err;
        window.location.href = `/error?${(await errorPrompt({ title: name, body: message })).toString()}`;
    }
};
