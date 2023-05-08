import { setLightTheme, setDarkTheme, setPreferredTheme } from "./initialize.js"

document.addEventListener('DOMContentLoaded', () => {

    const staff = {
        actions: {
            theme: document.querySelector('#hd-actions-theme'),
            search: document.querySelector('#hd-actions-search'),
            refresh: document.querySelector('#hd-actions-refresh'),
            view: {
                notifications: document.querySelector('#hd-actions-viewNotifications'),
                account: document.querySelector('#hd-actions-viewAccount')
            }
        },
        overview: {
            availability: document.querySelector('#ov-av-data-count'),
            borrowed: document.querySelector('#ov-br-data-count'),
            due: document.querySelector('#ov-du-data-count'),
            registered: document.querySelector('#ov-rs-data-count')
        },
        notifications: {
            container: document.querySelector('#nf-data-entries'),
            data: {
                message: document.querySelector('#nf-data-message'),
                date: document.querySelector('#nf-data-date')
            }
        },
        availability: {
            container: document.querySelector('#av-data-entries'),
            data: {
                title: document.querySelector('#av-data-title'),
                author: document.querySelector('#av-data-author'),
                category: document.querySelector('#av-data-category'),
                date: document.querySelector('#av-data-date') 
            },
            actions: {
                lend: document.querySelector('#av-actions-lend'),
                edit: document.querySelector('#av-actions-edit')
            }
        },
        borrowed: {
            container: document.querySelector('#br-data-entries'),
            header: {
                title: document.querySelector('#br-header-title'),
                viewDetails: document.querySelector('#br-header-viewDetails')
            },
            data: {
                borrower: document.querySelector('#br-data-borrower'),
                due: document.querySelector('#br-data-due')    
            },
            actions: {
                markAsReturned: document.querySelector('#br-actions-markAsReturned')
            }
        }
    }

    const init = () => {

        const startNavigationListener = () => {

            const navigation = document.querySelectorAll(
                '.sidebar-links-nav > a,' +
                '.sidebar-links-librarian > a,' +
                '.sidebar-links-admin > a'
            )

            navigation.forEach((element) => {

                element.addEventListener('click', (event) => {
                
                    const clickedLink = event.currentTarget as HTMLElement

                    navigation.forEach((navElement) => {

                        if (navElement != clickedLink) {
                            navElement.classList.remove('active')
                        }

                        clickedLink.classList.add('active')

                    })

                })
            })

        }
        startNavigationListener()

        const startActionsListener = () => {

            staff.actions.theme.addEventListener('click', (event) => {

                const target = event.target as HTMLElement
                const classes = target.classList

                if (classes[1] == 'fa-moon') {

                    setDarkTheme()
                    setPreferredTheme('dark')

                } else {

                    setLightTheme()
                    setPreferredTheme('light')                    

                }

            })

            staff.actions.search.addEventListener('click', () => {

            })

            staff.actions.refresh.addEventListener('click', () => {

            })

            staff.actions.view.account.addEventListener('click', () => {

            })

            staff.actions.view.notifications.addEventListener('click', () => {

            })

        }
        startActionsListener()

    }

    init()
    
    
    

})