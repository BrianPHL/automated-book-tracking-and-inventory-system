import { QueryError, RowDataPacket, OkPacket, ResultSetHeader } from "mysql2";

export interface loginForm {

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

export interface dashboard {
    
    actions: {

        theme: HTMLButtonElement
        refresh: HTMLButtonElement
        logout: HTMLButtonElement

    }

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
            due: HTMLElement

        }

        actions: {

            markAsReturned: HTMLButtonElement

        }

    }

}

declare type callbackType = QueryError | RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader