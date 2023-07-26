import * as utils from "../../utils/client.utils.js"

document.addEventListener('DOMContentLoaded', () => {

    const htmlElement: HTMLElement = document.querySelector('html')
    const bodyElement: HTMLBodyElement = htmlElement.querySelector('body')

    const header: HTMLElement = bodyElement.querySelector('header')
    const nav: HTMLElement = header.querySelector('nav')
    const navActions: HTMLDivElement = nav.querySelector('.actions')
    const navActionsTheme: HTMLButtonElement = navActions.querySelector('.themeSwitch')
    const navActionsLogout: HTMLButtonElement = navActions.querySelector('.logout')

    utils.setPreferredTheme((cbData) => {

        !cbData.savedTheme
        ? (

            !cbData.preferredTheme
            ? utils.setLightTheme()
            : utils.setDarkTheme()

        )
        : (

            cbData.savedTheme === 'light'
            ? utils.setLightTheme()
            : utils.setDarkTheme()

        )
        
    })

    navActionsTheme.addEventListener('click', (event) => {

        event.preventDefault()

        const currentTheme = localStorage.getItem('theme')

        currentTheme === 'light'
        ? utils.setDarkTheme()
        : utils.setLightTheme()

    })

    navActionsLogout.addEventListener('click', (event) => {

        event.preventDefault()

        navActionsLogout.innerHTML =
        `
            <i class="fa-duotone fa-loader fa-spin-pulse"></i>
            <h2>Logging out...</h2>
        `

        setTimeout(async () => {

            try {

                const response: Response = await fetch('/student/logout', {
        
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                
                })

                !response.ok
                ? window.location.href = `/error?${ await response.text() }`
                : window.location.href = '/student'

            } catch(err) {
            
                const { name, message } = err

                window.location.href = `/error?${ (await utils.errorPrompt({title: name, body: message})).toString() }`

            }

        }, 2500)

    })

})