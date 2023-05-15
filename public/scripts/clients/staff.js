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
        const areLendBookInputsFilled = async () => {
            const modal = document.querySelector('#md');
            const modalLend = modal.querySelector('#md-lend');
            const modalLendSubmit = modalLend.querySelector('#md-lend-submit');
            const modalLendForm = modalLend.querySelector('form');
            const modalLendFormInputs = modalLendForm.querySelectorAll('input');
            let areInputsFilled = true;
            for (const inputs of modalLendFormInputs) {
                if (inputs.value.trim() == '') {
                    areInputsFilled = false;
                    break;
                }
            }
            modalLendSubmit.disabled = !areInputsFilled;
        };
        const areEditBookInputsFilled = async () => {
            const modal = document.querySelector('#md');
            const modalEdit = modal.querySelector('#md-edit');
            const modalEditSubmit = modalEdit.querySelector('#md-edit-submit');
            const modalEditForm = modalEdit.querySelector('form');
            const modalEditFormInputs = modalEditForm.querySelectorAll('input');
            let areInputsFilled = true;
            for (const inputs of modalEditFormInputs) {
                if (inputs.value.trim() == '') {
                    areInputsFilled = false;
                    break;
                }
            }
            modalEditSubmit.disabled = !areInputsFilled;
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
                    <div class="entry" data-id="${dueData[i].id}">
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
            staff.actions.refresh.addEventListener('click', async () => {
                await computeDueBooks();
                await getDatabaseItems();
            });
        };
        await startActionsListener();
        const startEntriesListener = async () => {
            document.addEventListener('click', async (event) => {
                const target = event.target;
                const startBorrowedEntriesListener = async () => {
                    if (target.id == 'br-actions-markAsReturned') {
                        const entry = target.parentElement.parentElement;
                        const entryTitle = entry.querySelector('#br-header-title').textContent;
                        await getStatusResponse('/db/books/mark-as-returned', 'POST', { title: entryTitle });
                        entry.remove();
                        await getDatabaseItems();
                    }
                };
                startBorrowedEntriesListener();
                const startAvailableEntriesListener = async () => {
                    if (target.id == 'av-actions-lend') {
                        const entry = target.parentElement.parentElement;
                        const modal = document.querySelector('#md');
                        const modalLend = modal.querySelector('#md-lend');
                        const modalLendForm = modalLend.querySelector('form');
                        const modalLendFormInputs = modalLendForm.querySelectorAll('input');
                        const modalLendBook = modalLend.querySelector('#md-lend-lendedBook');
                        const modalLendDate = modalLend.querySelector('#md-lend-dueDate');
                        const modalMinDate = DateTime.now().plus({ days: 1 }).toISODate().split('T')[0];
                        for (const inputs of modalLendFormInputs) {
                            inputs.value = '';
                        }
                        await areLendBookInputsFilled();
                        modalLendBook.textContent = entry.querySelector('#av-data-title').textContent;
                        modalLendDate.setAttribute('min', modalMinDate);
                        modal.style.display = 'grid';
                        modalLend.style.display = 'flex';
                    }
                    if (target.id == 'av-actions-edit') {
                        const modal = document.querySelector('#md');
                        const entry = target.parentElement.parentElement;
                        const entryId = entry.getAttribute('data-id');
                        const entryTitle = entry.querySelector('#av-data-title');
                        const entryAuthor = entry.querySelector('#av-data-author');
                        const entryGenre = entry.querySelector('#av-data-genre');
                        const entryPublication = entry.querySelector('#av-data-date');
                        const edit = modal.querySelector('#md-edit');
                        const editId = edit.querySelector('#md-edit-id');
                        const editTitle = edit.querySelector('#md-edit-title');
                        const editAuthor = edit.querySelector('#md-edit-author');
                        const editGenre = edit.querySelector('#md-edit-genre');
                        const editPublication = edit.querySelector('#md-edit-datePublicized');
                        editId.textContent = entryId;
                        editTitle.value = entryTitle.textContent;
                        editAuthor.value = entryAuthor.textContent;
                        editGenre.value = entryGenre.textContent;
                        editPublication.value = new Date(entryPublication.textContent).toISOString().split('T')[0];
                        await areEditBookInputsFilled();
                        modal.style.display = 'grid';
                        edit.style.display = 'flex';
                    }
                };
                startAvailableEntriesListener();
            });
        };
        await startEntriesListener();
        const startModalsListener = async () => {
            const startLendBookListener = async () => {
                const modal = document.querySelector('#md');
                const modalLend = modal.querySelector('#md-lend');
                const modalLendConfirm = modal.querySelector('#md-lend-confirm');
                const startInputsListener = async () => {
                    const modalLendForm = modalLend.querySelector('form');
                    const modalLendFormInputs = modalLendForm.querySelectorAll('input');
                    modalLendFormInputs.forEach((element) => {
                        element.addEventListener('input', async () => {
                            await areLendBookInputsFilled();
                        });
                    });
                };
                await startInputsListener();
                const startActionsListener = async () => {
                    const modalLendSubmit = modalLend.querySelector('#md-lend-submit');
                    const modalLendConfirmSubmit = modalLendConfirm.querySelector('#md-lend-confirm-submit');
                    const startLendSubmitListener = async () => {
                        modalLendSubmit.addEventListener('click', async (event) => {
                            event.preventDefault();
                            const error = modal.querySelector('#md-lend-error');
                            const errorText = error.querySelector('p');
                            error.style.display = 'none';
                            errorText.textContent = '';
                            const studentNumber = modal.querySelector('#md-lend-studentNumber');
                            const response = await getJSONResponse('/db/students/studentNumber/validate', 'POST', { studentNumber: studentNumber.value });
                            if (!response.ok) {
                                errorText.textContent = response.error;
                                error.style.display = 'block';
                            }
                            else {
                                const confirmLendedBook = modalLend.querySelector('#md-lend-lendedBook');
                                const confirmStudentName = response.name;
                                const confirmStudentNumber = studentNumber.value;
                                const confirmDueDate = modalLend.querySelector('#md-lend-dueDate');
                                const lendConfirmLendedBook = modalLendConfirm.querySelector('#md-lend-confirm-lendedBook');
                                const lendConfirmStudentName = modalLendConfirm.querySelector('#md-lend-confirm-studentName');
                                const lendConfirmStudentNumber = modalLendConfirm.querySelector('#md-lend-confirm-studentNumber');
                                const lendConfirmDueDate = modalLendConfirm.querySelector('#md-lend-confirm-dueDate');
                                lendConfirmLendedBook.textContent = confirmLendedBook.textContent;
                                lendConfirmStudentName.textContent = confirmStudentName;
                                lendConfirmStudentNumber.textContent = confirmStudentNumber;
                                lendConfirmDueDate.textContent = confirmDueDate.value;
                                confirmLendedBook.textContent = '';
                                confirmDueDate.value = '';
                                studentNumber.value = '';
                                modalLend.style.display = 'none';
                                modalLendConfirm.style.display = 'flex';
                            }
                        });
                    };
                    await startLendSubmitListener();
                    const startLendCloseListener = async () => {
                        const modalLendClose = modalLend.querySelector('#md-lend-close');
                        modalLendClose.addEventListener('click', () => {
                            modal.style.display = 'none';
                            modalLend.style.display = 'none';
                        });
                    };
                    await startLendCloseListener();
                    const startLendConfirmSubmitListener = async () => {
                        modalLendConfirmSubmit.addEventListener('click', async (event) => {
                            event.preventDefault();
                            const lendConfirmLendedBook = modalLendConfirm.querySelector('#md-lend-confirm-lendedBook');
                            const lendConfirmStudentName = modalLendConfirm.querySelector('#md-lend-confirm-studentName');
                            const lendConfirmStudentNumber = modalLendConfirm.querySelector('#md-lend-confirm-studentNumber');
                            const lendConfirmDueDate = modalLendConfirm.querySelector('#md-lend-confirm-dueDate');
                            const lendConfirmDueTime = DateTime.now().toFormat('HH:mm:ss');
                            await getJSONResponse('/db/books/lend', 'POST', {
                                lendedBook: lendConfirmLendedBook.textContent,
                                studentName: lendConfirmStudentName.textContent,
                                studentNumber: lendConfirmStudentNumber.textContent,
                                dateDue: `${DateTime.fromISO(lendConfirmDueDate.textContent).toFormat('yyyy-MM-dd')} ${lendConfirmDueTime}`
                            });
                            modal.style.display = 'none';
                            modalLendConfirm.style.display = 'none';
                            lendConfirmLendedBook.textContent = '';
                            lendConfirmStudentName.textContent = '';
                            lendConfirmStudentNumber.textContent = '';
                            lendConfirmDueDate.textContent = '';
                            await computeDueBooks();
                            await getDatabaseItems();
                        });
                    };
                    await startLendConfirmSubmitListener();
                    const startLendConfirmCloseListener = async () => {
                        const modalLendConfirmClose = modalLendConfirm.querySelector('#md-lend-confirm-close');
                        modalLendConfirmClose.addEventListener('click', () => {
                            modal.style.display = 'none';
                            modalLendConfirm.style.display = 'none';
                        });
                    };
                    await startLendConfirmCloseListener();
                };
                await startActionsListener();
            };
            await startLendBookListener();
            const startEditBookListener = async () => {
                const modal = document.querySelector('#md');
                const modalEdit = modal.querySelector('#md-edit');
                const modalEditConfirm = modal.querySelector('#md-edit-confirm');
                const startInputsListener = async () => {
                    const modalEditForm = modalEdit.querySelector('form');
                    const modalEditFormInputs = modalEditForm.querySelectorAll('input');
                    modalEditFormInputs.forEach((element) => {
                        element.addEventListener('input', async () => {
                            await areEditBookInputsFilled();
                        });
                    });
                };
                await startInputsListener();
                const startActionsListener = async () => {
                    const modalEditSubmit = modalEdit.querySelector('#md-edit-submit');
                    const modalEditConfirmSubmit = modalEditConfirm.querySelector('#md-edit-confirm-submit');
                    const startEditSubmitListener = async () => {
                        modalEditSubmit.addEventListener('click', (event) => {
                            event.preventDefault();
                            const modalEditId = modalEdit.querySelector('#md-edit-id');
                            const modalEditTitle = modalEdit.querySelector('#md-edit-title');
                            const modalEditAuthor = modalEdit.querySelector('#md-edit-author');
                            const modalEditGenre = modalEdit.querySelector('#md-edit-genre');
                            const modalEditPublication = modalEdit.querySelector('#md-edit-datePublicized');
                            const modalEditConfirmId = modalEditConfirm.querySelector('#md-edit-confirm-id');
                            const modalEditConfirmTitle = modalEditConfirm.querySelector('#md-edit-confirm-title');
                            const modalEditConfirmAuthor = modalEditConfirm.querySelector('#md-edit-confirm-author');
                            const modalEditConfirmGenre = modalEditConfirm.querySelector('#md-edit-confirm-genre');
                            const modalEditConfirmPublication = modalEditConfirm.querySelector('#md-edit-confirm-datePublicized');
                            modalEditConfirmId.textContent = modalEditId.textContent;
                            modalEditConfirmTitle.textContent = modalEditTitle.value;
                            modalEditConfirmAuthor.textContent = modalEditAuthor.value;
                            modalEditConfirmGenre.textContent = modalEditGenre.value;
                            modalEditConfirmPublication.textContent = modalEditPublication.value;
                            modalEdit.style.display = 'none';
                            modalEditConfirm.style.display = 'flex';
                        });
                    };
                    await startEditSubmitListener();
                    const startEditCloseListener = async () => {
                        const modalEditClose = modalEdit.querySelector('#md-edit-close');
                        modalEditClose.addEventListener('click', () => {
                            modal.style.display = 'none';
                            modalEdit.style.display = 'none';
                        });
                    };
                    await startEditCloseListener();
                    const startEditConfirmSubmitListener = async () => {
                        modalEditConfirmSubmit.addEventListener('click', async (event) => {
                            event.preventDefault();
                            const modalEditConfirmId = modalEditConfirm.querySelector('#md-edit-confirm-id');
                            const modalEditConfirmTitle = modalEditConfirm.querySelector('#md-edit-confirm-title');
                            const modalEditConfirmAuthor = modalEditConfirm.querySelector('#md-edit-confirm-author');
                            const modalEditConfirmGenre = modalEditConfirm.querySelector('#md-edit-confirm-genre');
                            const modalEditConfirmPublication = modalEditConfirm.querySelector('#md-edit-confirm-datePublicized');
                            await getJSONResponse('/db/books/edit', 'POST', {
                                id: modalEditConfirmId.textContent,
                                title: modalEditConfirmTitle.textContent,
                                author: modalEditConfirmAuthor.textContent,
                                genre: modalEditConfirmGenre.textContent,
                                datePublicized: modalEditConfirmPublication.textContent
                            });
                            modal.style.display = 'none';
                            modalEditConfirm.style.display = 'none';
                            modalEditConfirmTitle.textContent = '';
                            modalEditConfirmAuthor.textContent = '';
                            modalEditConfirmGenre.textContent = '';
                            modalEditConfirmPublication.textContent = '';
                            await getDatabaseItems();
                        });
                    };
                    await startEditConfirmSubmitListener();
                    const startEditConfirmCloseListener = async () => {
                        const modalEditConfirmClose = modalEditConfirm.querySelector('#md-edit-confirm-close');
                        modalEditConfirmClose.addEventListener('click', () => {
                            modal.style.display = 'none';
                            modalEditConfirm.style.display = 'none';
                        });
                    };
                    await startEditConfirmCloseListener();
                };
                await startActionsListener();
            };
            await startEditBookListener();
        };
        await startModalsListener();
    };
    init();
});
