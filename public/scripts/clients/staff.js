import { DateTime } from "../../../node_modules/luxon/build/es6/luxon.js";
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
        const areLendInputsFilled = async () => {
            const lend = document.querySelector('#md-lend');
            const lendButton = lend.querySelector('#md-lend-submit');
            const studentNumber = lend.querySelector('#md-lend-studentNumber');
            const dueDate = lend.querySelector('#md-lend-dueDate');
            if (studentNumber.value != '' && dueDate.value != '') {
                lendButton.disabled = false;
            }
            else {
                lendButton.disabled = true;
            }
        };
        const getJSONResponse = async (url, method, data) => {
            let response;
            if (!data) {
                response = await fetch(url, {
                    method: method.toUpperCase(),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            else {
                response = await fetch(url, {
                    method: method.toUpperCase(),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            }
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        };
        const getStatusResponse = async (url, method, data) => {
            let response;
            if (!data) {
                response = await fetch(url, {
                    method: method.toUpperCase(),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            else {
                response = await fetch(url, {
                    method: method.toUpperCase(),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            }
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.status;
        };
        const computeDueBooks = async () => { await getStatusResponse('/db/books/due/compute', 'POST'); };
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
                                <h4 class="due">Past due <span id="br-data-due">${dueData[i].duration_due}</span> days ago</h4>
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
                                <h4>Due in <span id="br-data-due">${borrowedData[i].duration_borrowed}</span> days</h4>
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
        const startEntriesListener = async () => {
            document.addEventListener('click', async (event) => {
                const target = event.target;
                if (target.id == 'br-actions-markAsReturned') {
                    const entry = target.parentElement.parentElement;
                    const entryTitle = entry.querySelector('#br-header-title').textContent;
                    await getStatusResponse('/db/books/mark-as-returned', 'POST', { title: entryTitle });
                    entry.remove();
                    await getDatabaseItems();
                }
                if (target.id == 'md-lend-close') {
                    const modal = document.querySelector('#md');
                    const lend = modal.querySelector('#md-lend');
                    modal.style.display = 'none';
                    lend.style.display = 'none';
                }
                if (target.id == 'md-lend-confirm-close') {
                    const modal = document.querySelector('#md');
                    const lendConfirm = modal.querySelector('#md-lend-confirm');
                    modal.style.display = 'none';
                    lendConfirm.style.display = 'none';
                }
                if (target.id == 'md-lend-submit') {
                }
                if (target.id == 'av-actions-lend') {
                    const entry = target.parentElement.parentElement;
                    const modal = document.querySelector('#md');
                    const modalLend = modal.querySelector('#md-lend');
                    const modalBook = modal.querySelector('#md-lend-lendedBook');
                    const modalDateInput = modalLend.querySelector('#md-lend-dueDate');
                    const modalMinDate = DateTime.now().plus({ days: 1 }).toISODate().split('T')[0];
                    await areLendInputsFilled();
                    modalBook.textContent = entry.querySelector('#av-data-title').textContent;
                    modalDateInput.setAttribute('min', modalMinDate);
                    modal.style.display = 'grid';
                    modalLend.style.display = 'flex';
                }
                if (target.id == 'av-actions-edit') {
                    const entry = target.parentElement.parentElement;
                }
            });
        };
        await startEntriesListener();
        const startModalsListener = async () => {
            const startLendBookListener = async () => {
                const startInputsListener = async () => {
                    const lend = document.querySelector('#md-lend');
                    const form = lend.querySelector('form');
                    const inputs = form.querySelectorAll('input');
                    inputs.forEach((element) => {
                        element.addEventListener('input', async () => {
                            await areLendInputsFilled();
                        });
                    });
                };
                await startInputsListener();
                const startSubmitListener = async () => {
                    const lend = document.querySelector('#md-lend');
                    const lendConfirm = document.querySelector('#md-lend-confirm');
                    const lendSubmit = lend.querySelector('#md-lend-submit');
                    lendSubmit.addEventListener('click', async (event) => {
                        event.preventDefault();
                        const error = lend.querySelector('#md-lend-error');
                        const errorText = error.querySelector('p');
                        error.style.display = 'none';
                        errorText.textContent = '';
                        const studentNumber = lend.querySelector('#md-lend-studentNumber');
                        const response = await getJSONResponse('/db/students/studentNumber/validate', 'POST', { studentNumber: studentNumber.value });
                        if (!response.ok) {
                            errorText.textContent = response.error;
                            error.style.display = 'block';
                        }
                        else {
                            const confirmLendedBook = lend.querySelector('#md-lend-lendedBook');
                            const confirmStudentName = response.name;
                            const confirmStudentNumber = studentNumber.value;
                            const confirmDueDate = lend.querySelector('#md-lend-dueDate');
                            const lendConfirmLendedBook = lendConfirm.querySelector('#md-lend-confirm-lendedBook');
                            const lendConfirmStudentName = lendConfirm.querySelector('#md-lend-confirm-studentName');
                            const lendConfirmStudentNumber = lendConfirm.querySelector('#md-lend-confirm-studentNumber');
                            const lendConfirmDueDate = lendConfirm.querySelector('#md-lend-confirm-dueDate');
                            lendConfirmLendedBook.textContent = confirmLendedBook.textContent;
                            lendConfirmStudentName.textContent = confirmStudentName;
                            lendConfirmStudentNumber.textContent = confirmStudentNumber;
                            lendConfirmDueDate.textContent = confirmDueDate.value;
                            confirmLendedBook.textContent = '';
                            confirmDueDate.value = '';
                            studentNumber.value = '';
                            lend.style.display = 'none';
                            lendConfirm.style.display = 'flex';
                        }
                    });
                };
                await startSubmitListener();
                const startConfirmSubmitListener = async () => {
                    const modal = document.querySelector('#md');
                    const lendConfirm = modal.querySelector('#md-lend-confirm');
                    const lendConfirmSubmit = lendConfirm.querySelector('#md-lend-confirm-submit');
                    lendConfirmSubmit.addEventListener('click', async (event) => {
                        const lendConfirmLendedBook = lendConfirm.querySelector('#md-lend-confirm-lendedBook');
                        const lendConfirmStudentName = lendConfirm.querySelector('#md-lend-confirm-studentName');
                        const lendConfirmStudentNumber = lendConfirm.querySelector('#md-lend-confirm-studentNumber');
                        const lendConfirmDueDate = lendConfirm.querySelector('#md-lend-confirm-dueDate');
                        const lendConfirmDueTime = DateTime.now().toFormat('HH:mm:ss');
                        event.preventDefault();
                        await getJSONResponse('/db/books/lend', 'POST', {
                            lendedBook: lendConfirmLendedBook.textContent,
                            studentName: lendConfirmStudentName.textContent,
                            studentNumber: lendConfirmStudentNumber.textContent,
                            dateDue: `${DateTime.fromISO(lendConfirmDueDate.textContent).toFormat('yyyy-MM-dd')} ${lendConfirmDueTime}`
                        });
                        modal.style.display = 'none';
                        lendConfirm.style.display = 'none';
                        lendConfirmLendedBook.textContent = '';
                        lendConfirmStudentName.textContent = '';
                        lendConfirmStudentNumber.textContent = '';
                        lendConfirmDueDate.textContent = '';
                        await computeDueBooks();
                        await getDatabaseItems();
                    });
                };
                await startConfirmSubmitListener();
            };
            await startLendBookListener();
        };
        await startModalsListener();
    };
    init();
});
