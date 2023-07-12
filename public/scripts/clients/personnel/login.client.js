import { checkFormInputs, manipulateURL, sanitizeURL } from "../../utils/client.utils.js";
document.addEventListener('DOMContentLoaded', () => {
    const html = document.querySelector('html');
    const modal = html.querySelector('.modal');
    const modalWarning = modal.querySelector('.warning');
    const modalWarningText = modalWarning.querySelector('.text');
    const modalForm = modal.querySelector('form');
    const modalFormInputs = modalForm.querySelectorAll('input');
    const modalFormSubmit = modalForm.querySelector('button[type="submit"]');
    modalFormInputs.forEach(input => input.addEventListener('input', () => {
        checkFormInputs(modalForm);
    }));
    checkFormInputs(modalForm);
    modalFormSubmit.addEventListener('click', async (event) => {
        event.preventDefault();
        await sanitizeURL();
        const formData = new FormData(modalForm);
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password')
        };
        modalFormSubmit.innerHTML = 'Processing... <i class="fa-duotone fa-loader fa-spin-pulse"></i>';
        modalFormSubmit.disabled = true;
        modalWarning.style.display = 'none';
        setTimeout(async () => {
            modalFormSubmit.innerHTML = 'Sign in <i class="fa-regular fa-right-to-bracket"></i>';
            modalFormSubmit.disabled = false;
            try {
                const response = await fetch('/auth', {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData)
                });
                if (!response.ok) {
                    if (response.status === 403) {
                        await manipulateURL({
                            title: 'Incorrect username or password',
                            body: 'Make sure that everything is typed correctly.'
                        });
                    }
                    else {
                        await manipulateURL({
                            title: 'Internal Server Error',
                            body: 'Contact the server administrator.'
                        });
                    }
                    const urlParams = new URLSearchParams(window.location.search);
                    modalWarning.style.display = 'flex';
                    modalWarning.querySelector('h3').textContent = urlParams.get('title');
                    modalWarning.querySelector('h4').textContent = urlParams.get('body');
                }
                else {
                    window.location.href = '/personnel/dashboard';
                }
            }
            catch (err) {
                modalWarning.style.display = 'flex';
                modalWarningText.querySelector('h3').textContent = 'An unhandled exception occured.';
                modalWarningText.querySelector('h4').textContent = err;
            }
        }, 2500);
    });
});
