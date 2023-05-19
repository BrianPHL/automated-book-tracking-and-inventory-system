export const areFormInputsFilled = async (inputs: NodeListOf<HTMLInputElement>, button: HTMLButtonElement) => {

    for (const input of inputs) {

        if (input.value.trim() === '') {

            button.disabled = true;
            return;

        }

    }

    button.disabled = false;

}

export const manipulateURL = async (message: string) => {

    const errorData = { message: message }
    const queryString = new URLSearchParams(errorData).toString()
    const newUrl = `${window.location.href}?${queryString}`
    
    history.pushState(errorData, document.title, newUrl)

}

export const sanitizeURL = async () => {

    const href = window.location.href

    if (href.split("?").length > 1) {

        const previousUrl = href.split("?")[0]
        history.pushState({}, document.title, previousUrl);

    }

}