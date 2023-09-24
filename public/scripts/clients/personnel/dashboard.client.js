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
                utils.setTableAction(activeTable.getAttribute('data-tab'));
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
        const bodyElement = document.querySelector('body');
        const modal = bodyElement.querySelector('.modal');
        const tableActions = bodyElement.querySelector('.controls');
        let prevTargetModal;
        let isModalOpen = false;
        tableActions.addEventListener('click', (event) => {
            const target = event.target;
            if (target && target.matches('button[data-type="action"]')) {
                const activeTab = activeTable.getAttribute('data-tab');
                const targetModal = modal.querySelector(`.${activeTab} > .action`);
                const targetModalForm = targetModal.querySelector('.form > form');
                const targetModalInputs = targetModalForm.querySelectorAll('.input');
                const targetModalHeader = targetModal.querySelector('.header > .heading');
                const targetModalHeaders = {
                    'inventory': '<h3>Book Registration Form</h3>',
                    'students': '<h3>Student Registration Form</h3>',
                    'users': '<h3>Personnel Registration Form</h3>'
                };
                targetModalHeader.innerHTML = targetModalHeaders[activeTab].toString();
                targetModalInputs.forEach((targetModalInput) => {
                    targetModalInput.value = '';
                    targetModalInput.addEventListener('input', () => {
                        utils.checkForms(targetModalForm, false);
                    });
                });
                targetModal.setAttribute('data-type', 'register');
                modal.style.display = 'grid';
                targetModal.style.display = 'grid';
                prevTargetModal = targetModal;
                isModalOpen = true;
            }
        });
        const tableSearch = () => {
            const tableSearch = tableActions.querySelector('.search');
            const tableSearchInput = tableSearch.querySelector('.input > input[type="text"]');
            const tableSearchSubmit = tableActions.querySelector('button[data-type="search"]');
            const searchFunction = async () => {
                try {
                    const activeTab = activeTable.getAttribute('data-tab');
                    const tableEntries = activeTable.querySelector('.data > .entries');
                    const query = tableSearchInput.value.trim();
                    const response = await fetch(`/personnel/table/${activeTab}/fetch/${query}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const tableData = await response.json();
                    tableEntries.innerHTML = '';
                    tableSearchSubmit.disabled = true;
                    tableSearchSubmit.innerHTML =
                        `
                    <i class="fa-duotone fa-loader fa-spin-pulse"></i>
                    Searching...
                    `;
                    setTimeout(() => {
                        tableSearchSubmit.disabled = false;
                        tableSearchSubmit.innerHTML =
                            `
                        <i class="fa-regular fa-magnifying-glass"></i>
                        Search
                        `;
                        Object.values(tableData).forEach(async (data) => {
                            tableEntries.innerHTML += data;
                        });
                    }, 2500);
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
            };
            tableSearchInput.value = '';
            tableSearchSubmit.disabled = true;
            tableSearchInput.addEventListener('keydown', async (event) => {
                if (event.key === 'Enter' && tableSearchInput.value.trim() !== '') {
                    await searchFunction();
                }
            });
            tableSearchInput.addEventListener('input', (event) => {
                const activeTab = activeTable.getAttribute('data-tab');
                event.preventDefault();
                if (tableSearchInput.value.trim() === '') {
                    tableSearchSubmit.disabled = true;
                    utils.setDashboardData('personnel', activeTab);
                }
                else {
                    tableSearchSubmit.disabled = false;
                }
            });
            tableSearchSubmit.addEventListener('click', async (event) => {
                event.preventDefault();
                await searchFunction();
            });
        };
        tableSearch();
        const modalActions = () => {
            const closeModalBtns = modal.querySelectorAll('div > div > .header > i');
            const modalForms = modal.querySelectorAll('div > div > form');
            modalForms.forEach((modalForm) => {
                const modalFormInputs = modalForm.querySelectorAll('div > input');
                const resetFormBtns = modalForm.querySelectorAll('.actions > button[type="reset"]');
                const submitFormBtns = modalForm.querySelectorAll('.actions > button[type="submit"]');
                const resetForm = async () => {
                    return new Promise((resolve) => {
                        modalFormInputs.forEach((modalFormInput) => {
                            modalFormInput.value = '';
                            utils.checkForms(modalForm, false);
                        });
                        resolve();
                    });
                };
                const closeModal = async () => {
                    if (!isModalOpen) {
                        return;
                    }
                    return new Promise(async (resolve) => {
                        modal.style.display = 'none';
                        prevTargetModal.style.display = 'none';
                        isModalOpen = false;
                        await resetForm();
                        resolve();
                    });
                };
                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') {
                        closeModal();
                    }
                });
                closeModalBtns.forEach((closeModalBtn) => {
                    closeModalBtn.addEventListener('click', () => {
                        closeModal();
                        closeModalBtn.removeEventListener('click', closeModal);
                    });
                });
                resetFormBtns.forEach((resetFormBtn) => {
                    resetFormBtn.addEventListener('click', () => { resetForm(); });
                });
                submitFormBtns.forEach((submitFormBtn) => {
                    submitFormBtn.addEventListener('click', async (event) => {
                        const activeTab = activeTable.getAttribute('data-tab');
                        const targetModal = modal.querySelector(`.${activeTab} > .action`);
                        const targetModalSuccess = targetModal.querySelector('div[data-type="success"]');
                        const targetModalError = targetModal.querySelector('div[data-type="error"]');
                        const operationType = targetModal.getAttribute('data-type');
                        try {
                            event.preventDefault();
                            if (submitFormBtn.parentElement.parentElement.parentElement.parentElement.className !== "lend") {
                                const formData = new FormData(modalForm);
                                const formIdentifier = targetModal.querySelector('.form > .header > .heading > h4 > strong > .entryIdentifier').textContent;
                                let registrationData = {};
                                for (const [name, value] of formData.entries()) {
                                    registrationData[name] = value.toString();
                                }
                                registrationData['id'] = formIdentifier;
                                await fetch(`/personnel/table/${activeTab}/actions/${operationType}`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(registrationData)
                                });
                                targetModalSuccess.style.display = 'flex';
                                setTimeout(async () => {
                                    await resetForm();
                                    await closeModal();
                                    await utils.setDashboardData('personnel', activeTab);
                                    targetModalSuccess.style.display = 'none';
                                }, 2500);
                            }
                        }
                        catch (err) {
                            targetModalError.style.display = 'flex';
                            setTimeout(() => { targetModalError.style.display = 'none'; }, 2500);
                        }
                    });
                });
                utils.checkForms(modalForm, false);
            });
        };
        modalActions();
        const entryActions = () => {
            bodyElement.addEventListener('click', async (event) => {
                const activeTab = activeTable.getAttribute('data-tab');
                const target = event.target;
                const targetAction = target.classList[0];
                const invEdit = async () => {
                    const entry = target.parentElement.parentElement;
                    const targetModal = modal.querySelector(`.${activeTab} > .action`);
                    const modalPath = '.action > .form > form';
                    const entryData = {
                        title: entry.querySelector('.title > h2').textContent,
                        author: entry.querySelector('.author > h2').textContent,
                        genre: entry.querySelector('.genre > h2').textContent,
                        datePublicized: entry.querySelector('.publicationDate > h2').textContent
                    };
                    const modalData = {
                        title: targetModal.querySelector(`${modalPath} > .title > input`),
                        author: targetModal.querySelector(`${modalPath} > .author > input`),
                        genre: targetModal.querySelector(`${modalPath} > .genre > input`),
                        datePublicized: targetModal.querySelector(`${modalPath} > .dPublicized > input`),
                    };
                    await utils.openEditModal({
                        modal: modal,
                        target: target,
                        active: activeTable.getAttribute('data-tab'),
                    }, entryData, modalData);
                    prevTargetModal = targetModal;
                    isModalOpen = true;
                };
                const studentsEdit = async () => {
                    const entry = target.parentElement.parentElement;
                    const targetModal = modal.querySelector(`.${activeTab} > .action`);
                    const modalPath = '.action > .form > form';
                    const entryData = {
                        studentName: entry.querySelector('.name > h2').textContent,
                        studentNumber: entry.querySelector('.studentNumber > h2').textContent,
                        phoneNumber: entry.querySelector('.phoneNumber > h2').textContent,
                        emailAddress: entry.querySelector('.emailAddress > h2').textContent
                    };
                    const modalData = {
                        studentName: targetModal.querySelector(`${modalPath} > .studentName > input`),
                        studentNumber: targetModal.querySelector(`${modalPath} > .studentNumber > input`),
                        phoneNumber: targetModal.querySelector(`${modalPath} > .phoneNumber > input`),
                        emailAddress: targetModal.querySelector(`${modalPath} > .email > input`)
                    };
                    await utils.openEditModal({
                        modal: modal,
                        target: target,
                        active: activeTable.getAttribute('data-tab'),
                    }, entryData, modalData);
                    prevTargetModal = targetModal;
                    isModalOpen = true;
                };
                const usersEdit = async () => {
                    const entry = target.parentElement.parentElement;
                    const targetModal = modal.querySelector(`.${activeTab} > .action`);
                    const modalPath = '.action > .form > form';
                    const entryData = {
                        fullName: entry.querySelector('.fullName > h2').textContent,
                        userName: entry.querySelector('.username > h2').textContent,
                        role: entry.querySelector('.role > h2').textContent
                    };
                    const modalData = {
                        fullName: targetModal.querySelector(`${modalPath} > .personnelName > input`),
                        userName: targetModal.querySelector(`${modalPath} > .username > input`),
                        role: targetModal.querySelector(`${modalPath} > .role > input`)
                    };
                    await utils.openEditModal({
                        modal: modal,
                        target: target,
                        active: activeTable.getAttribute('data-tab'),
                    }, entryData, modalData);
                    prevTargetModal = targetModal;
                    isModalOpen = true;
                };
                const invDelete = async () => {
                    console.log('inventory delete');
                };
                const studentsDelete = async () => {
                    console.log('student delete');
                };
                const usersDelete = async () => {
                    console.log('user delete');
                };
                const invLend = async (type) => {
                    const entry = target.parentElement.parentElement;
                    const entryId = entry.getAttribute('data-identifier');
                    const lendModal = modal.querySelector(`.${type} > .lend`);
                    const lendModalSuccess = lendModal.querySelector('div[data-type="success"]');
                    const lendModalError = lendModal.querySelector('div[data-type="error"]');
                    const lendModalForm = lendModal.querySelector('form');
                    const lendModalClose = lendModal.querySelector('.header > i');
                    const lendModalReset = lendModalForm.querySelector('.actions > button[type="reset"]');
                    const lendModalSubmit = lendModalForm.querySelector('.actions > button[type="submit"]');
                    const lendModalBtns = lendModalForm.querySelectorAll('div[data-type="preview"] > i');
                    const lendModalInputs = lendModalForm.querySelectorAll('div > input');
                    const lendModalPreviews = lendModalForm.querySelectorAll('div[data-type="preview"]');
                    const resetForm = async () => {
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
                            await resetForm();
                            resolve();
                        });
                    };
                    try {
                        lendModalBtns.forEach((lendModalBtn) => lendModalBtn.addEventListener('click', async (element) => {
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
                        lendModalReset.addEventListener('click', async () => await resetForm());
                        lendModalClose.addEventListener('click', async () => await closeModal());
                        lendModalSubmit.addEventListener('click', async () => {
                            try {
                                const data = {
                                    type: type,
                                    entryId: entryId,
                                    modalId: lendModal.querySelector(`form > .${type === 'students' ? 'book' : 'student'}`).getAttribute('data-identifier'),
                                    dueDate: lendModal.querySelector('form > .dueDate > input')['value']
                                };
                                await fetch("/personnel/table/lend/", {
                                    method: "POST",
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(data)
                                });
                                lendModalSuccess.style.display = 'flex';
                                setTimeout(async () => {
                                    await resetForm();
                                    await closeModal();
                                    lendModalSuccess.style.display = 'none';
                                }, 2500);
                            }
                            catch (err) {
                                lendModalError.style.display = 'flex';
                                setTimeout(() => { lendModalError.style.display = 'none'; }, 2500);
                            }
                        });
                        utils.checkForms(lendModalForm, true);
                        modal.style.display = 'grid';
                        lendModal.style.display = 'grid';
                        prevTargetModal = lendModal;
                        isModalOpen = true;
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
                };
                const studentsNotify = async () => {
                    console.log('student notify');
                };
                switch (targetAction) {
                    case 'pInventoryActionsEdit':
                        await invEdit();
                        break;
                    case 'pInventoryActionsDelete':
                        await invDelete();
                        break;
                    case 'pInventoryActionsBookLend':
                        await invLend("inventory");
                        break;
                    case 'pInventoryActionsStudentLend':
                        await invLend("students");
                        break;
                    case 'pStudentsActionsEdit':
                        await studentsEdit();
                        break;
                    case 'pStudentsActionsDelete':
                        await studentsDelete();
                        break;
                    case 'pStudentsActionsNotify':
                        await studentsNotify();
                        break;
                    case 'pUsersActionsEdit':
                        await usersEdit();
                        break;
                    case 'pUsersActionsDelete':
                        await usersDelete();
                        break;
                    default: break;
                }
            });
        };
        entryActions();
    };
    tableActions();
    utils.setDashboardData('personnel');
    utils.setTableAction('dashboard');
});
