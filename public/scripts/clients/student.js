import { DateTime } from "../../../node_modules/luxon/build/es6/luxon.js";
import { setLightTheme, setDarkTheme, setPreferredTheme } from "./initialize.js";
document.addEventListener('DOMContentLoaded', () => {
    const init = async () => {
        const areBorrowBookInputsFilled = async () => {
            const modal = document.querySelector('#md');
            const modalBorrow = modal.querySelector('#md-borrow');
            const modalBorrowSubmit = modalBorrow.querySelector('#md-borrow-submit');
            const modalBorrowForm = modalBorrow.querySelector('form');
            const modalBorrowFormInputs = modalBorrowForm.querySelectorAll('input');
            let areInputsFilled = true;
            for (const inputs of modalBorrowFormInputs) {
                if (inputs.value.trim() == '') {
                    areInputsFilled = false;
                    break;
                }
            }
            modalBorrowSubmit.disabled = !areInputsFilled;
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
                const available = document.querySelector('#av');
                const availableEntries = available.querySelector('#av-data-entries');
                availableEntries.innerHTML = '';
                const data = await getJSONResponse('/db/books/available/data', 'GET');
                for (let i = 0; i < data.length; i++) {
                    const entry = `
                    <div class="entry" data-id="${data[i].id}">
                        <div class="data">
                            <h3 id="av-data-title">${data[i].title}</h3>
                            <div class="wrapper">
                                <h4 id="av-data-author">${data[i].author}</h4>
                                <h4 id="av-data-genre">${data[i].genre}</h4>
                            </div>
                            <time id="av-data-date">${data[i].date_publicized}</time>
                        </div>
                        <div class="actions">
                            <button id="av-actions-borrow">Borrow Book</button>
                        </div>
                    </div>
                    `;
                    availableEntries.innerHTML += entry;
                }
            };
            await getAvailableBooks();
        };
        await getDatabaseItems();
        const startActionsListener = async () => {
            const header = document.querySelector('#hd');
            const headerTheme = header.querySelector('#hd-actions-theme');
            const headerRefresh = header.querySelector('#hd-actions-refresh');
            headerTheme.addEventListener('click', (event) => {
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
            headerRefresh.addEventListener('click', (event) => {
            });
        };
        await startActionsListener();
        const startEntriesListener = async () => {
            document.addEventListener('click', async (event) => {
                const target = event.target;
                if (target.id == 'av-actions-borrow') {
                    const entry = target.parentElement.parentElement;
                    const entryId = entry.getAttribute('data-id');
                    const modal = document.querySelector('#md');
                    const modalBorrow = modal.querySelector('#md-borrow');
                    const modalBorrowForm = modalBorrow.querySelector('form');
                    const modalBorrowFormInputs = modalBorrowForm.querySelectorAll('input');
                    const modalBorrowBook = modalBorrow.querySelector('#md-borrow-book');
                    for (const inputs of modalBorrowFormInputs) {
                        inputs.value = '';
                    }
                    await areBorrowBookInputsFilled();
                    modalBorrowBook.textContent = entry.querySelector('#av-data-title').textContent;
                    modal.style.display = 'grid';
                    modalBorrow.style.display = 'flex';
                }
            });
        };
        await startEntriesListener();
        const startModalsListener = async () => {
            const modal = document.querySelector('#md');
            const modalBorrow = modal.querySelector('#md-borrow');
            const modalBorrowConfirm = modal.querySelector('#md-borrow-confirm');
            const startInputsListener = async () => {
                const modalBorrowForm = modalBorrow.querySelector('form');
                const modalBorrowFormInputs = modalBorrowForm.querySelectorAll('input');
                modalBorrowFormInputs.forEach((element) => {
                    element.addEventListener('input', async () => {
                        await areBorrowBookInputsFilled();
                    });
                });
            };
            await startInputsListener();
            const startActionsListener = async () => {
                const modalBorrowSubmit = modalBorrow.querySelector('#md-borrow-submit');
                const modalBorrowConfirmSubmit = modalBorrowConfirm.querySelector('#md-borrow-confirm-submit');
                const startBorrowSubmitListener = async () => {
                    modalBorrowSubmit.addEventListener('click', async (event) => {
                        event.preventDefault();
                        const error = modalBorrow.querySelector('#md-borrow-error');
                        const errorText = error.querySelector('p');
                        error.style.display = 'none';
                        errorText.textContent = '';
                        const modalBorrowStudentNumber = modalBorrow.querySelector('#md-borrow-studentNumber');
                        const response = await getJSONResponse('/db/students/studentNumber/validate', 'POST', { studentNumber: modalBorrowStudentNumber.value });
                        if (!response.ok) {
                            errorText.textContent = response.error;
                            error.style.display = 'block';
                        }
                        else {
                            const modalBorrowBook = modalBorrow.querySelector('#md-borrow-book');
                            const modalBorrowConfirmBook = modalBorrowConfirm.querySelector('#md-borrow-confirm-book');
                            const modalBorrowConfirmStudentName = modalBorrowConfirm.querySelector('#md-borrow-confirm-studentName');
                            const modalBorrowConfirmStudentNumber = modalBorrowConfirm.querySelector('#md-borrow-confirm-studentNumber');
                            const modalBorrowConfirmPhoneNumber = modalBorrowConfirm.querySelector('#md-borrow-confirm-phoneNumber');
                            const modalBorrowConfirmStudentEmail = modalBorrowConfirm.querySelector('#md-borrow-confirm-studentEmail');
                            const modalBorrowConfirmDueDate = modalBorrowConfirm.querySelector('#md-borrow-confirm-dueDate');
                            modalBorrowConfirmBook.textContent = modalBorrowBook.textContent;
                            modalBorrowConfirmStudentName.textContent = response.name;
                            modalBorrowConfirmStudentNumber.textContent = response.studentNumber,
                                modalBorrowConfirmPhoneNumber.textContent = response.phoneNumber,
                                modalBorrowConfirmStudentEmail.textContent = response.studentEmail;
                            modalBorrowConfirmDueDate.textContent = DateTime.now().plus({ days: 7 }).toFormat('yyyy-MM-dd HH:mm:ss');
                            modalBorrow.style.display = 'none';
                            modalBorrowConfirm.style.display = 'flex';
                        }
                    });
                };
                await startBorrowSubmitListener();
                const startBorrowConfirmSubmitListener = async () => {
                    modalBorrowConfirmSubmit.addEventListener('click', async (event) => {
                        event.preventDefault();
                        const modalBorrowConfirmBook = modalBorrowConfirm.querySelector('#md-borrow-confirm-book');
                        const modalBorrowConfirmStudentName = modalBorrowConfirm.querySelector('#md-borrow-confirm-studentName');
                        const modalBorrowConfirmStudentNumber = modalBorrowConfirm.querySelector('#md-borrow-confirm-studentNumber');
                        const modalBorrowConfirmPhoneNumber = modalBorrowConfirm.querySelector('#md-borrow-confirm-phoneNumber');
                        const modalBorrowConfirmStudentEmail = modalBorrowConfirm.querySelector('#md-borrow-confirm-studentEmail');
                        const modalBorrowConfirmDueDate = modalBorrowConfirm.querySelector('#md-borrow-confirm-dueDate');
                        await getJSONResponse('/db/books/lend', 'POST', {
                            lendedBook: modalBorrowConfirmBook.textContent,
                            studentName: modalBorrowConfirmStudentName.textContent,
                            studentNumber: modalBorrowConfirmStudentNumber.textContent,
                            dateDue: modalBorrowConfirmDueDate.textContent
                        });
                        modal.style.display = 'none';
                        modalBorrowConfirm.style.display = 'none';
                        modalBorrowConfirmBook.textContent = '';
                        modalBorrowConfirmStudentName.textContent = '';
                        modalBorrowConfirmStudentNumber.textContent = '';
                        modalBorrowConfirmPhoneNumber.textContent = '';
                        modalBorrowConfirmStudentEmail.textContent = '';
                        modalBorrowConfirmDueDate.textContent = '';
                        await computeDueBooks();
                        await getDatabaseItems();
                    });
                };
                await startBorrowConfirmSubmitListener();
            };
            await startActionsListener();
        };
        await startModalsListener();
    };
    init();
});
