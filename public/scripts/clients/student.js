import { setLightTheme, setDarkTheme, setPreferredTheme } from "./initialize.js";
document.addEventListener('DOMContentLoaded', () => {
    const init = async () => {
        const areBorrowBookInputsFilled = async () => {
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
        const getDatabaseItems = async () => {
            const getAvailableBooks = async () => {
                const available = document.querySelector('#av');
                const availableEntries = available.querySelector('#av-data-entries');
                availableEntries.innerHTML = '';
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
                            <button id="av-actions-lend">Borrow Book</button>
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
    };
    init();
});
