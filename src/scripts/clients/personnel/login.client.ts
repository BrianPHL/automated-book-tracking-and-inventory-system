import * as utils from "../../utils/client.utils.js"

document.addEventListener('DOMContentLoaded', () => {

    const html: HTMLElement = document.querySelector('html');
    const modal: HTMLDivElement = html.querySelector('.modal');
    const modalWarning: HTMLDivElement = modal.querySelector('.warning')
    const modalWarningText: HTMLDivElement = modalWarning.querySelector('.text')
    const modalForm: HTMLFormElement = modal.querySelector('form');
    const modalFormInputs: NodeListOf<HTMLInputElement> = modalForm.querySelectorAll('input');
    const modalFormSubmit: HTMLButtonElement = modalForm.querySelector('button[type="submit"]');

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

    modalFormInputs.forEach(input => input.addEventListener('input', () => { 
        
        utils.checkFormInputs(modalForm)
    
    }))
    
    utils.checkFormInputs(modalForm)

    modalFormSubmit.addEventListener('click', async (event: Event) => {

        event.preventDefault()
        
        await utils.sanitizeURL()
        
        const formData = new FormData(modalForm)
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password')
        }
    
        modalFormSubmit.innerHTML = 
        `
            Processing... 
            <i class="fa-duotone fa-loader fa-spin-pulse"></i>
        `
        modalFormSubmit.disabled = true
        modalWarning.style.display = 'none'

        setTimeout(async () => {
    
            modalFormSubmit.innerHTML = 
            `
                Sign in 
                <i class="fa-regular fa-right-to-bracket"></i>
            `
            modalFormSubmit.disabled = false
    
            try {
                
                const response = await fetch('/auth', {

                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData)

                })

                if (!response.ok) {

                    if (response.status === 403) {

                        await utils.manipulateURL({
                        
                            title: 'Incorrect username or password',
                            body: 'Make sure that everything is typed correctly.' 
                        
                        })

                    } else {

                        await utils.manipulateURL({
                        
                            title: 'Internal Server Error',
                            body: 'Contact the server administrator.' 
                        
                        })

                    }

                    const warningTitle = await utils.getURLData(window.location.search, 'title')
                    const warningBody = await utils.getURLData(window.location.search, 'body')

                    modalWarning.style.display = 'flex'
                    modalWarning.querySelector('h3').textContent = warningTitle
                    modalWarning.querySelector('h4').textContent = warningBody
                
                } else { window.location.href = '/personnel/dashboard' }

            } catch (err) {
                
                modalWarning.style.display = 'flex'
                modalWarningText.querySelector('h3').textContent = 'An unhandled exception occured.'
                modalWarningText.querySelector('h4').textContent = err

            }

        }, 2500)

    })

})