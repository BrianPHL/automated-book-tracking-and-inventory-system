import * as utils from "../../utils/client.utils.js";
document.addEventListener('DOMContentLoaded', () => {
    const htmlElement = document.querySelector('html');
    const bodyElement = htmlElement.querySelector('body');
    const header = bodyElement.querySelector('header');
    const nav = header.querySelector('nav');
    const navActions = nav.querySelector('.actions');
    const navActionsTheme = navActions.querySelector('.themeSwitch');
    const navActionsLogout = navActions.querySelector('.logout');
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
                const response = await fetch('/student/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                // TODO: Integrate error title & error body in Href URL.
                !response.ok
                    ? window.location.href = '/error'
                    : window.location.href = '/student';
            }
            catch (err) {
                // TODO: Integrate error title & error body in Href URL.
                window.location.href = '/error';
            }
        }, 2500);
    });
});
