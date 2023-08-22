import { DateTime } from "../../../node_modules/luxon/build/es6/luxon.js";
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
export const errorPrompt = async (data) => {
    const params = new URLSearchParams();
    for (let [key, value] of Object.entries(data)) {
        params.append(key, value);
    }
    return params;
};
export const manipulateURL = async (data) => {
    const params = new URLSearchParams();
    for (let [key, value] of Object.entries(data)) {
        params.append(key, value);
    }
    const queryString = params.toString();
    window.history.pushState(data, document.title, `?${queryString}`);
};
export const sanitizeURL = async () => {
    const href = window.location.href;
    if (href.split("?").length > 1) {
        const previousUrl = href.split("?")[0];
        history.pushState({}, document.title, previousUrl);
    }
};
export const getPreferredTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};
export const setPreferredTheme = (cb) => {
    const savedTheme = localStorage.getItem('theme');
    const preferredTheme = getPreferredTheme();
    cb({ savedTheme: savedTheme, preferredTheme: preferredTheme });
};
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
export const setDashboardData = async (type, tab, data) => {
    try {
        if (!tab) {
            tab = 'dashboard';
        }
        if (!data) {
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
                    const bodyElement = document.querySelector('body');
                    const setOverviewRegistered = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.first');
                            const overviewCount = overviewData['studentCount'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Registered</h2>
                                </div>
                                <h1>${overviewCount} students</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewAvailable = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.second');
                            const overviewCount = overviewData['availableBookCount'];
                            const overviewHeaderCount = overviewData['bookCount'];
                            const overviewHeaderCountPercentage = overviewData['availableBookCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Available</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} books</h3>
                                </div>
                                <h1>${overviewCount} books</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewUnavailable = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.third');
                            const overviewCount = overviewData['unavailableBookCount'];
                            const overviewHeaderCount = overviewData['bookCount'];
                            const overviewHeaderCountPercentage = overviewData['unavailableBookCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Unavailable</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} books</h3>
                                </div>
                                <h1>${overviewCount} books</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setTableData = async () => {
                        return new Promise(async (resolve) => {
                            const table = document.querySelector('.table[data-tab="dashboard"]');
                            const setPaginationData = async () => {
                                return new Promise((resolve) => {
                                    const pagination = table.querySelector('.pagination');
                                    const maxPage = pagination.querySelector('.maxCount');
                                    maxPage.textContent = overviewData['bookCount'];
                                    resolve();
                                });
                            };
                            const setEntriesData = async () => {
                                return new Promise((resolve) => {
                                    const entries = table.querySelector('.data > .entries');
                                    entries.innerHTML = '';
                                    Object.values(tableData).forEach(async (data) => { entries.innerHTML += data; });
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
                    const bodyElement = document.querySelector('body');
                    const setOverviewAvailable = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.first');
                            const overviewCount = overviewData['availableBookCount'];
                            const overviewHeaderCount = overviewData['bookCount'];
                            const overviewHeaderCountPercentage = overviewData['availableBookCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Available</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} books</h3>
                                </div>
                                <h1>${overviewCount} books</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewBorrowed = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.second');
                            const overviewCount = overviewData['borrowedBookCount'];
                            const overviewHeaderCount = overviewData['bookCount'];
                            const overviewHeaderCountPercentage = overviewData['borrowedBookCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Borrowed</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} books</h3>
                                </div>
                                <h1>${overviewCount} books</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewDue = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.third');
                            const overviewCount = overviewData['dueBookCount'];
                            const overviewHeaderCount = overviewData['bookCount'];
                            const overviewHeaderCountPercentage = overviewData['dueBookCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Past Due</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} books</h3>
                                </div>
                                <h1>${overviewCount} books</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setTableData = async () => {
                        return new Promise(async (resolve) => {
                            const table = document.querySelector('.table[data-tab="inventory"]');
                            const setPaginationData = async () => {
                                return new Promise((resolve) => {
                                    const pagination = table.querySelector('.pagination');
                                    const maxPage = pagination.querySelector('.maxCount');
                                    maxPage.textContent = overviewData['bookCount'];
                                    resolve();
                                });
                            };
                            const setEntriesData = async () => {
                                return new Promise((resolve) => {
                                    const entries = table.querySelector('.data > .entries');
                                    entries.innerHTML = '';
                                    Object.values(tableData).forEach(async (data) => { entries.innerHTML += data; });
                                    resolve();
                                });
                            };
                            await setPaginationData();
                            await setEntriesData();
                            resolve();
                        });
                    };
                    await setOverviewAvailable();
                    await setOverviewBorrowed();
                    await setOverviewDue();
                    await setTableData();
                    resolve();
                });
            };
            const setPersonnelStudentsData = async () => {
                return new Promise(async (resolve) => {
                    const bodyElement = document.querySelector('body');
                    const setOverviewVacant = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.first');
                            const overviewCount = overviewData['vacantStudentCount'];
                            const overviewHeaderCount = overviewData['studentCount'];
                            const overviewHeaderCountPercentage = overviewData['vacantStudentCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Vacant</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} students</h3>
                                </div>
                                <h1>${overviewCount} students</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewBorrower = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.second');
                            const overviewCount = overviewData['borrowerStudentCount'];
                            const overviewHeaderCount = overviewData['studentCount'];
                            const overviewHeaderCountPercentage = overviewData['borrowerStudentCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Borrower</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} students</h3>
                                </div>
                                <h1>${overviewCount} students</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewDue = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.third');
                            const overviewCount = overviewData['dueStudentCount'];
                            const overviewHeaderCount = overviewData['studentCount'];
                            const overviewHeaderCountPercentage = overviewData['dueStudentCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Past Due</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} students</h3>
                                </div>
                                <h1>${overviewCount} students</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setTableData = async () => {
                        return new Promise(async (resolve) => {
                            const table = document.querySelector('.table[data-tab="students"]');
                            const setPaginationData = async () => {
                                return new Promise((resolve) => {
                                    const pagination = table.querySelector('.pagination');
                                    const maxPage = pagination.querySelector('.maxCount');
                                    maxPage.textContent = overviewData['studentCount'];
                                    resolve();
                                });
                            };
                            const setEntriesData = async () => {
                                return new Promise((resolve) => {
                                    const entries = table.querySelector('.data > .entries');
                                    entries.innerHTML = '';
                                    Object.values(tableData).forEach(async (data) => { entries.innerHTML += data; });
                                    resolve();
                                });
                            };
                            await setPaginationData();
                            await setEntriesData();
                            resolve();
                        });
                    };
                    await setOverviewVacant();
                    await setOverviewBorrower();
                    await setOverviewDue();
                    await setTableData();
                    resolve();
                });
            };
            const setPersonnelUsersData = async () => {
                return new Promise(async (resolve) => {
                    const bodyElement = document.querySelector('body');
                    const setOverviewPersonnel = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.first');
                            const overviewCount = overviewData['personnelCount'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Personnel</h2>
                                </div>
                                <h1>${overviewCount} personnel</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewIT = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.second');
                            const overviewCount = overviewData['itPersonnelCount'];
                            const overviewHeaderCount = overviewData['personnelCount'];
                            const overviewHeaderCountPercentage = overviewData['itPersonnelCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>IT</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} personnel</h3>
                                </div>
                                <h1>${overviewCount} personnel</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewLibrarian = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.third');
                            const overviewCount = overviewData['librarianPersonnelCount'];
                            const overviewHeaderCount = overviewData['personnelCount'];
                            const overviewHeaderCountPercentage = overviewData['librarianPersonnelCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Librarian</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} personnel</h3>
                                </div>
                                <h1>${overviewCount} personnel</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setTableData = async () => {
                        return new Promise(async (resolve) => {
                            const table = document.querySelector('.table[data-tab="users"]');
                            const setPaginationData = async () => {
                                return new Promise((resolve) => {
                                    const pagination = table.querySelector('.pagination');
                                    const maxPage = pagination.querySelector('.maxCount');
                                    maxPage.textContent = overviewData['personnelCount'];
                                    resolve();
                                });
                            };
                            const setEntriesData = async () => {
                                return new Promise((resolve) => {
                                    const entries = table.querySelector('.data > .entries');
                                    entries.innerHTML = '';
                                    Object.values(tableData).forEach(async (data) => { entries.innerHTML += data; });
                                    resolve();
                                });
                            };
                            await setPaginationData();
                            await setEntriesData();
                            resolve();
                        });
                    };
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
        else {
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
                    const bodyElement = document.querySelector('body');
                    const setOverviewRegistered = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.first');
                            const overviewCount = overviewData['studentCount'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Registered</h2>
                                </div>
                                <h1>${overviewCount} students</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewAvailable = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.second');
                            const overviewCount = overviewData['availableBookCount'];
                            const overviewHeaderCount = overviewData['bookCount'];
                            const overviewHeaderCountPercentage = overviewData['availableBookCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Available</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} books</h3>
                                </div>
                                <h1>${overviewCount} books</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewUnavailable = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.third');
                            const overviewCount = overviewData['unavailableBookCount'];
                            const overviewHeaderCount = overviewData['bookCount'];
                            const overviewHeaderCountPercentage = overviewData['unavailableBookCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Unavailable</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} books</h3>
                                </div>
                                <h1>${overviewCount} books</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setTableData = async () => {
                        return new Promise(async (resolve) => {
                            const table = document.querySelector('.table[data-tab="dashboard"]');
                            const setPaginationData = async () => {
                                return new Promise((resolve) => {
                                    const pagination = table.querySelector('.pagination');
                                    const maxPage = pagination.querySelector('.maxCount');
                                    maxPage.textContent = overviewData['bookCount'];
                                    resolve();
                                });
                            };
                            const setEntriesData = async () => {
                                return new Promise((resolve) => {
                                    const entries = table.querySelector('.data > .entries');
                                    entries.innerHTML = '';
                                    Object.values(tableData).forEach(async (data) => {
                                        const title = data['title'];
                                        const dueDate = data['date_due'] === null ? 'No data' : data['date_due'];
                                        const publicationDate = data['date_publicized'];
                                        const acquisitionDate = data['date_added'];
                                        let borrowerAndBorrowerNumber = ``;
                                        let borrowDateAndDuration = ``;
                                        let visibility = ``;
                                        let status = ``;
                                        data['borrower'] === null
                                            ? borrowerAndBorrowerNumber = `<h2>No data</h2>`
                                            : borrowerAndBorrowerNumber = `<h2>${data['borrower']}</h2><h3>${data['borrower_number']}</h3>`;
                                        data['date_borrowed'] === null
                                            ? borrowDateAndDuration = `<h2>No data</h2>`
                                            : borrowDateAndDuration = `<h2>${data['date_borrowed']}</h2><h3>${getDaysBetween(data['date_borrowed'], data['date_due'])}</h3>`;
                                        data['status'] === 'Available'
                                            ? status = `<h2>${data['status']}</h2>`
                                            : status = `<h2>Unavailable</h2><h3>${data['status']}</h3>`;
                                        status.includes('Past Due')
                                            ? visibility = 'visible'
                                            : visibility = 'hidden';
                                        const entry = `
                                        <div class="entry">
                                            <i style="visibility: ${visibility};" class="warning fa-solid fa-triangle-exclamation"></i>
                                            <div class="title"><h2>${title}</h2></div>
                                            <div class="status">${status}</div>
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
                    const bodyElement = document.querySelector('body');
                    const setOverviewAvailable = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.first');
                            const overviewCount = overviewData['availableBookCount'];
                            const overviewHeaderCount = overviewData['bookCount'];
                            const overviewHeaderCountPercentage = overviewData['availableBookCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Available</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} books</h3>
                                </div>
                                <h1>${overviewCount} books</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewBorrowed = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.second');
                            const overviewCount = overviewData['borrowedBookCount'];
                            const overviewHeaderCount = overviewData['bookCount'];
                            const overviewHeaderCountPercentage = overviewData['borrowedBookCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Borrowed</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} books</h3>
                                </div>
                                <h1>${overviewCount} books</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewDue = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.third');
                            const overviewCount = overviewData['dueBookCount'];
                            const overviewHeaderCount = overviewData['bookCount'];
                            const overviewHeaderCountPercentage = overviewData['dueBookCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Past Due</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} books</h3>
                                </div>
                                <h1>${overviewCount} books</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setTableData = async () => {
                        return new Promise(async (resolve) => {
                            const table = document.querySelector('.table[data-tab="inventory"]');
                            const setPaginationData = async () => {
                                return new Promise((resolve) => {
                                    const pagination = table.querySelector('.pagination');
                                    const maxPage = pagination.querySelector('.maxCount');
                                    maxPage.textContent = overviewData['bookCount'];
                                    resolve();
                                });
                            };
                            const setEntriesData = async () => {
                                return new Promise((resolve) => {
                                    const entries = table.querySelector('.data > .entries');
                                    entries.innerHTML = '';
                                    Object.values(tableData).forEach(async (data) => {
                                        const title = data['title'];
                                        const author = data['author'];
                                        const genre = data['genre'];
                                        const publicationDate = data['date_publicized'];
                                        const acquisitionDate = data['date_added'];
                                        let visibility = ``;
                                        let status = ``;
                                        data['status'] === 'Available'
                                            ? status = `<h2>${data['status']}</h2>`
                                            : status = `<h2>Unavailable</h2><h3>${data['status']}</h3>`;
                                        status.includes('Past Due')
                                            ? visibility = 'visible'
                                            : visibility = 'hidden';
                                        const entry = `
                                        <div class="entry">
                                            <i style="visibility: ${visibility};" class="warning fa-solid fa-triangle-exclamation"></i>
                                            <div class="title"><h2>${title}</h2></div>
                                            <div class="status"><h2>${status}</h2></div>
                                            <div class="author"><h2>${author}</h2></div>
                                            <div class="genre"><h2>${genre}</h2></div>
                                            <div class="publicationDate"><h2>${publicationDate}</h2></div>
                                            <div class="acquisitionDate"><h2>${acquisitionDate}</h2></div>
                                            <div class="actions">
                                                <i class="fa-regular fa-arrow-right-from-arc"></i>
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
                    await setOverviewAvailable();
                    await setOverviewBorrowed();
                    await setOverviewDue();
                    await setTableData();
                    resolve();
                });
            };
            const setPersonnelStudentsData = async () => {
                return new Promise(async (resolve) => {
                    const bodyElement = document.querySelector('body');
                    const setOverviewVacant = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.first');
                            const overviewCount = overviewData['vacantStudentCount'];
                            const overviewHeaderCount = overviewData['studentCount'];
                            const overviewHeaderCountPercentage = overviewData['vacantStudentCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Vacant</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} students</h3>
                                </div>
                                <h1>${overviewCount} students</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewBorrower = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.second');
                            const overviewCount = overviewData['borrowerStudentCount'];
                            const overviewHeaderCount = overviewData['studentCount'];
                            const overviewHeaderCountPercentage = overviewData['borrowerStudentCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Borrower</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} students</h3>
                                </div>
                                <h1>${overviewCount} students</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewDue = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.third');
                            const overviewCount = overviewData['dueStudentCount'];
                            const overviewHeaderCount = overviewData['studentCount'];
                            const overviewHeaderCountPercentage = overviewData['dueStudentCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Past Due</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} students</h3>
                                </div>
                                <h1>${overviewCount} students</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setTableData = async () => {
                        return new Promise(async (resolve) => {
                            const table = document.querySelector('.table[data-tab="students"]');
                            const setPaginationData = async () => {
                                return new Promise((resolve) => {
                                    const pagination = table.querySelector('.pagination');
                                    const maxPage = pagination.querySelector('.maxCount');
                                    maxPage.textContent = overviewData['studentCount'];
                                    resolve();
                                });
                            };
                            const setEntriesData = async () => {
                                return new Promise((resolve) => {
                                    const entries = table.querySelector('.data > .entries');
                                    entries.innerHTML = '';
                                    Object.values(tableData).forEach(async (data) => {
                                        const studentName = `${data['first_name']} ${data['last_name']}`;
                                        const studentNumber = data['student_number'];
                                        const borrowedBook = data['borrowed_book'] === null ? 'No data' : data['borrowed_book'];
                                        const phoneNumber = data['phone_number'];
                                        const emailAddress = data['email'];
                                        let studentStatus = ``;
                                        let visibility = ``;
                                        data['status'] === 'Vacant'
                                            ? studentStatus = `<h2>${data['status']}</h2>`
                                            : studentStatus = `<h2>Unavailable</h2><h3>${data['status']}</h3>`;
                                        studentStatus.includes('Past Due')
                                            ? visibility = 'visible'
                                            : visibility = 'hidden';
                                        const entry = `
                                        <div class="entry">
                                            <i style="visibility: ${visibility};" class="warning fa-solid fa-triangle-exclamation"></i>
                                            <div class="name"><h2>${studentName}</h2></div>
                                            <div class="studentNumber"><h2>${studentNumber}</h2></div>
                                            <div class="status">${studentStatus}</div>
                                            <div class="borrowedBook"><h2>${borrowedBook}</h2></div>
                                            <div class="phoneNumber"><h2>${phoneNumber}</h2></div>
                                            <div class="emailAddress"><h2>${emailAddress}</h2></div>
                                            <div class="actions">
                                                <i class="fa-regular fa-message"></i>
                                                <i class="fa-regular fa-pen-to-square"></i>
                                                <i class="fa-regular fa-xmark"></i>
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
                    await setOverviewVacant();
                    await setOverviewBorrower();
                    await setOverviewDue();
                    await setTableData();
                    resolve();
                });
            };
            const setPersonnelUsersData = async () => {
                return new Promise(async (resolve) => {
                    const bodyElement = document.querySelector('body');
                    const setOverviewPersonnel = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.first');
                            const overviewCount = overviewData['personnelCount'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Personnel</h2>
                                </div>
                                <h1>${overviewCount} personnel</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewIT = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.second');
                            const overviewCount = overviewData['itPersonnelCount'];
                            const overviewHeaderCount = overviewData['personnelCount'];
                            const overviewHeaderCountPercentage = overviewData['itPersonnelCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>IT</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} personnel</h3>
                                </div>
                                <h1>${overviewCount} personnel</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setOverviewLibrarian = async () => {
                        return new Promise((resolve) => {
                            const overview = bodyElement.querySelector('.overview');
                            const modal = overview.querySelector('.third');
                            const overviewCount = overviewData['librarianPersonnelCount'];
                            const overviewHeaderCount = overviewData['personnelCount'];
                            const overviewHeaderCountPercentage = overviewData['librarianPersonnelCountPercentage'];
                            const modalOverview = `
                                <div class="header">
                                    <h2>Librarian</h2>
                                    <h3>${overviewHeaderCountPercentage}% of ${overviewHeaderCount} personnel</h3>
                                </div>
                                <h1>${overviewCount} personnel</h1>
                            `;
                            modal.innerHTML = '';
                            modal.innerHTML = modalOverview;
                            resolve();
                        });
                    };
                    const setTableData = async () => {
                        return new Promise(async (resolve) => {
                            const table = document.querySelector('.table[data-tab="users"]');
                            const setPaginationData = async () => {
                                return new Promise((resolve) => {
                                    const pagination = table.querySelector('.pagination');
                                    const maxPage = pagination.querySelector('.maxCount');
                                    maxPage.textContent = overviewData['personnelCount'];
                                    resolve();
                                });
                            };
                            const setEntriesData = async () => {
                                return new Promise((resolve) => {
                                    const entries = table.querySelector('.data > .entries');
                                    entries.innerHTML = '';
                                    Object.values(tableData).forEach(async (data) => {
                                        const fullName = `${data['first_name']} ${data['last_name']}`;
                                        const username = data['username'];
                                        const role = data['role'];
                                        let privilege = ``;
                                        data['role'] === 'Librarian'
                                            ? privilege = `<h3>Dashboard</h3><h3>Inventory</h3><h3>Students</h3>`
                                            : privilege = `<h3>Dashboard</h3><h3>Inventory</h3><h3>Students</h3><h3>Users</h3>`;
                                        const entry = `
                                        <div class="entry">
                                            <i style="visibility: hidden;" class="warning fa-solid fa-triangle-exclamation"></i>
                                            <div class="fullName"><h2>${fullName}</h2></div>
                                            <div class="username"><h2>${username}</h2></div>
                                            <div class="role"><h2>${role}</h2></div>
                                            <div class="privilege">${privilege}</div>
                                            <div class="emailAddress"><h2>${username}</h2><h3>@feuroosevelt.edu.ph</h3></div>
                                            <div class="actions">
                                            <i class="fa-regular fa-pen-to-square"></i>
                                            <i class="fa-regular fa-xmark"></i>
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
    }
    catch (err) {
        const { name, message } = err;
        window.location.href = `/error?${(await errorPrompt({ title: name, body: message })).toString()}`;
    }
};
export const setTableAction = async (tab) => {
    const bodyElement = document.querySelector('body');
    const tableControls = bodyElement.querySelector('.controls');
    const tableAction = tableControls.querySelector('button[data-type="action"]');
    try {
        tableAction.innerHTML = '';
        switch (tab) {
            case 'dashboard':
                tableAction.style.display = 'none';
                break;
            case 'inventory':
                tableAction.style.display = 'flex';
                tableAction.outerHTML =
                    `
                    <button data-type="action" type="submit" enabled>
                        <i class="fa-regular fa-plus"></i>
                        Register a book
                    </button>
                `;
                break;
            case 'students':
                tableAction.style.display = 'flex';
                tableAction.outerHTML =
                    `
                    <button data-type="action" type="submit" enabled>
                        <i class="fa-regular fa-plus"></i>
                        Enroll a student
                    </button>
                `;
                break;
            case 'users':
                tableAction.style.display = 'flex';
                tableAction.outerHTML =
                    `
                    <button data-type="action" type="submit" enabled>
                        <i class="fa-regular fa-plus"></i>
                        Register a library or IT personnel
                    </button>
                `;
                break;
            default:
                throw `Error in switch-case; passed argument: ${tab} did not match any case.`;
        }
    }
    catch (err) {
        const { name, message } = err;
        window.location.href = `/error?${(await errorPrompt({ title: name, body: message })).toString()}`;
    }
};
export const openEditModal = async (editData, entryData, modalData) => {
    return new Promise((resolve) => {
        const targetEntry = editData.target.parentElement.parentElement;
        const targetModal = editData.modal.querySelector(`.${editData.active} > .action`);
        const targetModalForm = targetModal.querySelector('.form > form');
        const targetModalInputs = targetModalForm.querySelectorAll('input');
        const targetModalHeading = targetModal.querySelector('.header > .heading');
        if (editData.active === 'inventory') {
            targetModalHeading.innerHTML =
                `
                <h3>Book Entry Edit Form</h3>
                <h4>
                    Currently editing book entry
                    <strong>#<span class="entryIdentifier">${targetEntry.getAttribute('data-identifier')}</span></strong>
                </h4>
            `;
        }
        if (editData.active === 'students') {
            targetModalHeading.innerHTML =
                `
                <h3>Student Entry Edit Form</h3>
                <h4>
                    Currently editing student entry
                    <strong>#<span class="entryIdentifier">${targetEntry.getAttribute('data-identifier')}</span></strong>
                </h4>
            `;
        }
        if (editData.active === 'users') {
            targetModalHeading.innerHTML =
                `
                <h3>Personnel Entry Edit Form</h3>
                <h4>
                    Currently editing personnel entry
                    <strong>#<span class="entryIdentifier">${targetEntry.getAttribute('data-identifier')}</span></strong>
                </h4>
            `;
        }
        targetModalInputs.forEach((targetModalInput) => { targetModalInput.value = ''; });
        editData.modal.style.display = 'grid';
        targetModal.style.display = 'grid';
        targetModal.setAttribute('data-type', 'edit');
        setTimeout(() => { for (const key in entryData) {
            modalData[key].value = entryData[key];
        } }, 250);
        resolve();
    });
};
