import { DateTime } from "../../../node_modules/luxon/build/es6/luxon.js"

export const delay = async (milliseconds: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export const checkForms = (form: HTMLFormElement, isInputAndPreview: boolean): void => {

    const submit: HTMLButtonElement = form.querySelector('button[type="submit"]');
    
    const checkFormInputsAndPreviews = (): Promise<void> => {

        const inputs: NodeListOf<HTMLInputElement> = form.querySelectorAll('input');
        const previews: NodeListOf<HTMLInputElement> = form.querySelectorAll('div[data-type="preview"]');

        for (const input of inputs) {

            if (input.value.trim() === '') {

                submit.disabled = true
                return

            }

            for (const preview of previews) {

                if (preview.getAttribute('data-identifier') === 'null') {

                    submit.disabled = true
                    return

                }

            }

        }

        submit.disabled = false
        return

    }
    const checkFormInputs = (): Promise<void> => {

        const inputs: NodeListOf<HTMLInputElement> = form.querySelectorAll('input');

        for (const input of inputs) {

            if (input.value.trim() === "") {

                submit.disabled = true
                return

            }

        }

        submit.disabled = false

    }

    try {

        isInputAndPreview
        ? checkFormInputsAndPreviews()
        : checkFormInputs()

    } catch (err) {

        console.error(err.name, err.message)
        throw err

    }

}

export const errorPrompt = async (data: object): Promise<URLSearchParams> => {

    const params = new URLSearchParams()

    for (let [key, value] of Object.entries(data)) { params.append(key, value) }
    
    return params

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

export const getPreferredTheme = (): boolean => {

    return window.matchMedia('(prefers-color-scheme: dark)').matches

}

export const setPreferredTheme = (cb: (cbData: { savedTheme?: string, preferredTheme: boolean }) => void): void => {

    const savedTheme: string = localStorage.getItem('theme')
    const preferredTheme: boolean = getPreferredTheme()

    cb({ savedTheme: savedTheme, preferredTheme: preferredTheme })

}

export const setLightTheme = (): void => {

    const htmlElement: HTMLElement = document.querySelector('html')
    const bodyElement: HTMLBodyElement = htmlElement.querySelector('body')


    if (htmlElement.getAttribute('data-site') === 'dashboard') {

        const header: HTMLElement = bodyElement.querySelector('header')
        const nav: HTMLElement = header.querySelector('nav')
        const navActions: HTMLDivElement = nav.querySelector('.actions')
        const navActionsTheme: HTMLButtonElement = navActions.querySelector('.themeSwitch')

        navActionsTheme.innerHTML = 
        `
            <i class="fa-regular fa-moon"></i>
            <h2>Dark mode</h2>
        `

    }

    htmlElement.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', 'light')

}

export const setDarkTheme = () => {

    const htmlElement: HTMLElement = document.querySelector('html')
    const bodyElement: HTMLBodyElement = htmlElement.querySelector('body')

    if (htmlElement.getAttribute('data-site') === 'dashboard') {

        const header: HTMLElement = bodyElement.querySelector('header')
        const nav: HTMLElement = header.querySelector('nav')
        const navActions: HTMLDivElement = nav.querySelector('.actions')
        const navActionsTheme: HTMLButtonElement = navActions.querySelector('.themeSwitch')

        navActionsTheme.innerHTML = 
        `
            <i class="fa-regular fa-sun-bright"></i>
            <h2>Light mode</h2>
        `

    }

    htmlElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')

}

export const getURLData = async (url: string, identifier: string): Promise<string> => {

    return new URLSearchParams(url).get(identifier)

}

export const getDaysBetween = (firstDate: string, secondDate: string,): string => {

    if (!firstDate && !secondDate) { return; }

    const dateFormat = "yyyy-MM-dd HH:mm:ss"
    const fFirstDate = DateTime.fromFormat(firstDate, dateFormat)
    const fSecondDate = DateTime.fromFormat(secondDate, dateFormat)
    const dateNow = DateTime.now()
    const borrowDateDiff = Math.abs(Math.floor(fSecondDate.diff(fFirstDate).as('days')))
    const dueDateDiff = Math.abs(Math.floor(dateNow.diff(fSecondDate).as('days')))

    return fFirstDate > fSecondDate
    ? `${ dueDateDiff } ${ dueDateDiff === 1 ? 'day' : 'days' } past due`
    : `${ borrowDateDiff } ${ borrowDateDiff === 1 ? 'day' : 'days' } remaining`

}

export const setAccountData = async (type: string): Promise<void> => {

    return new Promise(async (resolve) => {

        const accountResponse: Response = await fetch(
            `
                /${ type }/account/fetch
            `, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        const accountData: JSON = await accountResponse.json()
        const header: HTMLElement = document.querySelector('header > .heading')
        const headerInfoName: HTMLElement = header.querySelector('.info > h2 > .name')
        const headerInfoRole: HTMLElement = header.querySelector('.info > h3 > .role')
        
        headerInfoName.textContent = accountData['firstName']
        headerInfoRole.textContent = accountData['role']

        resolve()

    })

}

export const setOverviewData = async (type: string, tab: string): Promise<void> => {
    
    return new Promise(async (resolve) => {

        let response: Response
        let data: JSON

        const overviews: NodeListOf<HTMLDivElement> = document.querySelectorAll('.overview > div > .data')
        const loaders: NodeListOf<HTMLDivElement> = document.querySelectorAll('.overview > div > .loader')

        loaders.forEach((loader: HTMLDivElement) => { loader.style.display = 'flex' })

        response = await fetch(
            `
                /${ type }/table/${ tab }/overview/fetch
            `, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        data = await response.json()

        for (let i = 0; i < overviews.length; i++) {

            overviews[i].innerHTML = data[i]
            loaders[i].style.display = 'none'

        }
        
        resolve()

    })
    
}

export const setTableData = async (type: string, tab: string): Promise<void> => {

    return new Promise(async (resolve) => {

        let response: Response
        let data: Object

        const loader: HTMLDivElement = document.querySelector(`.table[data-tab="${ tab }"] > .content > .loader`)
        const table: HTMLDivElement = document.querySelector(`.table[data-tab="${ tab }"]`)
        const entries: HTMLDivElement = table.querySelector('.data > .entries')

        loader.style.display = 'flex'

        response = await fetch(
            `
                /${ type }/table/${ tab }/entries/fetch
            `, 
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        )
        data = await response.json()
        
        entries.innerHTML = ''
        
        Object.values(data).forEach(entry => { entries.innerHTML += entry })
        
        loader.style.display = 'none'
      
        resolve()

    })
}

export const setDashboardData = async (type: string, tab: string = "dashboard") => {

    try {

        Promise.all
        (
            [
                setAccountData(type), 
                setOverviewData(type, tab), 
                setTableData(type, tab)
            ]
        )

    } catch (err) {
                
        const errorData: URLSearchParams = await errorPrompt({ 
            title: err.title, 
            status: err.status, 
            body: err.body 
        })

        window.location.href = `/error?${ errorData.toString() }`

    }

}

export const openRegisterModal = async (type: string, modal: HTMLDivElement): Promise<void> => {

    const registerModal: HTMLDivElement = modal.querySelector(`.${ type } > .registration`)
    const registerModalPrompts: { [ key: string ]: HTMLDivElement } = {

        success: registerModal.querySelector('div[data-type="success"]'),
        error: registerModal.querySelector('div[data-type="error"]')

    }
    const registerModalForm: HTMLFormElement = registerModal.querySelector('.form > form')
    const registerModalBtns: { [ key: string ]: HTMLButtonElement } = {

        close: registerModal.querySelector('.header > i'),
        reset: registerModalForm.querySelector('.actions > button[type="reset"]'),
        submit: registerModalForm.querySelector('.actions > button[type="submit"]')

    }
    const registerModalInputs: NodeListOf<HTMLInputElement> = registerModalForm.querySelectorAll('input')
    const resetData = async (): Promise<void> => {

        return new Promise(resolve => {

            registerModalInputs.forEach(input => input.value = '')
            checkForms(registerModalForm, false)

            resolve()

        })

    }
    const closeModal = async () => {

        await resetData()

        registerModal.style.display = 'none'
        modal.style.display = 'none'

    }

    try {

        registerModalInputs.forEach(input => {

            input.addEventListener('input', () => checkForms(registerModalForm, false))
            input.value = ''
    
        })
        registerModalBtns['close'].addEventListener('click', () => closeModal())
        registerModalBtns['reset'].addEventListener('click', () => resetData())
        registerModalBtns['submit'].addEventListener('click', async (event) => {
            
            let fetchedData: { [key: string]: string } = {}
    
            const button = event.target as HTMLElement
            const formData: FormData = new FormData(registerModalForm)
    
            event.preventDefault()
    
            for (const [name, value] of formData.entries()) { fetchedData[name] = value.toString() }
            
            button.innerHTML =
            `
                <i class="fa-duotone fa-spinner-third fa-spin"></i>
                Registering...
            `
    
            await fetch(`/personnel/modal/${ type }/register`, {
    
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fetchedData)
    
            })
    
            registerModalPrompts['success'].style.display = 'flex'
    
            setTimeout(async () => {
    
                await resetData()
                await closeModal()
                
                button.innerHTML = 'Register'
                registerModalPrompts['success'].style.display = 'none'
                
            }, 2500)
    
        })
    
        modal.style.display = 'grid'
        registerModal.style.display = 'grid'
    
        checkForms(registerModalForm, false)

    } catch (err) {

        registerModalPrompts['error'].style.display = 'flex'

        setTimeout(() => { registerModalPrompts['error'].style.display = 'none'; throw err; }, 2500)
    
    }

}

export const openEditModal = async (type: string, modal: HTMLDivElement, entry: HTMLElement): Promise<void> => {

    let entryData: { [ key: string ]: string }
    let modalData: { [ key: string ]: HTMLInputElement }

    const path = '.action > .form > form'
    const editModal: HTMLDivElement = modal.querySelector(`.${ type } > .action`)
    const editModalPrompts: { [ key: string ]: HTMLDivElement } = {
    
        success: editModal.querySelector('div[data-type="success"]'),
        error: editModal.querySelector('div[data-type="error"]')
    
    }
    const editModalForm: HTMLFormElement = editModal.querySelector('.form > form')
    const editModalBtns: { [ key: string ]: HTMLButtonElement } = {

        close: editModal.querySelector('.header > i'),
        reset: editModalForm.querySelector('.actions > button[type="reset"]'),
        submit: editModalForm.querySelector('.actions > button[type="submit"]')

    }
    const editModalHeading: HTMLHeadingElement = editModal.querySelector('.header > .heading')
    const editModalInputs: NodeListOf<HTMLInputElement> = editModalForm.querySelectorAll('input')
    const inventory = async () => {

        entryData = {

            title: entry.querySelector(".title > h2").textContent.trim(),
            author: entry.querySelector(".author > h2").textContent.trim(),
            genre: entry.querySelector(".genre > h2").textContent.trim(),
            date: entry.querySelector(".publicationDate > h2").textContent.trim()

        }

        modalData = {

            title: editModal.querySelector(`${ path } > .title > input`),
            author: editModal.querySelector(`${ path } > .author > input`),
            genre: editModal.querySelector(`${ path } > .genre > input`),
            date: editModal.querySelector(`${ path } > .dPublicized > input`)

        }

        editModalHeading.innerHTML =
        `
            <h3>Book Entry Edit Form</h3>
            <h4>
                Currently editing book entry
                <strong>#<span class="entryIdentifier">${entry.getAttribute('data-identifier')}</span></strong>
            </h4>
        `

    }
    const students = async () => {

        entryData = {

            name: entry.querySelector(".name > h2").textContent.trim(),
            number: entry.querySelector(".studentNumber > h2").textContent.trim(),
            phone: entry.querySelector(".phoneNumber > h2").textContent.trim(),
            email: entry.querySelector(".emailAddress > h2").textContent.trim()

        }

        modalData = {

            name: editModal.querySelector(`${ path } > .studentName > input`),
            number: editModal.querySelector(`${ path } > .studentNumber > input`),
            phone: editModal.querySelector(`${ path } > .phoneNumber > input`),
            email: editModal.querySelector(`${ path } > .email > input`)

        }

        editModalHeading.innerHTML =
        `
            <h3>Student Entry Edit Form</h3>
            <h4>
                Currently editing student entry
                <strong>#<span class="entryIdentifier">${entry.getAttribute('data-identifier')}</span></strong>
            </h4>
        `

    }
    const users = async () => {
        
        entryData = {

            fullName: entry.querySelector('.fullName > h2').textContent.trim(),
            userName: entry.querySelector('.username > h2').textContent.trim(),
            role: entry.querySelector('.role > h2').textContent.trim()

        }

        modalData = {

            fullName: editModal.querySelector(`${ path } > .personnelName > input`),
            userName: editModal.querySelector(`${ path } > .username > input`),
            role: editModal.querySelector(`${ path } > .role > input`)

        }

        editModalHeading.innerHTML =
        `
            <h3>Personnel Entry Edit Form</h3>
            <h4>
                Currently editing personnel entry
                <strong>#<span class="entryIdentifier">${entry.getAttribute('data-identifier')}</span></strong>
            </h4>
        `

    }
    const setData = async (): Promise<void> => {

        return new Promise(async (resolve) => {

            for (const key in entryData) {

                await delay(250)

                const initialDate = "dd MMMM yyyy"
                const intendedDate = "yyyy-MM-dd"

                modalData[key]["type"] === "text"
                ? modalData[key].value = entryData[key]
                : modalData[key].value = DateTime.fromFormat(entryData[key], initialDate).toFormat(intendedDate)

            }

            resolve()

        })

    }
    const resetData = async (): Promise<void> => {

        return new Promise(async (resolve) => {

            editModalInputs.forEach((input) => input.value = '')

            checkForms(editModalForm, false)
            await setData()
            checkForms(editModalForm, false)
            resolve()

        })

    }
    const closeModal = async (): Promise<void> => {

        editModalInputs.forEach((input) => input.value = '')

        modal.style.display = 'none'
        editModal.style.display = 'none'

    }

    try {

        switch (type) {

            case "inventory": await inventory(); break;
            case "students": await students(); break;
            case "users": await users(); break;
    
        }
    
        editModalInputs.forEach(input => {
        
            input.addEventListener('input', () => checkForms(editModalForm, false))
            input.value = ''
    
        })
        editModalBtns['close'].addEventListener('click', () => closeModal())
        editModalBtns['reset'].addEventListener('click', () => resetData())
        editModalBtns['submit'].addEventListener('click', async (event) => {
    
            const button = event.target as HTMLElement
            const formData: FormData = new FormData(editModalForm)
            const identifier: string = editModal.querySelector('.form > .header > .heading > h4 > strong > .entryIdentifier').textContent
            let fetchedData: { [key: string]: string } = {}
    
            event.preventDefault()
            
            for (const [name, value] of formData.entries()) { fetchedData[name] = value.toString() }
            
            fetchedData['id'] = identifier
            
            button.innerHTML =
            `
                <i class="fa-duotone fa-spinner-third fa-spin"></i>
                Updating...
            `
    
            await fetch(`/personnel/modal/${ type }/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fetchedData)
            })
    
            editModalPrompts['success'].style.display = 'flex'
    
            setTimeout(async () => {
    
                await resetData()
                await closeModal()
                await setDashboardData('personnel', type)
                button.innerHTML = 'Submit changes'
                editModalPrompts['success'].style.display = 'none'
    
            }, 2500)
    
        })
    
        modal.style.display = "grid"
        editModal.style.display = "grid"
        editModal.setAttribute("data-type", "edit")
        
        checkForms(editModalForm, false)
        await setData()
        checkForms(editModalForm, false)

    } catch (err) {

        editModalPrompts['error'].style.display = 'flex'

        setTimeout(() => { editModalPrompts['error'].style.display = 'none'; throw err; }, 2500)
    
    }

}

export const openDeleteModal = async (type: string, modal: HTMLDivElement, entry: HTMLElement): Promise<void> => {

    let entryTitle: string 

    const deleteModal: HTMLDivElement = modal.querySelector(`.${ type } > .delete`)
    const deleteModalPrompts: { [ key: string ]: HTMLDivElement } = {
    
        success: deleteModal.querySelector('div[data-type="success"]'),
        error: deleteModal.querySelector('div[data-type="error"]')
    
    }
    const deleteModalForm: HTMLFormElement = deleteModal.querySelector('.container > form')
    const deleteModalBtns: { [ key: string ]: HTMLButtonElement } = {

        close: deleteModal.querySelector('.header > i'),
        return: deleteModalForm.querySelector('.actions > button[type="return"]'),
        submit: deleteModalForm.querySelector('.actions > button[type="submit"]')

    }
    const closeModal = async () => {

        modal.style.display = 'none'
        deleteModal.style.display = 'none'

    }

    try {

        switch (type) {

            case 'inventory':
                entryTitle = entry.querySelector('.title > h2').textContent
                break;
                
            case 'students':
                entryTitle = `${ entry.querySelector('.name > h2').textContent } ${ entry.querySelector('.studentNumber > h2').textContent }`
                break;
            
            case 'users':
                entryTitle = `${ entry.querySelector('.fullName > h2').textContent } (${ entry.querySelector('.username > h2').textContent })`
                break;
        
        }
    
        deleteModalBtns['close'].addEventListener('click', () => closeModal())
        deleteModalBtns['return'].addEventListener('click', (event) => {
    
            event.preventDefault()
    
            closeModal()
    
        })
        deleteModalBtns['submit'].addEventListener('click', async (event) => {
    
            const button = event.target as HTMLElement
            const id: string = entry.getAttribute('data-identifier')
    
            event.preventDefault()
                
            button.innerHTML =
            `
                <i class="fa-duotone fa-spinner-third fa-spin"></i>
                Deleting...
            `
            
            await fetch(`/personnel/modal/${ type }/delete/${ id }`, {
    
                method: "DELETE",
                headers: { 'Content-Type': 'application/json' }
    
            })
    
            deleteModalPrompts['success'].style.display = 'flex'
    
            setTimeout(async () => {
            
                await closeModal()
                await setDashboardData('personnel', type)
            
                button.innerHTML = "Yes, I'm sure!"
                deleteModalPrompts['success'].style.display = 'none'
            
            }, 2500)
    
        })
    
        modal.style.display = "grid"
        deleteModal.querySelector('.container > form > .info > .entryTitle').textContent = entryTitle
        deleteModal.style.display = "grid"

    } catch (err) {

        deleteModalPrompts['error'].style.display = 'flex'

        setTimeout(() => { deleteModalPrompts['error'].style.display = 'none'; throw err; }, 2500)
    
    }

}