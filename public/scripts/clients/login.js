import { checkFormInputs, manipulateURL, sanitizeURL } from "../utils/dom.js";
document.addEventListener('DOMContentLoaded', async () => {
    const login = document.querySelector('.login');
    await sanitizeURL();
    const checkLoginFormInputs = async () => {
        const loginForm = login.querySelector('form');
        const loginFormInputs = loginForm.querySelectorAll('input');
        await checkFormInputs(loginForm);
        loginFormInputs.forEach(input => input.addEventListener('input', async () => {
            await checkFormInputs(loginForm);
        }));
    };
    await checkLoginFormInputs();
    const checkLoginFormSubmit = async () => {
        const loginForm = login.querySelector('form');
        const loginFormSubmit = loginForm.querySelector("button[type='submit']");
        const loginError = login.querySelector('.error');
        const loginErrorInfo = loginError.querySelector('p');
        loginFormSubmit.addEventListener('click', (event) => {
            event.preventDefault();
            sanitizeURL();
            const formData = new FormData(loginForm);
            const loginData = {
                username: formData.get('username'),
                password: formData.get('password')
            };
            loginError.style.display = 'none';
            loginErrorInfo.textContent = '';
            loginFormSubmit.textContent = 'Processing...';
            loginFormSubmit.disabled = true;
            setTimeout(async () => {
                loginFormSubmit.textContent = 'Sign in';
                loginFormSubmit.disabled = false;
                try {
                    const response = await fetch("/authenticate", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(loginData)
                    });
                    if (response.ok) {
                        window.location.href = "/staff";
                    }
                    else {
                        await manipulateURL('Invalid username or password!');
                        const urlParams = new URLSearchParams(window.location.search);
                        loginError.style.display = 'block';
                        loginErrorInfo.textContent = urlParams.get('message');
                    }
                }
                catch (err) {
                    loginError.style.display = 'block';
                    loginErrorInfo.textContent = err;
                }
            }, 1000);
        });
    };
    await checkLoginFormSubmit();
});
