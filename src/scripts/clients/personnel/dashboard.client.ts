import * as utils from "../../utils/client.utils.js"

document.addEventListener('DOMContentLoaded', async () => {

    const bodyElement: HTMLBodyElement = document.querySelector('body')
    let activeTable: HTMLDivElement = bodyElement.querySelector('.table[data-active="true"]')

    utils.setPreferredTheme((cbData) => {

        !cbData.savedTheme
        ? (

            !cbData.preferredTheme
            ? utils.setLightTheme()
            : utils.setDarkTheme()

        )
        : (

            cbData.savedTheme === 'light'
            ? utils.setLightTheme()
            : utils.setDarkTheme()

        )
        
    })

    const navigationTabs = () => {

        const tables: NodeListOf<HTMLDivElement> = bodyElement.querySelectorAll('.table')
        const navigation: HTMLElement = bodyElement.querySelector('header > nav')
        const navigationTabs: NodeListOf<HTMLDivElement> = navigation.querySelectorAll('.tabs > div')

        navigationTabs.forEach(navigationTab => {

            navigationTab.addEventListener('click', async (event: MouseEvent) => {

                const targetTable = event.target as HTMLElement
                
                activeTable = bodyElement.querySelector(`.table[data-tab="${ targetTable.classList[0] }"]`)
                navigationTabs.forEach(navigationTab => { navigationTab.classList.remove('active') })
                navigationTab.classList.add('active')

                tables.forEach(table => {

                    table.setAttribute('data-active', 'false')
                    table.style.display = 'none'

                })
                activeTable.style.display = 'grid'
                activeTable.setAttribute('data-active', 'true')

                await utils.setDashboardData('personnel', activeTable.getAttribute('data-tab'))

            })

        })

    }
    navigationTabs()

    const navigationActions = async () => {

        const nav: HTMLElement = bodyElement.querySelector('header > nav')
        const navActions: HTMLDivElement = nav.querySelector('.actions')
        const navRefresh: HTMLButtonElement = navActions.querySelector('.refresh')
        const navTheme: HTMLButtonElement = navActions.querySelector('.themeSwitch')
        const navLogout: HTMLButtonElement = navActions.querySelector('.logout')

        try {

            navRefresh.addEventListener('click', async (event) => {
            
                event.preventDefault()
    
                navRefresh.innerHTML =
                `
                    <i class="fa-regular fa-redo fa-spin"></i>
                    <h2>Refreshing...</h2>
                `

                await utils.setDashboardData('personnel', activeTable.getAttribute('data-tab'))

                navRefresh.innerHTML =
                `
                    <i class="fa-regular fa-redo"></i>
                    <h2>Refresh</h2>
                `
    
            })
    
            navTheme.addEventListener('click', (event) => {
    
                const currentTheme = localStorage.getItem('theme')
                
                event.preventDefault()
        
                currentTheme === 'light'
                ? utils.setDarkTheme()
                : utils.setLightTheme()
    
            })
    
            navLogout.addEventListener('click', async (event) => {
    
                event.preventDefault()
        
                navLogout.innerHTML =
                `
                    <i class="fa-duotone fa-spinner-third fa-spin"></i>
                    <h2>Logging out...</h2>
                `
                
                await fetch('/personnel/account/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })

                navLogout.innerHTML =
                `
                    <i class="fa-regular fa-right-from-bracket"></i>
                    <h2>Logout</h2>
                `

                window.location.href = '/'
                
            })

        } catch (err) {
                
            const errorData: URLSearchParams = await utils.errorPrompt({ 
                title: err.title, 
                status: err.status, 
                body: err.body 
            })

            window.location.href = `/error?${ errorData.toString() }`

        }

    }
    navigationActions()

    const tableActions = () => {

        let isModalOpen: boolean = false

        const tableControls: NodeListOf<HTMLDivElement> = bodyElement.querySelectorAll('.table > .content > .controls')
        const modal: HTMLDivElement = bodyElement.querySelector('.modal')

        bodyElement.addEventListener('click', (event: Event) => {

            const target = event.target as HTMLElement

            switch (target.getAttribute('data-action')) {

                case "register":
                    utils.openRegisterModal(target.getAttribute('data-type'), modal)
                    break;
                
                case "return":
                    (async () => {

                        const tableTab: string = activeTable.getAttribute('data-tab')
                        const tableLoader: HTMLDivElement = activeTable.querySelector('.content > .loader')
                        const tableControl: HTMLDivElement = activeTable.querySelector('.content > .controls')
                        const tableContentEntries: HTMLDivElement = activeTable.querySelector('.content > .data > .entries')
                        const tableSearchForm: HTMLFormElement = tableControl.querySelector('.search')
                        const tableSearchInput: HTMLInputElement = tableSearchForm.querySelector('.input > input')
                        const tableSearchReturn: HTMLButtonElement = tableSearchForm.querySelector('.return')

                        try {

                            let response: Response

                            tableLoader.style.display = 'flex'
                            tableSearchReturn.innerHTML = 
                            `
                                <i class="fa-duotone fa-spinner-third fa-spin"></i>
                            `
                            response = await fetch(
                                `
                                    /personnel/table/${ tableTab }/entries/fetch
                                `, 
                                {
                                    method: 'GET',
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            )    
                            tableContentEntries.innerHTML = ''
                            
                            Object.values(await response.json()).forEach(async (data: string) => {
                                tableContentEntries.innerHTML += data
                            })
    
                            tableLoader.style.display = 'none'
                            tableSearchReturn.innerHTML =
                            `
                                <i class="fa-solid fa-arrow-left"></i>
                            `
                            tableSearchReturn.style.display = 'none'
                            tableSearchInput.value = ''
                            utils.checkForms(tableSearchForm, false)

                        } catch(err) {

                            const errorData: URLSearchParams = await utils.errorPrompt({ 
                                title: err.title, 
                                status: err.status, 
                                body: err.body 
                            })
        
                            window.location.href = `/error?${ errorData.toString() }`

                        }

                    })()
                    break;

            }

        })

        const tableSearch = (): void => {

            tableControls.forEach(async (tableControl: HTMLDivElement) => {

                try {

                    const tableSearchForm: HTMLFormElement = tableControl.querySelector('.search')
                    const tableSearchInput: HTMLInputElement = tableSearchForm.querySelector('.input > input')
                    const tableSearchSubmit: HTMLButtonElement = tableSearchForm.querySelector('button[data-type="search"]')

                    tableSearchInput.addEventListener('input', (): void => utils.checkForms(tableSearchForm, false))
                    tableSearchSubmit.addEventListener('click', async (event: Event) => {
    
                        event.preventDefault()
    
                        let response: Response

                        const tableTab: string = activeTable.getAttribute('data-tab')
                        const tableQuery: string = tableSearchInput.value
                        const tableLoader: HTMLDivElement = activeTable.querySelector('.content > .loader')
                        const tableSearchReturn: HTMLButtonElement = tableSearchForm.querySelector('.return')
                        const tableContentEntries: HTMLDivElement = activeTable.querySelector('.content > .data > .entries')
    
                        tableLoader.style.display = 'flex'
                        tableSearchSubmit.disabled = true
                        tableSearchSubmit.innerHTML = '<i class="fa-duotone fa-spinner-third fa-spin"></i>'
                        response = await fetch(
                            `
                                /personnel/table/${ tableTab }/entries/fetch/${ tableQuery }
                            `, 
                            {
                                method: 'GET',
                                headers: { 'Content-Type': 'application/json' }
                            }
                        )
    
                        tableContentEntries.innerHTML = ''
                        tableSearchSubmit.disabled = false
                        tableSearchSubmit.innerHTML = '<i class="fa-regular fa-magnifying-glass"></i>'

                        Object.values(await response.json()).forEach(async (data: string) => {
                            tableContentEntries.innerHTML += data
                        
                        })

                        tableLoader.style.display = 'none'
                        tableSearchReturn.style.display = 'flex'
                        
                    })
    
                    tableSearchInput.value = ''
                    utils.checkForms(tableSearchForm, false)

                } catch (err) {

                    const errorData: URLSearchParams = await utils.errorPrompt({ 
                        title: err.title, 
                        status: err.status, 
                        body: err.body 
                    })

                    window.location.href = `/error?${ errorData.toString() }`
                    
                }

            }) 

        }
        tableSearch()
        
        const entryActions = () => {

            bodyElement.addEventListener('click', async (event) => {

                const target = event.target as HTMLElement
                const targetAction: string = target.classList[0]

                const invLend = async (type: string) => {

                    const entry = target.parentElement.parentElement
                    const entryId = entry.getAttribute('data-identifier')
                    const lendModal: HTMLDivElement = modal.querySelector(`.${ type } > .lend`)
                    const lendModalPrompts: { success: HTMLDivElement, error: HTMLDivElement } = {
                        success: lendModal.querySelector('div[data-type="success"]'),
                        error: lendModal.querySelector('div[data-type="error"]')
                    }
                    const lendModalForm: HTMLFormElement = lendModal.querySelector('form')
                    const lendModalBtns: { close: HTMLButtonElement, reset: HTMLButtonElement, submit: HTMLButtonElement } = {
                        close: lendModal.querySelector('.header > i'),
                        reset: lendModalForm.querySelector('.actions > button[type="reset"]'),
                        submit: lendModalForm.querySelector('.actions > button[type="submit"]')
                    }
                    const lendModalAssign: NodeListOf<HTMLButtonElement> = lendModalForm.querySelectorAll('div[data-type="preview"] > i')
                    const lendModalInputs: NodeListOf<HTMLInputElement> = lendModalForm.querySelectorAll('div > input')
                    const lendModalPreviews: NodeListOf<HTMLDivElement> = lendModalForm.querySelectorAll('div[data-type="preview"]')
                    const resetData = async () => {
                        
                        for (const preview of lendModalPreviews) {

                            preview.setAttribute('data-identifier', 'null')
                            preview.querySelector('h3').textContent = 'None assigned'

                            utils.checkForms(lendModalForm, true)

                        }

                    }
                    const closeModal = async (): Promise<void> => {
                        
                        if (!isModalOpen) { return }
                
                        return new Promise(async (resolve) => {

                            modal.style.display = 'none'
                            lendModal.style.display = 'none'
                            isModalOpen = false
        
                            await resetData()
                            
                            resolve()
                            
                        })

                    }

                    lendModalAssign.forEach((button: HTMLButtonElement) => button.addEventListener('click', async (element) => {

                        let assignModalEntries: NodeListOf<HTMLDivElement>
                        let entriesCounter: number = 0

                        const target = element.target as HTMLElement
                        const modalType: string = target.parentElement.className
                        const assignModal: HTMLDivElement = modal.querySelector(`.${ type } > .assign`)
                        const assignModalHeading: HTMLDivElement = assignModal.querySelector('.header > h3')
                        const assignModalClose: HTMLButtonElement = assignModal.querySelector('.header > i')
                        const assignModalPreloader: HTMLDivElement = assignModal.querySelector('.form > .preloader')
                        const assignModalContainer: HTMLDivElement = assignModal.querySelector('.form > .container')
                        const assignModalCounter: HTMLSpanElement = assignModal.querySelector('.footer > h3 > .counter')
                        const assignModalReset: HTMLButtonElement = assignModal.querySelector('.footer > .actions > button[type="reset"]')
                        const assignModalSubmit: HTMLButtonElement = assignModal.querySelector('.footer > .actions > button[type="submit"]')
                        const studentModal = async (): Promise<void> => {

                            let response: Response
 
                            assignModalHeading.textContent = 'Choose a student'
                            assignModalPreloader.style.display = 'flex'
                            assignModalContainer.style.display = 'none'

                            response = await fetch(
                                `
                                    /personnel/modal/students/entries/fetch
                                `,
                                {
                                    method: 'GET',
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            )
                            
                            assignModalPreloader.style.display = 'none'
                            assignModalContainer.style.display = 'flex'

                            Object.values(await response.json()).forEach((data) => {

                                assignModalContainer.innerHTML += data
                                entriesCounter++
                                assignModalCounter.textContent = entriesCounter.toString()
                                assignModalEntries = assignModalContainer.querySelectorAll('.entry')

                            })

                        }
                        const bookModal = async (): Promise<void> => {

                            let response: Response

                            assignModalHeading.textContent = 'Choose a book'
                            assignModalPreloader.style.display = 'flex'
                            assignModalContainer.style.display = 'none'

                            response = await fetch(
                                `
                                    /personnel/modal/inventory/entries/fetch
                                `,
                                {
                                    method: 'GET',
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            )
                            
                            assignModalPreloader.style.display = 'none'
                            assignModalContainer.style.display = 'flex'

                            Object.values(await response.json()).forEach((data) => {

                                assignModalContainer.innerHTML += data
                                entriesCounter++
                                assignModalCounter.textContent = entriesCounter.toString()
                                assignModalEntries = assignModalContainer.querySelectorAll('.entry')

                            })

                        }
                        const closeModal = async (): Promise<void> => {

                            assignModalContainer.innerHTML = ''
                            assignModalSubmit.disabled = true
                            lendModal.style.display = 'grid'
                            assignModal.style.display = 'none'
                            isModalOpen = true

                        }

                        assignModalContainer.innerHTML = ''
                        assignModalSubmit.disabled = true
                        lendModal.style.display = 'none'
                        assignModal.style.display = 'flex'
                        isModalOpen = false

                        modalType === 'book'
                        ? await bookModal()
                        : await studentModal()

                        assignModalEntries.forEach((entry) => {

                            const entryDropdown: HTMLDivElement = entry.querySelector('.dropdown')
                            const entryDropdownBtn: HTMLButtonElement = entry.querySelector('.preview > .toggleDropdown')

                            entry.addEventListener('click', async () => {

                                for (const modalEntry of assignModalEntries) {

                                    if (modalEntry != entry && modalEntry.getAttribute('data-selected') === 'true') { 
                                        
                                        modalEntry.setAttribute('data-selected', 'false')
                                        assignModalSubmit.disabled = true
                                    
                                    }

                                }

                                entry.getAttribute('data-selected') === 'false'
                                ? (
                                    entry.setAttribute('data-selected', 'true'),
                                    assignModalSubmit.disabled = false
                                )
                                :(
                                    entry.setAttribute('data-selected', 'false'),
                                    assignModalSubmit.disabled = true
                                )

                            })

                            entryDropdownBtn.addEventListener('click', (element) => {

                                const button = element.target as HTMLElement

                                entryDropdown.getAttribute('data-hidden') === 'false'
                                ? (
                                    button.classList.remove('fa-caret-up'),
                                    button.classList.add('fa-caret-down'),
                                    entryDropdown.setAttribute('data-hidden', 'true')
                                )
                                : (
                                    button.classList.remove('fa-caret-down'),
                                    button.classList.add('fa-caret-up'),
                                    entryDropdown.setAttribute('data-hidden', 'false')
                                )

                            })

                        })

                        assignModalClose.addEventListener('click', closeModal)

                        assignModalReset.addEventListener('click', () => {

                            for (const entry of assignModalEntries) {

                                entry.setAttribute('data-selected', 'false')

                            }
                        
                            assignModalSubmit.disabled = true

                        })

                        assignModalSubmit.addEventListener('click', async () => {

                            for (const entry of assignModalEntries) {

                                if (entry.getAttribute('data-selected') === 'true') {

                                    const entryIdentifier: string = entry.querySelector('.dropdown > .identifier > h3 > .data').textContent
                                    const entryName: string = entry.querySelector('.preview > .name').textContent
                                    const modalPreview: HTMLHeadingElement = lendModal.querySelector(`form > .${ modalType }`)
                                    
                                    modalPreview.querySelector('h3').textContent = entryName
                                    modalPreview.setAttribute('data-identifier', entryIdentifier)
                                    entry.setAttribute('data-selected', 'false')

                                    await closeModal()

                                }

                            }

                            utils.checkForms(lendModalForm, true)

                        })
            
                    }))

                    lendModalPreviews.forEach((preview: HTMLDivElement) => {

                        preview.setAttribute('data-identifier', 'null')
                        preview.querySelector('h3').textContent = 'None assigned'

                    })
                
                    lendModalInputs.forEach((input: HTMLInputElement) => {

                        input.value = ''
                        input.addEventListener('input', () => utils.checkForms(lendModalForm, true))

                    })
                
                    lendModalBtns['close'].addEventListener('click', async () => await closeModal())
                    lendModalBtns['reset'].addEventListener('click', async () => await resetData())
                    lendModalBtns['submit'].addEventListener('click', async (event) => {

                        const button = event.target as HTMLButtonElement
                        const data: { entryId: string, modalId: string, dueDate: string } = {
                            entryId: entryId,
                            modalId: lendModal.querySelector(`form > .${ type === 'students' ? 'book' : 'student' }`).getAttribute('data-identifier'),
                            dueDate: lendModal.querySelector('form > .dueDate > input')['value']
                        }

                        try {

                            event.preventDefault()

                            button.innerHTML =
                            `
                                <i class="fa-duotone fa-spinner-third fa-spin"></i>
                                Updating...
                            `
                            
                            await fetch(`/personnel/modal/${ type }/lend`, { 
                                method: "PUT", 
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data) 
                            })

                            lendModalPrompts['success'].style.display = 'flex'

                            setTimeout(async () => {

                                button.innerHTML = 'Submit changes'

                                await resetData()
                                await closeModal()

                                lendModalPrompts['success'].style.display = 'none'

                            }, 2500)

                        } catch(err) {

                            lendModalPrompts['error'].style.display = 'flex'

                            setTimeout(() => { lendModalPrompts['error'].style.display = 'none'; throw err; }, 2500)
                        
                        }

                    })

                    utils.checkForms(lendModalForm, true)

                    modal.style.display = 'grid'
                    lendModal.style.display = 'grid'
                    isModalOpen = true

                }
                const studentsNotify = async () => {

                    

                }

                try {

                    switch (targetAction) {
                    
                        case 'pInventoryActionsEdit':
                            await utils.openEditModal('inventory', modal, target.parentElement.parentElement)    
                            break;
    
                        case 'pInventoryActionsDelete':
                            await utils.openDeleteModal('inventory', modal, target.parentElement.parentElement)
                            break;
    
                        case 'pInventoryActionsBookLend':
                            await invLend("inventory")
                            break;
                        
                        case 'pInventoryActionsStudentLend':
                            await invLend("students")
                            break;
                        
                        case 'pStudentsActionsEdit':
                            await utils.openEditModal('students', modal, target.parentElement.parentElement)  
                            break;
    
                        case 'pStudentsActionsDelete':
                            await utils.openDeleteModal('students', modal, target.parentElement.parentElement)
                            break;
    
                        case 'pStudentsActionsNotify':
                            await studentsNotify()
                            break;
                        
                        case 'pUsersActionsEdit':
                            await utils.openEditModal('users', modal, target.parentElement.parentElement)  
                            break;
    
                        case 'pUsersActionsDelete':
                            await utils.openDeleteModal('users', modal, target.parentElement.parentElement)
                            break;
    
                        default: break;
    
                    }
                        
                } catch(err) {

                    const errorData: URLSearchParams = await utils.errorPrompt({ 
                        title: err.title, 
                        status: err.status, 
                        body: err.body 
                    })

                    window.location.href = `/error?${ errorData.toString() }`

                }

            })

        }
        entryActions()

    }
    tableActions()

    await utils.setDashboardData('personnel')

})