export const setLightTheme = () => {

    const htmlElement = document.querySelector('html') as HTMLElement;
    const themeBtn = document.querySelector('#hd-actions-theme');

    if (htmlElement.getAttribute('data-site') == 'staff') {

        themeBtn.classList.add('fa-moon')
        themeBtn.classList.remove('fa-sun')

    }

    htmlElement.setAttribute('data-theme', 'light')  
    setPreferredTheme('light')
}
export const setDarkTheme = () => {

    const htmlElement = document.querySelector('html') as HTMLElement;
    const themeBtn = document.querySelector('#hd-actions-theme');

    if (htmlElement.getAttribute('data-site') == 'staff') {

        themeBtn.classList.add('fa-sun')
        themeBtn.classList.remove('fa-moon') 

    }

    htmlElement.setAttribute('data-theme', 'dark')   
    setPreferredTheme('dark')
    
}

export const setPreferredTheme = (theme: string) => {

    localStorage.setItem('theme', theme)
}
export const getPreferredTheme = () => {

    const savedTheme = localStorage.getItem('theme');
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (!savedTheme) {

        !preferredTheme
        ? setLightTheme()
        : setDarkTheme()

    } else {

        savedTheme == 'light'
        ? setLightTheme()
        : setDarkTheme()

    }

}

document.addEventListener('DOMContentLoaded', () => { getPreferredTheme() })