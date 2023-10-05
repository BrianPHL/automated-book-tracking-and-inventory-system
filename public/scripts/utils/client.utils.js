import { DateTime } from "../../../node_modules/luxon/build/es6/luxon.js";
export const delay = async (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};
export const checkForms = async (form, isInputAndPreview) => {
    const submit = form.querySelector('button[type="submit"]');
    const checkFormInputsAndPreviews = async () => {
        const inputs = form.querySelectorAll('input');
        const previews = form.querySelectorAll('div[data-type="preview"]');
        for (const input of inputs) {
            if (input.value.trim() === '') {
                submit.disabled = true;
                return;
            }
            for (const preview of previews) {
                if (preview.getAttribute('data-identifier') === 'null') {
                    submit.disabled = true;
                    return;
                }
            }
        }
        submit.disabled = false;
        return;
    };
    const checkFormInputs = async () => {
        const inputs = form.querySelectorAll('input');
        for (const input of inputs) {
            if (input.value.trim() === "") {
                submit.disabled = true;
                return;
            }
        }
        submit.disabled = false;
    };
    isInputAndPreview
        ? await checkFormInputsAndPreviews()
        : await checkFormInputs();
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
export const openRegisterModal = async (type, modal) => {
    const registerModal = modal.querySelector(`.${type} > .registration`);
    const registerModalPrompts = {
        success: registerModal.querySelector('div[data-type="success"]'),
        error: registerModal.querySelector('div[data-type="error"]')
    };
    const registerModalForm = registerModal.querySelector('.form > form');
    const registerModalBtns = {
        close: registerModal.querySelector('.header > i'),
        reset: registerModalForm.querySelector('.actions > button[type="reset"]'),
        submit: registerModalForm.querySelector('.actions > button[type="submit"]')
    };
    const registerModalInputs = registerModalForm.querySelectorAll('input');
    const resetData = async () => {
        return new Promise(resolve => {
            registerModalInputs.forEach(input => input.value = '');
            checkForms(registerModalForm, false);
            resolve();
        });
    };
    const closeModal = async () => {
        await resetData();
        registerModal.style.display = 'none';
        modal.style.display = 'none';
    };
    registerModalInputs.forEach(input => {
        input.addEventListener('input', () => checkForms(registerModalForm, false));
        input.value = '';
    });
    registerModalBtns['close'].addEventListener('click', () => closeModal());
    registerModalBtns['reset'].addEventListener('click', () => resetData());
    registerModalBtns['submit'].addEventListener('click', async (event) => {
        const button = event.target;
        const formData = new FormData(registerModalForm);
        let fetchedData = {};
        try {
            event.preventDefault();
            for (const [name, value] of formData.entries()) {
                fetchedData[name] = value.toString();
            }
            button.innerHTML =
                `
                <i class="fa-duotone fa-loader fa-spin-pulse"></i>
                Registering...
            `;
            await fetch(`/personnel/table/${type}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fetchedData)
            });
            registerModalPrompts['success'].style.display = 'flex';
            setTimeout(async () => {
                await resetData();
                await closeModal();
                button.innerHTML = 'Register';
                registerModalPrompts['success'].style.display = 'none';
            }, 2500);
        }
        catch (err) {
            registerModalPrompts['error'].style.display = 'flex';
            setTimeout(() => { registerModalPrompts['error'].style.display = 'none'; throw err; }, 2500);
        }
    });
    modal.style.display = 'grid';
    registerModal.style.display = 'grid';
    checkForms(registerModalForm, false);
};
export const openEditModal = async (type, modal, entry) => {
    let entryData;
    let modalData;
    const path = '.action > .form > form';
    const editModal = modal.querySelector(`.${type} > .action`);
    const editModalPrompts = {
        success: editModal.querySelector('div[data-type="success"]'),
        error: editModal.querySelector('div[data-type="error"]')
    };
    const editModalForm = editModal.querySelector('.form > form');
    const editModalBtns = {
        close: editModal.querySelector('.header > i'),
        reset: editModalForm.querySelector('.actions > button[type="reset"]'),
        submit: editModalForm.querySelector('.actions > button[type="submit"]')
    };
    const editModalHeading = editModal.querySelector('.header > .heading');
    const editModalInputs = editModalForm.querySelectorAll('input');
    const inventory = async () => {
        entryData = {
            title: entry.querySelector(".title > h2").textContent,
            author: entry.querySelector(".author > h2").textContent,
            genre: entry.querySelector(".genre > h2").textContent,
            date: entry.querySelector(".publicationDate > h2").textContent
        };
        modalData = {
            title: editModal.querySelector(`${path} > .title > input`),
            author: editModal.querySelector(`${path} > .author > input`),
            genre: editModal.querySelector(`${path} > .genre > input`),
            date: editModal.querySelector(`${path} > .dPublicized > input`)
        };
        editModalHeading.innerHTML =
            `
            <h3>Book Entry Edit Form</h3>
            <h4>
                Currently editing book entry
                <strong>#<span class="entryIdentifier">${entry.getAttribute('data-identifier')}</span></strong>
            </h4>
        `;
    };
    const students = async () => {
        entryData = {
            name: entry.querySelector(".name > h2").textContent,
            number: entry.querySelector(".studentNumber > h2").textContent,
            phone: entry.querySelector(".phoneNumber > h2").textContent,
            email: entry.querySelector(".emailAddress > h2").textContent
        };
        modalData = {
            name: editModal.querySelector(`${path} > .studentName > input`),
            number: editModal.querySelector(`${path} > .studentNumber > input`),
            phone: editModal.querySelector(`${path} > .phoneNumber > input`),
            email: editModal.querySelector(`${path} > .email > input`)
        };
        editModalHeading.innerHTML =
            `
            <h3>Student Entry Edit Form</h3>
            <h4>
                Currently editing student entry
                <strong>#<span class="entryIdentifier">${entry.getAttribute('data-identifier')}</span></strong>
            </h4>
        `;
    };
    const users = async () => {
        entryData = {
            fullName: entry.querySelector('.fullName > h2').textContent,
            userName: entry.querySelector('.username > h2').textContent,
            role: entry.querySelector('.role > h2').textContent
        };
        modalData = {
            fullName: editModal.querySelector(`${path} > .personnelName > input`),
            userName: editModal.querySelector(`${path} > .username > input`),
            role: editModal.querySelector(`${path} > .role > input`)
        };
        editModalHeading.innerHTML =
            `
            <h3>Personnel Entry Edit Form</h3>
            <h4>
                Currently editing personnel entry
                <strong>#<span class="entryIdentifier">${entry.getAttribute('data-identifier')}</span></strong>
            </h4>
        `;
    };
    const setData = async () => {
        return new Promise(async (resolve) => {
            for (const key in entryData) {
                await delay(250);
                const initialDate = "dd MMMM yyyy";
                const intendedDate = "yyyy-MM-dd";
                modalData[key]["type"] === "text"
                    ? modalData[key].value = entryData[key]
                    : modalData[key].value = DateTime.fromFormat(entryData[key], initialDate).toFormat(intendedDate);
            }
            resolve();
        });
    };
    const resetData = async () => {
        return new Promise(async (resolve) => {
            editModalInputs.forEach((input) => input.value = '');
            checkForms(editModalForm, false);
            await setData();
            checkForms(editModalForm, false);
            resolve();
        });
    };
    const closeModal = async () => {
        editModalInputs.forEach((input) => input.value = '');
        modal.style.display = 'none';
        editModal.style.display = 'none';
    };
    switch (type) {
        case "inventory":
            await inventory();
            break;
        case "students":
            await students();
            break;
        case "users":
            await users();
            break;
    }
    editModalInputs.forEach(input => {
        input.addEventListener('input', () => checkForms(editModalForm, false));
        input.value = '';
    });
    editModalBtns['close'].addEventListener('click', () => closeModal());
    editModalBtns['reset'].addEventListener('click', () => resetData());
    editModalBtns['submit'].addEventListener('click', async (event) => {
        const button = event.target;
        const formData = new FormData(editModalForm);
        const identifier = editModal.querySelector('.form > .header > .heading > h4 > strong > .entryIdentifier').textContent;
        let fetchedData = {};
        try {
            event.preventDefault();
            for (const [name, value] of formData.entries()) {
                fetchedData[name] = value.toString();
            }
            fetchedData['id'] = identifier;
            button.innerHTML =
                `
                <i class="fa-duotone fa-loader fa-spin-pulse"></i>
                Updating...
            `;
            await fetch(`/personnel/table/${type}/edit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fetchedData)
            });
            editModalPrompts['success'].style.display = 'flex';
            setTimeout(async () => {
                await resetData();
                await closeModal();
                await setDashboardData('personnel', type);
                button.innerHTML = 'Submit changes';
                editModalPrompts['success'].style.display = 'none';
            }, 2500);
        }
        catch (err) {
            editModalPrompts['error'].style.display = 'flex';
            setTimeout(() => { editModalPrompts['error'].style.display = 'none'; throw err; }, 2500);
        }
    });
    modal.style.display = "grid";
    editModal.style.display = "grid";
    editModal.setAttribute("data-type", "edit");
    checkForms(editModalForm, false);
    await setData();
    checkForms(editModalForm, false);
};
export const openDeleteModal = async (type, modal, entry) => {
    let entryTitle;
    const deleteModal = modal.querySelector(`.${type} > .delete`);
    const deleteModalPrompts = {
        success: deleteModal.querySelector('div[data-type="success"]'),
        error: deleteModal.querySelector('div[data-type="error"]')
    };
    const deleteModalForm = deleteModal.querySelector('.container > form');
    const deleteModalBtns = {
        close: deleteModal.querySelector('.header > i'),
        return: deleteModalForm.querySelector('.actions > button[type="return"]'),
        submit: deleteModalForm.querySelector('.actions > button[type="submit"]')
    };
    const closeModal = async () => {
        modal.style.display = 'none';
        deleteModal.style.display = 'none';
    };
    switch (type) {
        case 'inventory':
            entryTitle = entry.querySelector('.title > h2').textContent;
            break;
        case 'students':
            entryTitle = `${entry.querySelector('.name > h2').textContent} ${entry.querySelector('.studentNumber > h2').textContent}`;
            break;
        case 'users':
            entryTitle = `${entry.querySelector('.fullName > h2').textContent} (${entry.querySelector('.username > h2').textContent})`;
            break;
    }
    deleteModalBtns['close'].addEventListener('click', () => closeModal());
    deleteModalBtns['return'].addEventListener('click', (event) => {
        try {
            event.preventDefault();
            closeModal();
        }
        catch (err) {
            deleteModalPrompts['error'].style.display = 'flex';
            setTimeout(() => { deleteModalPrompts['error'].style.display = 'none'; throw err; }, 2500);
        }
    });
    deleteModalBtns['submit'].addEventListener('click', async (event) => {
        const button = event.target;
        const entryIdentifier = entry.getAttribute('data-identifier');
        try {
            event.preventDefault();
            button.innerHTML =
                `
                <i class="fa-duotone fa-loader fa-spin-pulse"></i>
                Deleting...
            `;
            await fetch(`/personnel/table/${type}/delete/${entryIdentifier}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            deleteModalPrompts['success'].style.display = 'flex';
            setTimeout(async () => {
                await closeModal();
                await setDashboardData('personnel', type);
                button.innerHTML = "Yes, I'm sure!";
                deleteModalPrompts['success'].style.display = 'none';
            }, 2500);
        }
        catch (err) {
            deleteModalPrompts['error'].style.display = 'flex';
            setTimeout(() => { deleteModalPrompts['error'].style.display = 'none'; throw err; }, 2500);
        }
    });
    modal.style.display = "grid";
    deleteModal.querySelector('.container > form > .info > .entryTitle').textContent = entryTitle;
    deleteModal.style.display = "grid";
};
