import * as utils from "../../utils/client.utils.js";
document.addEventListener('DOMContentLoaded', () => {
    const bodyElement = document.querySelector('body');
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
                const activeTable = bodyElement.querySelector(`.table[data-tab="${targetTable.classList[0]}"]`);
                const tableActionsBtn = bodyElement.querySelector('.actions > button');
                const setTableAction = async (tab) => {
                    tableActionsBtn.innerHTML = '';
                    try {
                        switch (tab) {
                            case 'dashboard':
                                tableActionsBtn.style.display = 'none';
                                break;
                            case 'inventory':
                                tableActionsBtn.style.display = 'flex';
                                tableActionsBtn.outerHTML =
                                    `
                                    <button class="tableAction" data-tab="inventory">
                                        <i class="fa-regular fa-plus"></i>
                                        Register a book
                                    </button>
                                `;
                                break;
                            case 'students':
                                tableActionsBtn.style.display = 'flex';
                                tableActionsBtn.outerHTML =
                                    `
                                    <button class="tableAction" data-tab="students">
                                        <i class="fa-regular fa-plus"></i>
                                        Enroll a student
                                    </button>
                                `;
                                break;
                            case 'users':
                                tableActionsBtn.style.display = 'flex';
                                tableActionsBtn.outerHTML =
                                    `
                                    <button class="tableAction" data-tab="users">
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
                        window.location.href = `/error?${(await utils.errorPrompt({ title: name, body: message })).toString()}`;
                    }
                };
                navigationTabs.forEach(navigationTab => { navigationTab.classList.remove('active'); });
                navigationTab.classList.add('active');
                tables.forEach(table => {
                    table.setAttribute('data-active', 'false');
                    table.style.display = 'none';
                });
                activeTable.style.display = 'grid';
                activeTable.setAttribute('data-active', 'true');
                setTableAction(activeTable.getAttribute('data-tab'));
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
            const activeTable = bodyElement.querySelector('.table[data-active="true"]');
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
    utils.setDashboardData('personnel');
});
