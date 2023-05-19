export const checkFormInputs = async (form) => {
    const formInputs = form.querySelectorAll('input');
    const formSubmit = form.querySelector("button[type='submit']");
    for (const input of formInputs) {
        if (input.value.trim() === '') {
            formSubmit.disabled = true;
            return;
        }
    }
    formSubmit.disabled = false;
};
export const manipulateURL = async (message) => {
    const errorData = { message: message };
    const queryString = new URLSearchParams(errorData).toString();
    const newUrl = `${window.location.href}?${queryString}`;
    history.pushState(errorData, document.title, newUrl);
};
export const sanitizeURL = async () => {
    const href = window.location.href;
    if (href.split("?").length > 1) {
        const previousUrl = href.split("?")[0];
        history.pushState({}, document.title, previousUrl);
    }
};
