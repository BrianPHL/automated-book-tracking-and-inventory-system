import { DateTime } from "../../../node_modules/luxon/build/es6/luxon.js";
export const setLightTheme = () => {
    const htmlElement = document.querySelector('html');
    if (htmlElement.getAttribute('data-site') == 'staff') {
        const themeBtn = document.querySelector('#hd-actions-theme');
        themeBtn.classList.add('fa-moon');
        themeBtn.classList.remove('fa-sun');
    }
    htmlElement.setAttribute('data-theme', 'light');
    setPreferredTheme('light');
};
export const setDarkTheme = () => {
    const htmlElement = document.querySelector('html');
    if (htmlElement.getAttribute('data-site') == 'staff') {
        const themeBtn = document.querySelector('#hd-actions-theme');
        themeBtn.classList.add('fa-sun');
        themeBtn.classList.remove('fa-moon');
    }
    htmlElement.setAttribute('data-theme', 'dark');
    setPreferredTheme('dark');
};
export const setPreferredTheme = (theme) => {
    localStorage.setItem('theme', theme);
};
export const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (!savedTheme) {
        !preferredTheme
            ? setLightTheme()
            : setDarkTheme();
    }
    else {
        savedTheme == 'light'
            ? setLightTheme()
            : setDarkTheme();
    }
};
document.addEventListener('DOMContentLoaded', () => { getPreferredTheme(); });
console.log(DateTime.now());
console.log(DateTime.now().toFormat('dd MMMM yyyy'));
