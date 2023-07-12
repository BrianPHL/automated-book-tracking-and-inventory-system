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
        const themeBtn = bodyElement.querySelector('#nav-actions-theme');
        themeBtn.innerHTML =
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
        const themeBtn = bodyElement.querySelector('#nav-actions-theme');
        themeBtn.innerHTML =
            `
            <i class="fa-solid fa-sun-bright"></i>
            <h2>Light mode</h2>
        `;
    }
    htmlElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
};
