import { loginForm } from "../typings.js";

document.addEventListener('DOMContentLoaded', () => {

    const form: loginForm = {
        button: document.querySelector(".login-modal-form-cta > button"),
        username: {
            label: document.querySelector(".login-modal-form-username > label"),
            input: document.querySelector(".login-modal-form-username > input")
        },
        password: {
            label: document.querySelector(".login-modal-form-password > label"),
            input: document.querySelector(".login-modal-form-password > input")
        },
        error: {
            container: document.querySelector(".login-modal-error"),
            text: document.querySelector(".login-modal-error > p")
        },
        container: document.querySelector(".login-modal-form")
    } 

    const areInputsFilled = () => {

        if (form.username.input.value != '' && form.password.input.value != '') {
            form.button.disabled = false;
        } else {
            form.button.disabled = true;
        }

    }

    const manipulateURL = async (message: string) => {

        const errorData = { message: message }
        const queryString = new URLSearchParams(errorData).toString()
        const newUrl = `${window.location.href}?${queryString}`
        history.pushState(errorData, document.title, newUrl)

    }

    const sanitizeURL = () => {

        const href = window.location.href

        if (href.split("?").length > 1) {
            const previousUrl = href.split("?")[0]
            history.pushState({}, document.title, previousUrl);
        }

    }

    sanitizeURL()

    areInputsFilled()

    const loginFormInputs = [
        form.username.input, 
        form.password.input
    ]

    loginFormInputs.forEach((event) => {
        
        event.addEventListener('focusin', () => {

            const currentCategory = event.type

            currentCategory == 'password'
            ? form.password.label.style.color = "#347542"
            : form.username.label.style.color = "#347542"

        })

        event.addEventListener('focusout', () => {
        
            const currentCategory = event.type

            currentCategory == 'password'
            ? form.password.label.style.color = "#0B3612"
            : form.username.label.style.color = "#0B3612"

        })

    })

    loginFormInputs.forEach((event) => {
        event.addEventListener('input', areInputsFilled)
    })

    form.container.addEventListener('submit', (event) => {

        event.preventDefault()

        sanitizeURL()

        const formData = new FormData(form.container)
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password')
        }

        form.button.textContent = 'Processing...'
        form.button.disabled = true;

        setTimeout( async () => {

            form.button.textContent = 'Sign in'
            form.button.disabled = false;

            try {

                const response = await fetch("/", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });
    
                if (response.ok) {
    
                    window.location.href = "/staff"
    
                } else {
                    
                    await manipulateURL('Invalid username or password!')
                    const urlParams = new URLSearchParams(window.location.search);
    
                    form.error.container.style.display = 'block'
                    form.error.text.textContent = urlParams.get('message')
    
                }
    
            } catch (err) { throw err }

        }, 1000)

    })

})