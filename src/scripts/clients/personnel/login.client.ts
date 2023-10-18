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
        
        utils.checkForms(modalForm, false)
    
    }))
    
    utils.checkForms(modalForm, false)

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
            <i class="fa-duotone fa-spinner-third fa-spin"></i>
            Logging in... 
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

                if (response.status === 403) {

                    const data: JSON = await response.json()

                    await utils.manipulateURL({
                        
                        title: data['title'],
                        body: data['body'] 
                    
                    })

                    const warningTitle = await utils.getURLData(window.location.search, 'title')
                    const warningBody = await utils.getURLData(window.location.search, 'body')

                    modalWarning.querySelector('h3').textContent = warningTitle
                    modalWarning.querySelector('h4').textContent = warningBody
                    modalWarning.style.display = 'flex'
                
                } else { window.location.href = '/personnel/dashboard' }

            } catch (err) {
                
                modalWarningText.querySelector('h3').textContent = err.title
                modalWarningText.querySelector('h4').textContent = err.message
                modalWarning.style.display = 'flex'

            }

        }, 2500)

    })

})