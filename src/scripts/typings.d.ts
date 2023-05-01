interface loginForm {
    button: HTMLButtonElement
    username: {
        label: HTMLLabelElement
        input: HTMLInputElement
    }
    password: {
        label: HTMLLabelElement
        input: HTMLInputElement
    }
    error: {
        container: HTMLDivElement,
        text: HTMLParagraphElement
    },
    container: HTMLFormElement
}