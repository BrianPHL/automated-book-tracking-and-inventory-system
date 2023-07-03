export const checkFormInputs = async (form: HTMLFormElement) => {

    const formInputs: NodeListOf<HTMLInputElement> = form.querySelectorAll('input');
    const formSubmit: HTMLButtonElement = form.querySelector('button[type="submit"]');

    for (const formInput of formInputs) {

        if (formInput.value.trim() === '') {
        
            formSubmit.disabled = true;
            return;

        }

    }

    formSubmit.disabled = false;

}

export const manipulateURL = async (data: object) => {

    const params = new URLSearchParams()
    
    for (let [key, value] of Object.entries(data)) { params.append(key, value) }
    
    const queryString = params.toString()
    window.history.pushState(data, document.title, `?${queryString}`)


}

export const sanitizeURL = async () => {

    const href = window.location.href

    if (href.split("?").length > 1) {

        const previousUrl = href.split("?")[0]
        history.pushState({}, document.title, previousUrl);

    }

}