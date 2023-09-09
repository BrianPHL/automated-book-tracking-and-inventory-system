import * as utils from "../../utils/client.utils.js";
document.addEventListener('DOMContentLoaded', () => {
    const html = document.querySelector('html');
    const modal = html.querySelector('.modal');
    const modalWarning = modal.querySelector('.warning');
    const modalWarningText = modalWarning.querySelector('.text');
    const modalForm = modal.querySelector('form');
    const modalFormInputs = modalForm.querySelectorAll('input');
    const modalFormSubmit = modalForm.querySelector('button[type="submit"]');
    utils.setPreferredTheme((cbData) => {
        !cbData.savedTheme
            ? (!cbData.preferredTheme
                ? utils.setLightTheme()
                : utils.setDarkTheme())
            : (cbData.savedTheme === 'light'
                ? utils.setLightTheme()
                : utils.setDarkTheme());
    });
    modalFormInputs.forEach(input => input.addEventListener('input', () => {
        utils.checkForms(modalForm, false);
    }));
    utils.checkForms(modalForm, false);
    modalFormSubmit.addEventListener('click', async (event) => {
        event.preventDefault();
        await utils.sanitizeURL();
        const formData = new FormData(modalForm);
        const loginData = {
            studentOrPhoneNum: formData.get('studentOrPhoneNum'),
            password: formData.get('password')
        };
        modalFormSubmit.innerHTML =
            `
            Processing... 
            <i class="fa-duotone fa-loader fa-spin-pulse"></i>
        `;
        modalFormSubmit.disabled = true;
        modalWarning.style.display = 'none';
        setTimeout(async () => {
            modalFormSubmit.innerHTML =
                `
                Sign in 
                <i class="fa-regular fa-right-to-bracket"></i>
            `;
            modalFormSubmit.disabled = false;
            try {
                const response = await fetch('/student/auth', {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData)
                });
                if (!response.ok) {
                    if (response.status === 403) {
                        await utils.manipulateURL({
                            title: 'Incorrect username or password',
                            body: 'Make sure that everything is typed correctly.'
                        });
                    }
                    else {
                        await utils.manipulateURL({
                            title: 'Internal Server Error',
                            body: 'Contact the server administrator.'
                        });
                    }
                    const warningTitle = await utils.getURLData(window.location.search, 'title');
                    const warningBody = await utils.getURLData(window.location.search, 'body');
                    modalWarning.style.display = 'flex';
                    modalWarning.querySelector('h3').textContent = warningTitle;
                    modalWarning.querySelector('h4').textContent = warningBody;
                }
                else {
                    window.location.href = '/student/dashboard';
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
