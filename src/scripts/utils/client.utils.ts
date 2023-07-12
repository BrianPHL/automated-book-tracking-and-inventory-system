export const checkFormInputs = async (form: HTMLFormElement) => {

    const formInputs: NodeListOf<HTMLInputElement> = form.querySelectorAll('input');
    const formSubmit: HTMLButtonElement = form.querySelector('button[type="submit"]');

    for (const formInput of formInputs) {

        if (formInput.value.trim() === '') {
        
            formSubmit.disabled = true;
            return;

        }

    }

    formSubmit.disabled = false;

}

export const manipulateURL = async (data: object) => {

    const params = new URLSearchParams()
    
    for (let [key, value] of Object.entries(data)) { params.append(key, value) }
    
    const queryString = params.toString()
    window.history.pushState(data, document.title, `?${queryString}`)


}

export const sanitizeURL = async () => {

    const href = window.location.href

    if (href.split("?").length > 1) {

        const previousUrl = href.split("?")[0]
        history.pushState({}, document.title, previousUrl);

    }

}

export const getPreferredTheme = (): boolean => {

    return window.matchMedia('(prefers-color-scheme: dark)').matches

}

interface cbDataType {

    savedTheme?: string
    preferredTheme: boolean

}

export const setPreferredTheme = (cb: (cbData: cbDataType) => void): void => {

    const savedTheme: string = localStorage.getItem('theme')
    const preferredTheme: boolean = getPreferredTheme()

    cb({ savedTheme: savedTheme, preferredTheme: preferredTheme })

}

export const setLightTheme = (): void => {

    const htmlElement: HTMLElement = document.querySelector('html')
    const bodyElement: HTMLBodyElement = htmlElement.querySelector('body')


    if (htmlElement.getAttribute('data-site') === 'dashboard') {

        const themeBtn: HTMLButtonElement = bodyElement.querySelector('#nav-actions-theme')

        themeBtn.innerHTML = 
        `
            <i class="fa-regular fa-moon"></i>
            <h2>Dark mode</h2>
        `

    }

    htmlElement.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', 'light')

}

export const setDarkTheme = () => {

    const htmlElement: HTMLElement = document.querySelector('html')
    const bodyElement: HTMLBodyElement = htmlElement.querySelector('body')


    if (htmlElement.getAttribute('data-site') === 'dashboard') {

        const themeBtn: HTMLButtonElement = bodyElement.querySelector('#nav-actions-theme')

        themeBtn.innerHTML = 
        `
            <i class="fa-solid fa-sun-bright"></i>
            <h2>Light mode</h2>
        `

    }

    htmlElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')

}