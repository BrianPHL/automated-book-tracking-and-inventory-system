import { setDarkTheme, setLightTheme, setPreferredTheme } from "../../utils/client.utils.js"

document.addEventListener('DOMContentLoaded', () => {

    const htmlElement: HTMLElement = document.querySelector('html')
    const bodyElement: HTMLBodyElement = htmlElement.querySelector('body')
    const themeBtn: HTMLButtonElement = bodyElement.querySelector('#nav-actions-theme')

    setPreferredTheme((cbData) => {

        !cbData.savedTheme
        ? (

            !cbData.preferredTheme
            ? setLightTheme()
            : setDarkTheme()

        )
        : (

            cbData.savedTheme === 'light'
            ? setLightTheme()
            : setDarkTheme()

        )
        
    })

    themeBtn.addEventListener('click', () => {

        const currentTheme = localStorage.getItem('theme')

        currentTheme === 'light'
        ? setDarkTheme()
        : setLightTheme()

    })

})