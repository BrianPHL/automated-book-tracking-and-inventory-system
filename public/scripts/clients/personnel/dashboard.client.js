import * as utils from "../../utils/client.utils.js";
document.addEventListener('DOMContentLoaded', () => {
    const htmlElement = document.querySelector('html');
    const bodyElement = htmlElement.querySelector('body');
    const header = bodyElement.querySelector('header');
    const nav = header.querySelector('nav');
    const navTabs = nav.querySelector('.tabs');
    const navTabsBtn = navTabs.querySelectorAll('div');
    const navActions = nav.querySelector('.actions');
    const navActionsTheme = navActions.querySelector('.themeSwitch');
    const navActionsLogout = navActions.querySelector('.logout');
    const mainTabs = bodyElement.querySelectorAll('main');
    utils.setPreferredTheme((cbData) => {
        !cbData.savedTheme
            ? (!cbData.preferredTheme
                ? utils.setLightTheme()
                : utils.setDarkTheme())
            : (cbData.savedTheme === 'light'
                ? utils.setLightTheme()
                : utils.setDarkTheme());
    });
    navActionsTheme.addEventListener('click', (event) => {
        event.preventDefault();
        const currentTheme = localStorage.getItem('theme');
        currentTheme === 'light'
            ? utils.setDarkTheme()
            : utils.setLightTheme();
    });
    navActionsLogout.addEventListener('click', (event) => {
        event.preventDefault();
        navActionsLogout.innerHTML =
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
    navTabsBtn.forEach(tabs => {
        tabs.addEventListener('click', (event) => {
            const navTab = event.target;
            const mainTab = bodyElement.querySelector(`main[data-tab="${navTab.classList[0]}"]`);
            navTabsBtn.forEach(tabs => { tabs.classList.remove('active'); });
            mainTabs.forEach(tabs => { tabs.style.display = 'none'; });
            navTab.classList.add('active');
            mainTab.style.display = 'grid';
            utils.retrieveDashboardData('personnel', navTab.classList[0]);
        });
    });
    utils.retrieveDashboardData('personnel', 'dashboard');
});
