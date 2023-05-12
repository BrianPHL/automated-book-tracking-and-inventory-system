import { dashboard } from "../typings.js"
import { setLightTheme, setDarkTheme, setPreferredTheme } from "./initialize.js"

document.addEventListener('DOMContentLoaded', () => {

    const staff: dashboard = {
        actions: {
            theme: document.querySelector('#hd-actions-theme'),
            refresh: document.querySelector('#hd-actions-refresh'),
            logout: document.querySelector('#hd-actions-logout')
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

    const init = async () => {

        const getDatabaseItems = async () => {

            const getFetchResponse = async (url: string) => {

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`)
                }

                return await response.json();

            }

            const getAvailableBooks = async () => {

                staff.availability.container.innerHTML = ''

                const count = await getFetchResponse('/db/availableBooks/count')
                const data = await getFetchResponse('/db/availableBooks/data')
                
                for (let i = 0; i < data.length; i++) {
                    
                    const entry =
                    `
                    <div class="entry">
                        <div class="data">
                            <h3 id="av-data-title">${ data[i].title }</h3>
                            <div class="wrapper">
                                <h4 id="av-data-author">${ data[i].author }</h4>
                                <h4 id="av-data-category">${ data[i].genre }</h4>
                            </div>
                            <time id="av-data-date">${ data[i].date_publicized }</time>
                        </div>
                        <div class="actions">
                            <button id="av-actions-lend">Lend</button>
                            <button id="av-actions-edit">Edit</button>
                        </div>
                    </div>
                    `

                    staff.availability.container.innerHTML += entry

                }

                staff.overview.availability.textContent = count
                
            }
            getAvailableBooks()

            const getBorrowedBooks = async () => {

                staff.borrowed.container.innerHTML = ''
                
                const count = await getFetchResponse('/db/borrowedBooks/count')
                const data = await getFetchResponse('/db/borrowedBooks/data')
                
                for (let i = 0; i < data.length; i++) {
                    
                    const entry =
                    `
                    <div class="entry">
                        <div class="header">
                            <h3 id="br-header-title">${ data[i].title }</h3>
                            <button id="br-header-viewDetails">View details</button>
                        </div>
                        <div class="data">
                            <div class="wrapper">
                                <h4>Borrowed by <span id="br-data-borrower">${ data[i].borrower }</span></h4>
                                <h4>Due in <span id="br-data-due">0</span> days</h4>
                            </div>
                            <time id="br-data-date">${ data[i].date_publicized }</time>
                        </div>
                        <div class="actions">
                            <button id="br-actions-markAsReturned">Mark as returned</button>
                        </div>
                        
                    </div>
                    `

                    staff.borrowed.container.innerHTML += entry

                }

                staff.overview.borrowed.textContent = count

            }
            getBorrowedBooks()

            const getDueBooks = async () => {

                const count = await getFetchResponse('/db/dueBooks/count')

                staff.overview.due.textContent = count

            }
            getDueBooks()

            const getRegisteredStudents = async () => {

                const count = await getFetchResponse('/db/students/count')

                staff.overview.registered.textContent = count

            }

            getRegisteredStudents()

        }
        getDatabaseItems()

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

                const target = document.querySelector('#hd-actions-theme > i')
                const classes = target.classList

                if (classes[1] == 'fa-moon') {

                    setDarkTheme()
                    setPreferredTheme('dark')

                } else {

                    setLightTheme()
                    setPreferredTheme('light')                    

                }

            })

            staff.actions.refresh.addEventListener('click', () => { getDatabaseItems() })

        }
        startActionsListener()

    }

    init()
    
})