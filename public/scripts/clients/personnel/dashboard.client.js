import * as utils from "../../utils/client.utils.js";
document.addEventListener('DOMContentLoaded', () => {
    const bodyElement = document.querySelector('body');
    let activeTable;
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
        const navigation = bodyElement.querySelector('header > nav');
        const navigationActions = navigation.querySelector('.actions');
        const navigationRefresh = navigationActions.querySelector('.refresh');
        const navigationTheme = navigationActions.querySelector('.themeSwitch');
        const navigationLogout = navigationActions.querySelector('.logout');
        navigationRefresh.addEventListener('click', (event) => {
            event.preventDefault();
            navigationRefresh.innerHTML =
                `
                <i class="fa-regular fa-redo fa-spin-pulse"></i>
                <h2>Refreshing...</h2>
            `;
            setTimeout(async () => {
                navigationRefresh.innerHTML =
                    `
                    <i class="fa-regular fa-redo"></i>
                    <h2>Refresh</h2>
                `;
                utils.setDashboardData('personnel', activeTable.getAttribute('data-tab'));
            }, 2500);
        });
        navigationTheme.addEventListener('click', (event) => {
            const currentTheme = localStorage.getItem('theme');
            event.preventDefault();
            currentTheme === 'light'
                ? utils.setDarkTheme()
                : utils.setLightTheme();
        });
        navigationLogout.addEventListener('click', (event) => {
            event.preventDefault();
            navigationLogout.innerHTML =
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
                    navigationLogout.innerHTML =
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
        const tableActions = bodyElement.querySelector('.controls');
        const modal = bodyElement.querySelector('.modal');
        let prevTargetModal;
        let isModalOpen = false;
        let currentTable;
        tableActions.addEventListener('click', () => {
            const target = event.target;
            if (target && target.matches('button[data-type="action"]')) {
                const activeTab = activeTable.getAttribute('data-tab');
                const targetModal = modal.querySelector(`.${activeTab} > .action`);
                prevTargetModal = targetModal;
                modal.style.display = 'grid';
                targetModal.style.display = 'grid';
                isModalOpen = true;
            }
        });
        const tableControlsSearch = () => {
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
        tableControlsSearch();
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
                            utils.checkFormInputs(modalForm);
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
                modalFormInputs.forEach((modalFormInput) => {
                    modalFormInput.addEventListener('input', () => { utils.checkFormInputs(modalForm); });
                });
                resetFormBtns.forEach((resetFormBtn) => {
                    resetFormBtn.addEventListener('click', () => { resetForm(); });
                });
                submitFormBtns.forEach((submitFormBtn) => {
                    submitFormBtn.addEventListener('click', async (event) => {
                        const activeTab = activeTable.getAttribute('data-tab');
                        const successPrompts = modal.querySelectorAll('div[data-type="success"]');
                        const errorPrompts = modal.querySelectorAll('div[data-type="error"]');
                        try {
                            event.preventDefault();
                            const formData = new FormData(modalForm);
                            let registrationData = {};
                            for (const [name, value] of formData.entries()) {
                                registrationData[name] = value.toString();
                            }
                            await fetch(`/personnel/table/${activeTab}/actions/register`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(registrationData)
                            });
                            successPrompts.forEach((successPrompt) => {
                                successPrompt.style.display = 'flex';
                                setTimeout(async () => {
                                    await resetForm();
                                    await closeModal();
                                    await utils.setDashboardData('personnel', activeTab);
                                    successPrompt.style.display = 'none';
                                }, 2500);
                            });
                        }
                        catch (err) {
                            errorPrompts.forEach((errorPrompt) => {
                                errorPrompt.style.display = 'flex';
                                setTimeout(() => {
                                    errorPrompt.style.display = 'none';
                                }, 2500);
                            });
                        }
                    });
                });
                utils.checkFormInputs(modalForm);
            });
        };
        modalActions();
    };
    tableActions();
    const tableControls = () => {
    };
    tableControls();
    utils.setDashboardData('personnel');
    utils.setTableAction('dashboard');
});
