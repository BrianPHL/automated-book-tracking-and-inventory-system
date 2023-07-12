import { setDarkTheme, setLightTheme, setPreferredTheme } from "../../utils/client.utils.js";
document.addEventListener('DOMContentLoaded', () => {
    const htmlElement = document.querySelector('html');
    const bodyElement = htmlElement.querySelector('body');
    const themeBtn = bodyElement.querySelector('#nav-actions-theme');
    const logoutBtn = bodyElement.querySelector('#nav-actions-logout');
    setPreferredTheme((cbData) => {
        !cbData.savedTheme
            ? (!cbData.preferredTheme
                ? setLightTheme()
                : setDarkTheme())
            : (cbData.savedTheme === 'light'
                ? setLightTheme()
                : setDarkTheme());
    });
    themeBtn.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme');
        currentTheme === 'light'
            ? setDarkTheme()
            : setLightTheme();
    });
    logoutBtn.addEventListener('click', async () => {
        const response = await fetch('/personnel/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        // TODO: Integrate error title & error body in Href URL.
        !response.ok
            ? window.location.href = '/error'
            : window.location.href = '/';
    });
});
