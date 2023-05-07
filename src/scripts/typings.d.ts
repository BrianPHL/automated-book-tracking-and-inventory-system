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

    }

    container: HTMLFormElement

}

interface dashboard {
    
    overview: {

        availability: HTMLElement
        borrowed: HTMLElement
        due: HTMLElement
        registered: HTMLElement

    }

    notifications: {

        container: HTMLDivElement

        data: {

            message: HTMLElement
            date: HTMLTimeElement

        }

    }

    availability: {

        container: HTMLDivElement

        data: {

            title: HTMLHeadingElement
            author: HTMLElement
            category: HTMLElement
            date: HTMLTimeElement

        }

        actions: {
            lend: HTMLButtonElement
            edit: HTMLButtonElement
        }
        
    }

    borrowed: {

        container: HTMLDivElement

        header: {

            title: HTMLHeadingElement
            viewDetails: HTMLButtonElement

        }

        data: {

            borrower: HTMLElement
            due: number

        }

    }

}