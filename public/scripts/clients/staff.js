import { setLightTheme, setDarkTheme, setPreferredTheme } from "./initialize.js";
document.addEventListener('DOMContentLoaded', () => {
    const staff = {
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
    };
    const init = async () => {
        const getJSONResponse = async (url, method) => {
            const response = await fetch(url, {
                method: method.toUpperCase(),
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return await response.json();
        };
        const getStatusResponse = async (url, method) => {
            const response = await fetch(url, {
                method: method.toUpperCase(),
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.status;
        };
        const computeDueBooks = async () => {
            console.log('computing');
            await getStatusResponse('/db/books/due/compute', 'POST');
            console.log('computed?');
        };
        await computeDueBooks();
        const getDatabaseItems = async () => {
            const getAvailableBooks = async () => {
                staff.availability.container.innerHTML = '';
                const count = await getJSONResponse('/db/books/available/count', 'GET');
                const data = await getJSONResponse('/db/books/available/data', 'GET');
                for (let i = 0; i < data.length; i++) {
                    const entry = `
                    <div class="entry">
                        <div class="data">
                            <h3 id="av-data-title">${data[i].title}</h3>
                            <div class="wrapper">
                                <h4 id="av-data-author">${data[i].author}</h4>
                                <h4 id="av-data-category">${data[i].genre}</h4>
                            </div>
                            <time id="av-data-date">${data[i].date_publicized}</time>
                        </div>
                        <div class="actions">
                            <button id="av-actions-lend">Lend</button>
                            <button id="av-actions-edit">Edit</button>
                        </div>
                    </div>
                    `;
                    staff.availability.container.innerHTML += entry;
                }
                staff.overview.availability.textContent = count;
            };
            getAvailableBooks();
            const getDueBooks = async () => {
                const count = await getJSONResponse('/db/books/due/count', 'GET');
                staff.overview.due.textContent = count;
            };
            getDueBooks();
            const getBorrowedBooks = async () => {
                staff.borrowed.container.innerHTML = '';
                const count = await getJSONResponse('/db/books/borrowed/count', 'GET');
                const borrowedData = await getJSONResponse('/db/books/borrowed/data', 'GET');
                const dueData = await getJSONResponse('/db/books/due/data', 'GET');
                for (let i = 0; i < dueData.length; i++) {
                    const entry = `
                    <div class="entry">
                        <div class="header">
                            <h3 id="br-header-title">${dueData[i].title}</h3>
                            <button id="br-header-viewDetails">View details</button>
                        </div>
                        <div class="data">
                            <div class="wrapper">
                                <h4>Borrowed by <span id="br-data-borrower">${dueData[i].borrower}</span></h4>
                                <h4>Due in <span id="br-data-due">0</span> days</h4>
                            </div>
                            <time id="br-data-date">${dueData[i].date_publicized}</time>
                        </div>
                        <div class="actions">
                            <button id="br-actions-markAsReturned">Mark as returned</button>
                        </div>
                        
                    </div>
                    `;
                    staff.borrowed.container.innerHTML += entry;
                }
                for (let i = 0; i < borrowedData.length; i++) {
                    const entry = `
                    <div class="entry">
                        <div class="header">
                            <h3 id="br-header-title">${borrowedData[i].title}</h3>
                            <button id="br-header-viewDetails">View details</button>
                        </div>
                        <div class="data">
                            <div class="wrapper">
                                <h4>Borrowed by <span id="br-data-borrower">${borrowedData[i].borrower}</span></h4>
                                <h4>Due in <span id="br-data-due">0</span> days</h4>
                            </div>
                            <time id="br-data-date">${borrowedData[i].date_publicized}</time>
                        </div>
                        <div class="actions">
                            <button id="br-actions-markAsReturned">Mark as returned</button>
                        </div>
                        
                    </div>
                    `;
                    staff.borrowed.container.innerHTML += entry;
                }
                staff.overview.borrowed.textContent = count;
            };
            getBorrowedBooks();
            const getRegisteredStudents = async () => {
                const count = await getJSONResponse('/db/students/registered/count', 'GET');
                staff.overview.registered.textContent = count;
            };
            getRegisteredStudents();
        };
        await getDatabaseItems();
        const startNavigationListener = async () => {
            const navigation = document.querySelectorAll('.sidebar-links-nav > a,' +
                '.sidebar-links-librarian > a,' +
                '.sidebar-links-admin > a');
            navigation.forEach((element) => {
                element.addEventListener('click', (event) => {
                    const clickedLink = event.currentTarget;
                    navigation.forEach((navElement) => {
                        if (navElement != clickedLink) {
                            navElement.classList.remove('active');
                        }
                        clickedLink.classList.add('active');
                    });
                });
            });
        };
        await startNavigationListener();
        const startActionsListener = async () => {
            staff.actions.theme.addEventListener('click', (event) => {
                const target = document.querySelector('#hd-actions-theme > i');
                const classes = target.classList;
                if (classes[1] == 'fa-moon') {
                    setDarkTheme();
                    setPreferredTheme('dark');
                }
                else {
                    setLightTheme();
                    setPreferredTheme('light');
                }
            });
            staff.actions.refresh.addEventListener('click', () => { getDatabaseItems(); });
        };
        await startActionsListener();
    };
    init();
});
