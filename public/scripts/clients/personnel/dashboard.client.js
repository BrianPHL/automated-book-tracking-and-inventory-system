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
                    const { name, message } = err;
                    window.location.href = `/error?${(await utils.errorPrompt({ title: name, body: message })).toString()}`;
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
                    const response = await fetch(`/personnel/table/${activeTab}/search/${query}`, {
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
                    const { name, message } = err;
                    window.location.href = `/error?${(await utils.errorPrompt({ title: name, body: message })).toString()}`;
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
                    return new Promise((resolve) => {
                        modal.style.display = 'none';
                        prevTargetModal.style.display = 'none';
                        isModalOpen = false;
                        modalFormInputs.forEach((modalFormInput) => { modalFormInput.value = ''; });
                        resolve();
                    });
                };
                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape' && isModalOpen) {
                        closeModal();
                    }
                });
                closeModalBtns.forEach((closeModalBtn) => {
                    closeModalBtn.addEventListener('click', () => { closeModal(); });
                });
                });
                resetFormBtns.forEach((resetFormBtn) => {
                    resetFormBtn.addEventListener('click', () => { resetForm(); });
                });
                submitFormBtns.forEach((submitFormBtn) => {
                    submitFormBtn.addEventListener('click', async (event) => {
                        const activeTab = activeTable.getAttribute('data-tab');
                        const targetModal = modal.querySelector(`.${activeTab} > .action`);
                        const successPrompt = targetModal.querySelector('div[data-type="success"]');
                        const errorPrompt = targetModal.querySelector('div[data-type="error"]');
                        const operationType = targetModal.getAttribute('data-type');
                        try {
                            event.preventDefault();
                            const formData = new FormData(modalForm);
                            let registrationData = {};
                            for (const [name, value] of formData.entries()) {
                                registrationData[name] = value.toString();
                            }
                            await fetch(`/personnel/table/${activeTab}/actions/${operationType}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(registrationData)
                            });
                            successPrompt.style.display = 'flex';
                            setTimeout(async () => {
                                await resetForm();
                                await closeModal();
                                await utils.setDashboardData('personnel', activeTab);
                                successPrompt.style.display = 'none';
                            }, 2500);
                        }
                        catch (err) {
                            errorPrompt.style.display = 'flex';
                            setTimeout(() => { errorPrompt.style.display = 'none'; }, 2500);
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
                const targetEntry = target.parentElement.parentElement;
                const targetModal = modal.querySelector(`.${activeTab} > .action`);
                const targetAction = target.classList[0];
                const targetModalHeading = targetModal.querySelector('.header');
                const inventoryEntryEdit = async () => {
                    const modalPath = '.action > .form > form';
                    const entryData = {
                        title: targetEntry.querySelector('.title > h2').textContent,
                        author: targetEntry.querySelector('.author > h2').textContent,
                        genre: targetEntry.querySelector('.genre > h2').textContent,
                        datePublicized: targetEntry.querySelector('.publicationDate > h2').textContent
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
                const studentsEntryEdit = async () => {
                    const modalPath = '.action > .form > form';
                    const entryData = {
                        studentName: targetEntry.querySelector('.name > h2').textContent,
                        studentNumber: targetEntry.querySelector('.studentNumber > h2').textContent,
                        phoneNumber: targetEntry.querySelector('.phoneNumber > h2').textContent,
                        emailAddress: targetEntry.querySelector('.emailAddress > h2').textContent
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
                const usersEntryEdit = async () => {
                    const modalPath = '.action > .form > form';
                    const entryData = {
                        fullName: targetEntry.querySelector('.fullName > h2').textContent,
                        userName: targetEntry.querySelector('.username > h2').textContent,
                        role: targetEntry.querySelector('.role > h2').textContent
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
                switch (targetAction) {
                    case 'pInventoryActionsEdit':
                        await inventoryEntryEdit();
                        break;
                    case 'pStudentsActionsEdit':
                        await studentsEntryEdit();
                        break;
                    case 'pUsersActionsEdit':
                        await usersEntryEdit();
                        break;
                }
            });
        };
        entryActions();
    };
    tableActions();
    utils.setDashboardData('personnel');
    utils.setTableAction('dashboard');
});
