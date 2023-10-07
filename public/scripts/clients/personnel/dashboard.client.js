import * as utils from "../../utils/client.utils.js";
document.addEventListener('DOMContentLoaded', () => {
    const bodyElement = document.querySelector('body');
    let activeTable = bodyElement.querySelector('.table[data-active="true"]');
    utils.setPreferredTheme((cbData) => {
        !cbData.savedTheme
            ? (!cbData.preferredTheme
                ? utils.setLightTheme()
                : utils.setDarkTheme())
            : (cbData.savedTheme === 'light'
                ? utils.setLightTheme()
                : utils.setDarkTheme());
    });
    const navigationTabs = () => {
        const tables = bodyElement.querySelectorAll('.table');
        const navigation = bodyElement.querySelector('header > nav');
        const navigationTabs = navigation.querySelectorAll('.tabs > div');
        navigationTabs.forEach(navigationTab => {
            navigationTab.addEventListener('click', (event) => {
                const targetTable = event.target;
                activeTable = bodyElement.querySelector(`.table[data-tab="${targetTable.classList[0]}"]`);
                navigationTabs.forEach(navigationTab => { navigationTab.classList.remove('active'); });
                navigationTab.classList.add('active');
                tables.forEach(table => {
                    table.setAttribute('data-active', 'false');
                    table.style.display = 'none';
                });
                activeTable.style.display = 'grid';
                activeTable.setAttribute('data-active', 'true');
                utils.setDashboardData('personnel', activeTable.getAttribute('data-tab'));
            });
        });
    };
    navigationTabs();
    const navigationActions = () => {
        const nav = bodyElement.querySelector('header > nav');
        const navActions = nav.querySelector('.actions');
        const navRefresh = navActions.querySelector('.refresh');
        const navTheme = navActions.querySelector('.themeSwitch');
        const navLogout = navActions.querySelector('.logout');
        navRefresh.addEventListener('click', (event) => {
            event.preventDefault();
            navRefresh.innerHTML =
                `
                <i class="fa-regular fa-redo fa-spin-pulse"></i>
                <h2>Refreshing...</h2>
            `;
            setTimeout(async () => {
                navRefresh.innerHTML =
                    `
                    <i class="fa-regular fa-redo"></i>
                    <h2>Refresh</h2>
                `;
                utils.setDashboardData('personnel', activeTable.getAttribute('data-tab'));
            }, 2500);
        });
        navTheme.addEventListener('click', (event) => {
            const currentTheme = localStorage.getItem('theme');
            event.preventDefault();
            currentTheme === 'light'
                ? utils.setDarkTheme()
                : utils.setLightTheme();
        });
        navLogout.addEventListener('click', (event) => {
            event.preventDefault();
            navLogout.innerHTML =
                `
                <i class="fa-duotone fa-loader fa-spin-pulse"></i>
                <h2>Logging out...</h2>
            `;
            setTimeout(async () => {
                try {
                    const response = await fetch('/personnel/logout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    navLogout.innerHTML =
                        `
                        <i class="fa-regular fa-right-from-bracket"></i>
                        <h2>Logout</h2>
                    `;
                    !response.ok
                        ? window.location.href = `/error?${await response.text()}`
                        : window.location.href = '/';
                }
                catch (err) {
                    window.location.href =
                        `
                    /error?
                    ${(await utils.errorPrompt({
                            title: err['name'],
                            body: err['message']
                        })).toString()}
                    `;
                }
            }, 2500);
        });
    };
    navigationActions();
    const tableActions = () => {
        let isModalOpen = false;
        const tableControls = bodyElement.querySelectorAll('.table > .controls');
        const modal = bodyElement.querySelector('.modal');
        const tableSearch = () => {
            tableControls.forEach(tableControl => {
                const tableSearchForm = tableControl.querySelector('.search');
                const tableSearchInput = tableSearchForm.querySelector('.input > input');
                const tableSearchSubmit = tableSearchForm.querySelector('button[data-type="search"]');
                const currentTab = activeTable.getAttribute('data-tab');
                const currentTabEntries = activeTable.querySelector('.data > .entries');
                tableSearchInput.addEventListener('input', async () => {
                    let response;
                    if (tableSearchInput.value === '') {
                        console.log("IDIOT");
                        tableSearchSubmit.disabled = true;
                        tableSearchSubmit.innerHTML =
                            `
                            <i class="fa-duotone fa-loader fa-spin-pulse"></i>
                            Searching...
                        `;
                        response = await fetch(`/personnel/table/${currentTab}/search`, {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        currentTabEntries.innerHTML = '';
                        tableSearchSubmit.disabled = false;
                        tableSearchSubmit.innerHTML =
                            `
                            <i class="fa-regular fa-magnifying-glass"></i>
                            Search
                        `;
                        Object.values(await response.json()).forEach(async (data) => currentTabEntries.innerHTML += data);
                    }
                    utils.checkForms(tableSearchForm, false);
                });
                tableSearchSubmit.addEventListener('click', async (event) => {
                    event.preventDefault();
                    const searchQuery = tableSearchInput.value;
                    let response;
                    tableSearchSubmit.disabled = true;
                    tableSearchSubmit.innerHTML =
                        `
                        <i class="fa-duotone fa-loader fa-spin-pulse"></i>
                        Searching...
                    `;
                    response = await fetch(`/personnel/table/${currentTab}/search/${searchQuery}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    currentTabEntries.innerHTML = '';
                    tableSearchSubmit.disabled = false;
                    tableSearchSubmit.innerHTML =
                        `
                        <i class="fa-regular fa-magnifying-glass"></i>
                        Search
                    `;
                    Object.values(await response.json()).forEach(async (data) => currentTabEntries.innerHTML += data);
                });
                tableSearchInput.value = '';
                utils.checkForms(tableSearchForm, false);
            });
        };
        tableSearch();
        bodyElement.addEventListener('click', async (event) => {
            const target = event.target;
            if (target.getAttribute('data-action') === 'register') {
                utils.openRegisterModal(target.getAttribute('data-type'), modal);
            }
        });
        const entryActions = () => {
            bodyElement.addEventListener('click', async (event) => {
                const target = event.target;
                const targetAction = target.classList[0];
                const invLend = async (type) => {
                    const entry = target.parentElement.parentElement;
                    const entryId = entry.getAttribute('data-identifier');
                    const lendModal = modal.querySelector(`.${type} > .lend`);
                    const lendModalPrompts = {
                        success: lendModal.querySelector('div[data-type="success"]'),
                        error: lendModal.querySelector('div[data-type="error"]')
                    };
                    const lendModalForm = lendModal.querySelector('form');
                    const lendModalBtns = {
                        close: lendModal.querySelector('.header > i'),
                        reset: lendModalForm.querySelector('.actions > button[type="reset"]'),
                        submit: lendModalForm.querySelector('.actions > button[type="submit"]')
                    };
                    const lendModalAssign = lendModalForm.querySelectorAll('div[data-type="preview"] > i');
                    const lendModalInputs = lendModalForm.querySelectorAll('div > input');
                    const lendModalPreviews = lendModalForm.querySelectorAll('div[data-type="preview"]');
                    const resetData = async () => {
                        for (const preview of lendModalPreviews) {
                            preview.setAttribute('data-identifier', 'null');
                            preview.querySelector('h3').textContent = 'None assigned';
                            utils.checkForms(lendModalForm, true);
                        }
                    };
                    const closeModal = async () => {
                        if (!isModalOpen) {
                            return;
                        }
                        return new Promise(async (resolve) => {
                            modal.style.display = 'none';
                            lendModal.style.display = 'none';
                            isModalOpen = false;
                            await resetData();
                            resolve();
                        });
                    };
                    lendModalAssign.forEach((button) => button.addEventListener('click', async (element) => {
                        const target = element.target;
                        const modalType = target.parentElement.className;
                        const assignModal = modal.querySelector('.inventory > .assign');
                        const assignModalHeading = assignModal.querySelector('.header > h3');
                        const assignModalClose = assignModal.querySelector('.header > i');
                        const assignModalContainer = assignModal.querySelector('.form > .container');
                        const assignModalCounter = assignModal.querySelector('.footer > h3 > .counter');
                        const assignModalReset = assignModal.querySelector('.footer > .actions > button[type="reset"]');
                        const assignModalSubmit = assignModal.querySelector('.footer > .actions > button[type="submit"]');
                        let assignModalEntries;
                        const studentModal = async () => {
                            const response = await fetch(`/personnel/table/students/fetch/Vacant`, {
                                method: 'GET',
                                headers: { 'Content-Type': 'application/json' }
                            });
                            const responseBody = await response.json();
                            let entriesCounter = 0;
                            assignModalHeading.textContent = 'Choose a student';
                            Object.values(responseBody).forEach((data) => {
                                const entry = `
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
                                `;
                                assignModalContainer.innerHTML += entry;
                                entriesCounter++;
                                assignModalCounter.textContent = entriesCounter.toString();
                                assignModalEntries = assignModalContainer.querySelectorAll('.entry');
                            });
                        };
                        const bookModal = async () => {
                            const response = await fetch(`/personnel/table/inventory/fetch/Available`, {
                                method: 'GET',
                                headers: { 'Content-Type': 'application/json' }
                            });
                            const responseBody = await response.json();
                            let entriesCounter = 0;
                            assignModalHeading.textContent = 'Choose a book';
                            Object.values(responseBody).forEach((data) => {
                                const entry = `
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
                                `;
                                assignModalContainer.innerHTML += entry;
                                entriesCounter++;
                                assignModalCounter.textContent = entriesCounter.toString();
                                assignModalEntries = assignModalContainer.querySelectorAll('.entry');
                            });
                        };
                        const closeModal = async () => {
                            assignModalContainer.innerHTML = '';
                            assignModalSubmit.disabled = true;
                            lendModal.style.display = 'grid';
                            assignModal.style.display = 'none';
                            isModalOpen = true;
                        };
                        assignModalContainer.innerHTML = '';
                        assignModalSubmit.disabled = true;
                        lendModal.style.display = 'none';
                        assignModal.style.display = 'flex';
                        isModalOpen = false;
                        modalType === 'book'
                            ? await bookModal()
                            : await studentModal();
                        assignModalEntries.forEach((entry) => {
                            const entryDropdown = entry.querySelector('.dropdown');
                            const entryDropdownBtn = entry.querySelector('.preview > .toggleDropdown');
                            entry.addEventListener('click', async () => {
                                for (const modalEntry of assignModalEntries) {
                                    if (modalEntry != entry && modalEntry.getAttribute('data-selected') === 'true') {
                                        modalEntry.setAttribute('data-selected', 'false');
                                        assignModalSubmit.disabled = true;
                                    }
                                }
                                entry.getAttribute('data-selected') === 'false'
                                    ? (entry.setAttribute('data-selected', 'true'),
                                        assignModalSubmit.disabled = false)
                                    : (entry.setAttribute('data-selected', 'false'),
                                        assignModalSubmit.disabled = true);
                            });
                            entryDropdownBtn.addEventListener('click', (element) => {
                                const button = element.target;
                                entryDropdown.getAttribute('data-hidden') === 'false'
                                    ? (button.classList.remove('fa-caret-up'),
                                        button.classList.add('fa-caret-down'),
                                        entryDropdown.setAttribute('data-hidden', 'true'))
                                    : (button.classList.remove('fa-caret-down'),
                                        button.classList.add('fa-caret-up'),
                                        entryDropdown.setAttribute('data-hidden', 'false'));
                            });
                        });
                        assignModalClose.addEventListener('click', closeModal);
                        assignModalReset.addEventListener('click', () => {
                            for (const entry of assignModalEntries) {
                                entry.setAttribute('data-selected', 'false');
                            }
                            assignModalSubmit.disabled = true;
                        });
                        assignModalSubmit.addEventListener('click', async () => {
                            for (const entry of assignModalEntries) {
                                if (entry.getAttribute('data-selected') === 'true') {
                                    const entryIdentifier = entry.querySelector('.dropdown > .identifier > h3 > .data').textContent;
                                    const entryName = entry.querySelector('.preview > .name').textContent;
                                    const modalPreview = lendModal.querySelector(`form > .${modalType}`);
                                    modalPreview.querySelector('h3').textContent = entryName;
                                    modalPreview.setAttribute('data-identifier', entryIdentifier);
                                    entry.setAttribute('data-selected', 'false');
                                    await closeModal();
                                }
                            }
                            utils.checkForms(lendModalForm, true);
                        });
                    }));
                    lendModalPreviews.forEach((preview) => {
                        preview.setAttribute('data-identifier', 'null');
                        preview.querySelector('h3').textContent = 'None assigned';
                    });
                    lendModalInputs.forEach((input) => {
                        input.value = '';
                        input.addEventListener('input', () => utils.checkForms(lendModalForm, true));
                    });
                    lendModalBtns['close'].addEventListener('click', async () => await closeModal());
                    lendModalBtns['reset'].addEventListener('click', async () => await resetData());
                    lendModalBtns['submit'].addEventListener('click', async (event) => {
                        const button = event.target;
                        const data = {
                            entryId: entryId,
                            modalId: lendModal.querySelector(`form > .${type === 'students' ? 'book' : 'student'}`).getAttribute('data-identifier'),
                            dueDate: lendModal.querySelector('form > .dueDate > input')['value']
                        };
                        try {
                            event.preventDefault();
                            button.innerHTML =
                                `
                                <i class="fa-duotone fa-loader fa-spin-pulse"></i>
                                Updating...
                            `;
                            await fetch(`/personnel/table/${type}/lend`, {
                                method: "POST",
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                            });
                            lendModalPrompts['success'].style.display = 'flex';
                            setTimeout(async () => {
                                button.innerHTML = 'Submit changes';
                                await resetData();
                                await closeModal();
                                lendModalPrompts['success'].style.display = 'none';
                            }, 2500);
                        }
                        catch (err) {
                            lendModalPrompts['error'].style.display = 'flex';
                            setTimeout(() => { lendModalPrompts['error'].style.display = 'none'; throw err; }, 2500);
                        }
                    });
                    utils.checkForms(lendModalForm, true);
                    modal.style.display = 'grid';
                    lendModal.style.display = 'grid';
                    isModalOpen = true;
                };
                const studentsNotify = async () => {
                };
                try {
                    switch (targetAction) {
                        case 'pInventoryActionsEdit':
                            await utils.openEditModal('inventory', modal, target.parentElement.parentElement);
                            break;
                        case 'pInventoryActionsDelete':
                            await utils.openDeleteModal('inventory', modal, target.parentElement.parentElement);
                            break;
                        case 'pInventoryActionsBookLend':
                            await invLend("inventory");
                            break;
                        case 'pInventoryActionsStudentLend':
                            await invLend("students");
                            break;
                        case 'pStudentsActionsEdit':
                            await utils.openEditModal('students', modal, target.parentElement.parentElement);
                            break;
                        case 'pStudentsActionsDelete':
                            await utils.openDeleteModal('students', modal, target.parentElement.parentElement);
                            break;
                        case 'pStudentsActionsNotify':
                            await studentsNotify();
                            break;
                        case 'pUsersActionsEdit':
                            await utils.openEditModal('users', modal, target.parentElement.parentElement);
                            break;
                        case 'pUsersActionsDelete':
                            await utils.openDeleteModal('users', modal, target.parentElement.parentElement);
                            break;
                        default: break;
                    }
                }
                catch (err) {
                    window.location.href =
                        `
                    /error?
                    ${(await utils.errorPrompt({
                            title: err['name'],
                            body: err['message']
                        })).toString()}
                    `;
                }
            });
        };
        entryActions();
    };
    tableActions();
    utils.setDashboardData('personnel');
});
