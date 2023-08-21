import * as utils from "../../utils/client.utils.js"

document.addEventListener('DOMContentLoaded', () => {

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

            navigationTab.addEventListener('click', (event: MouseEvent) => {

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

                utils.setTableAction(activeTable.getAttribute('data-tab'))
                utils.setDashboardData('personnel', activeTable.getAttribute('data-tab'))

            })

        })

    }
    navigationTabs()

    const navigationActions = () => {

        const nav: HTMLElement = bodyElement.querySelector('header > nav')
        const navActions: HTMLDivElement = nav.querySelector('.actions')
        const navRefresh: HTMLButtonElement = navActions.querySelector('.refresh')
        const navTheme: HTMLButtonElement = navActions.querySelector('.themeSwitch')
        const navLogout: HTMLButtonElement = navActions.querySelector('.logout')

        navRefresh.addEventListener('click', (event) => {
            
            event.preventDefault()

            navRefresh.innerHTML =
            `
                <i class="fa-regular fa-redo fa-spin-pulse"></i>
                <h2>Refreshing...</h2>
            `

            setTimeout(async () => {

                navRefresh.innerHTML =
                `
                    <i class="fa-regular fa-redo"></i>
                    <h2>Refresh</h2>
                `

                utils.setDashboardData('personnel', activeTable.getAttribute('data-tab'))
                
            }, 2500)

        })

        navTheme.addEventListener('click', (event) => {

            const currentTheme = localStorage.getItem('theme')
            
            event.preventDefault()
    
            currentTheme === 'light'
            ? utils.setDarkTheme()
            : utils.setLightTheme()

        })

        navLogout.addEventListener('click', (event) => {

            event.preventDefault()
    
            navLogout.innerHTML =
            `
                <i class="fa-duotone fa-loader fa-spin-pulse"></i>
                <h2>Logging out...</h2>
            `
    
            setTimeout(async () => {
    
                try {
    
                    const response: Response = await fetch('/personnel/logout', {
            
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    
                    })

                    navLogout.innerHTML =
                    `
                        <i class="fa-regular fa-right-from-bracket"></i>
                        <h2>Logout</h2>
                    `
    
                    !response.ok
                    ? window.location.href = `/error?${ await response.text() }`
                    : window.location.href = '/'
    
                } catch(err) {
                
                    const { name, message } = err
    
                    window.location.href = `/error?${ (await utils.errorPrompt({title: name, body: message})).toString() }`
    
                }
    
            }, 2500)

        })

    }
    navigationActions()

    const tableActions = () => {

        const bodyElement: HTMLBodyElement = document.querySelector('body')
        const modal: HTMLDivElement = bodyElement.querySelector('.modal')
        const tableActions: HTMLDivElement = bodyElement.querySelector('.controls')
        let prevTargetModal: HTMLDivElement
        let isModalOpen: boolean = false

        tableActions.addEventListener('click', () => {

            const target = event.target as HTMLElement

            if (target && target.matches('button[data-type="action"]')) {

                const activeTab: string = activeTable.getAttribute('data-tab')
                const targetModal: HTMLDivElement = modal.querySelector(`.${ activeTab } > .action`)
                const targetModalHeading: HTMLHeadingElement = targetModal.querySelector('.header > h3')

                if (activeTab === 'inventory') { targetModalHeading.textContent = 'Book Registration Form' }
                if (activeTab === 'students') { targetModalHeading.textContent = 'Student Registration Form' }
                if (activeTab === 'users') { targetModalHeading.textContent = 'Personnel Registration Form' }

                targetModal.setAttribute('data-type', 'register')
                modal.style.display = 'grid'
                targetModal.style.display = 'grid'
                prevTargetModal = targetModal
                isModalOpen = true
                
            }

        })

        const tableControlsSearch = () => {

            const tableSearch: HTMLDivElement = tableActions.querySelector('.search')
            const tableSearchInput: HTMLInputElement = tableSearch.querySelector('.input > input[type="text"]')
            const tableSearchSubmit: HTMLButtonElement = tableActions.querySelector('button[data-type="search"]')

            const searchFunction = async () => {

                try {

                    const activeTab: string = activeTable.getAttribute('data-tab')
                    const tableEntries: HTMLDivElement = activeTable.querySelector('.data > .entries')
                    const query = tableSearchInput.value.trim()
                    const response: Response = await fetch(`/personnel/table/${ activeTab }/search/${ query }`, {
            
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    
                    })
                    const tableData = await response.json()
            
                    tableEntries.innerHTML = ''
                    tableSearchSubmit.disabled = true
                    tableSearchSubmit.innerHTML = 
                    `
                    <i class="fa-duotone fa-loader fa-spin-pulse"></i>
                    Searching...
                    `

                    setTimeout(() => {

                        tableSearchSubmit.disabled = false
                        tableSearchSubmit.innerHTML = 
                        `
                        <i class="fa-regular fa-magnifying-glass"></i>
                        Search
                        `

                        Object.values(tableData).forEach(async (data: string) => {

                            tableEntries.innerHTML += data
    
                        })

                    }, 2500)

                } catch(err) {
                
                    const { name, message } = err
    
                    window.location.href = `/error?${ (await utils.errorPrompt({title: name, body: message})).toString() }`
    
                }

            }

            tableSearchInput.value = ''
            tableSearchSubmit.disabled = true
            
            tableSearchInput.addEventListener('keydown', async (event) => {

                if (event.key === 'Enter' && tableSearchInput.value.trim() !== '') { await searchFunction() }

            })

            tableSearchInput.addEventListener('input', (event) => {

                const activeTab: string = activeTable.getAttribute('data-tab')
    
                event.preventDefault()

                if (tableSearchInput.value.trim() === '') {

                    tableSearchSubmit.disabled = true
                    utils.setDashboardData('personnel', activeTab)

                } else { tableSearchSubmit.disabled = false }
    
            })

            tableSearchSubmit.addEventListener('click', async (event) => {
                
                event.preventDefault()
                
                await searchFunction()

            })

        }
        tableControlsSearch()

        const modalActions = () => {

            const closeModalBtns: NodeListOf<HTMLButtonElement> = modal.querySelectorAll('div > div > .header > i')
            const modalForms: NodeListOf<HTMLFormElement> = modal.querySelectorAll('div > div > form')
            
            modalForms.forEach((modalForm: HTMLFormElement) => {

                const modalFormInputs: NodeListOf<HTMLInputElement> = modalForm.querySelectorAll('div > input')
                const resetFormBtns: NodeListOf<HTMLButtonElement> = modalForm.querySelectorAll('.actions > button[type="reset"]')
                const submitFormBtns: NodeListOf<HTMLButtonElement> = modalForm.querySelectorAll('.actions > button[type="submit"]')
                const resetForm = async (): Promise<void> => {

                    return new Promise((resolve) => {

                        modalFormInputs.forEach((modalFormInput) => {

                            modalFormInput.value = '' 
                            utils.checkFormInputs(modalForm)
    
                        })

                        resolve()

                    })

                }
                const closeModal = async (): Promise<void> => {

                    return new Promise((resolve) => {

                        modal.style.display = 'none'
                        prevTargetModal.style.display = 'none'
                        isModalOpen = false
    
                        modalFormInputs.forEach((modalFormInput: HTMLInputElement) => { modalFormInput.value = '' })
                        
                        resolve()
                        
                    })

                }

                document.addEventListener('keydown', (event) => {

                    if (event.key === 'Escape' && isModalOpen) { closeModal() }

                })

                closeModalBtns.forEach((closeModalBtn: HTMLButtonElement) => {

                    closeModalBtn.addEventListener('click', () => { closeModal() })
    
                })

                modalFormInputs.forEach((modalFormInput: HTMLInputElement) => {

                    modalFormInput.addEventListener('input', () => { utils.checkFormInputs(modalForm) })

                })

                resetFormBtns.forEach((resetFormBtn: HTMLButtonElement) => {

                    resetFormBtn.addEventListener('click', () => { resetForm() })

                })

                submitFormBtns.forEach((submitFormBtn: HTMLButtonElement) => {

                    submitFormBtn.addEventListener('click', async (event) => {

                        const activeTab: string = activeTable.getAttribute('data-tab')
                        const successPrompts: NodeListOf<HTMLDivElement> = modal.querySelectorAll('div[data-type="success"]')
                        const errorPrompts: NodeListOf<HTMLDivElement> = modal.querySelectorAll('div[data-type="error"]')

                        try {
    
                            event.preventDefault()
    
                            const formData = new FormData(modalForm)
                            let registrationData = {}
    
                            for (const [name, value] of formData.entries()) { registrationData[name] = value.toString() }
    
                            await fetch(`/personnel/table/${activeTab}/actions/register`, {
    
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(registrationData)
    
                            })

                            successPrompts.forEach((successPrompt: HTMLDivElement) => {

                                successPrompt.style.display = 'flex' 
                        
                                setTimeout(async () => {
                                
                                    await resetForm()
                                    await closeModal()
                                    await utils.setDashboardData('personnel', activeTab)
                                    
                                    successPrompt.style.display = 'none'
                                
                                }, 2500)

                            })



                        } catch(err) {

                            errorPrompts.forEach((errorPrompt) => {

                                errorPrompt.style.display = 'flex'

                                setTimeout(() => {

                                    errorPrompt.style.display = 'none'

                                }, 2500)

                            })
                        
                        }
            
                    })

                })

                utils.checkFormInputs(modalForm)

            })

        }
        modalActions()

    }
    tableActions()

    const tableControls = () => {



    }
    tableControls()

    utils.setDashboardData('personnel')
    utils.setTableAction('dashboard')

})