import { setDarkTheme, setLightTheme, setPreferredTheme } from "../../utils/client.utils.js"

document.addEventListener('DOMContentLoaded', () => {

    const htmlElement: HTMLElement = document.querySelector('html')
    const bodyElement: HTMLBodyElement = htmlElement.querySelector('body')
    const themeBtn: HTMLButtonElement = bodyElement.querySelector('#nav-actions-theme')
    const logoutBtn: HTMLButtonElement = bodyElement.querySelector('#nav-actions-logout')

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

    themeBtn.addEventListener('click', (event) => {

        event.preventDefault()

        const currentTheme = localStorage.getItem('theme')

        currentTheme === 'light'
        ? setDarkTheme()
        : setLightTheme()

    })

    logoutBtn.addEventListener('click', async (event) => {

        event.preventDefault()

        const response: Response = await fetch('/personnel/logout', {
        
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        
        })

        // TODO: Integrate error title & error body in Href URL.
        !response.ok
        ? window.location.href = '/error'
        : window.location.href = '/'

    })

})