import { DateTime } from "../../../node_modules/luxon/build/es6/luxon.js";
export const delay = async (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};
export const checkForms = async (form, isInputAndPreview) => {
    const submit = form.querySelector('button[type="submit"]');
    const checkFormInputsAndPreviews = async () => {
        const inputs = form.querySelectorAll('input');
        const previews = form.querySelectorAll('div[data-type="preview"]');
        for (const input of inputs) {
            if (input.value.trim() === '') {
                submit.disabled = true;
                return;
            }
            for (const preview of previews) {
                if (preview.getAttribute('data-identifier') === 'null') {
                    submit.disabled = true;
                    return;
                }
            }
        }
        submit.disabled = false;
        return;
    };
    const checkFormInputs = async () => {
        const inputs = form.querySelectorAll('input');
        for (const input of inputs) {
            if (input.value.trim() === "") {
                submit.disabled = true;
                return;
            }
        }
        submit.disabled = false;
    };
    try {
        isInputAndPreview
            ? await checkFormInputsAndPreviews()
            : await checkFormInputs();
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
export const errorPrompt = async (data) => {
    const params = new URLSearchParams();
    for (let [key, value] of Object.entries(data)) {
        params.append(key, value);
    }
    return params;
};
export const manipulateURL = async (data) => {
    const params = new URLSearchParams();
    for (let [key, value] of Object.entries(data)) {
        params.append(key, value);
    }
    const queryString = params.toString();
    window.history.pushState(data, document.title, `?${queryString}`);
};
export const sanitizeURL = async () => {
    const href = window.location.href;
    if (href.split("?").length > 1) {
        const previousUrl = href.split("?")[0];
        history.pushState({}, document.title, previousUrl);
    }
};
export const getPreferredTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};
export const setPreferredTheme = (cb) => {
    const savedTheme = localStorage.getItem('theme');
    const preferredTheme = getPreferredTheme();
    cb({ savedTheme: savedTheme, preferredTheme: preferredTheme });
};
export const setLightTheme = () => {
    const htmlElement = document.querySelector('html');
    const bodyElement = htmlElement.querySelector('body');
    if (htmlElement.getAttribute('data-site') === 'dashboard') {
        const header = bodyElement.querySelector('header');
        const nav = header.querySelector('nav');
        const navActions = nav.querySelector('.actions');
        const navActionsTheme = navActions.querySelector('.themeSwitch');
        navActionsTheme.innerHTML =
            `
            <i class="fa-regular fa-moon"></i>
            <h2>Dark mode</h2>
        `;
    }
    htmlElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
};
export const setDarkTheme = () => {
    const htmlElement = document.querySelector('html');
    const bodyElement = htmlElement.querySelector('body');
    if (htmlElement.getAttribute('data-site') === 'dashboard') {
        const header = bodyElement.querySelector('header');
        const nav = header.querySelector('nav');
        const navActions = nav.querySelector('.actions');
        const navActionsTheme = navActions.querySelector('.themeSwitch');
        navActionsTheme.innerHTML =
            `
            <i class="fa-regular fa-sun-bright"></i>
            <h2>Light mode</h2>
        `;
    }
    htmlElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
};
export const getURLData = async (url, identifier) => {
    return new URLSearchParams(url).get(identifier);
};
export const getDaysBetween = (firstDate, secondDate) => {
    if (!firstDate && !secondDate) {
        return;
    }
    const dateFormat = "yyyy-MM-dd HH:mm:ss";
    const fFirstDate = DateTime.fromFormat(firstDate, dateFormat);
    const fSecondDate = DateTime.fromFormat(secondDate, dateFormat);
    const dateNow = DateTime.now();
    const borrowDateDiff = Math.abs(Math.floor(fSecondDate.diff(fFirstDate).as('days')));
    const dueDateDiff = Math.abs(Math.floor(dateNow.diff(fSecondDate).as('days')));
    return fFirstDate > fSecondDate
        ? `${dueDateDiff} ${dueDateDiff === 1 ? 'day' : 'days'} past due`
        : `${borrowDateDiff} ${borrowDateDiff === 1 ? 'day' : 'days'} remaining`;
};
export const retrieveDashboardData = async (type, tab) => {
    try {
        const response = await fetch(`/${type}/${tab}/retrieve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return response;
    }
    catch (err) {
        console.error(err.name, err.message);
        throw err;
    }
};
export const setDashboardData = async (type, tab = "dashboard") => {
    const loaders = {
        overview: document.querySelectorAll('.overview > div > .loader'),
        table: document.querySelector(`.table[data-tab="${tab}"] > .loader`)
    };
    const setAccountData = async () => {
        return new Promise(async (resolve) => {
            const accountResponse = await fetch(`
                    /${type}/account/retrieve
                `, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const accountData = await accountResponse.json();
            const header = document.querySelector('header > .heading');
            const headerInfoName = header.querySelector('.info > h2 > .name');
            const headerInfoRole = header.querySelector('.info > h3 > .role');
            headerInfoName.textContent = accountData['firstName'];
            headerInfoRole.textContent = accountData['role'];
            resolve();
        });
    };
    const setOverviewData = async () => {
        return new Promise(async (resolve) => {
            let response;
            let data;
            const overviews = document.querySelectorAll('.overview > div > .data');
            response = await fetch(`
                    /${type}/table/${tab}/overview/retrieve
                `, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            data = await response.json();
            for (let i = 0; i < overviews.length; i++) {
                overviews[i].innerHTML = data[i];
                loaders.overview[i].style.display = 'none';
            }
            resolve();
        });
    };
    const setTableData = async () => {
        return new Promise(async (resolve) => {
            let response;
            let data;
            const table = document.querySelector(`.table[data-tab="${tab}"]`);
            const entries = table.querySelector('.data > .entries');
            response = await fetch(`
                    /${type}/table/${tab}/data/retrieve
                `, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            data = await response.json();
            entries.innerHTML = '';
            Object.values(data).forEach(entry => { entries.innerHTML += entry; });
            loaders.table.style.display = 'none';
            resolve();
        });
    };
    try {
        loaders.overview.forEach((loader) => { loader.style.display = 'flex'; });
        loaders.table.style.display = 'flex';
        await setAccountData();
        await setOverviewData();
        await setTableData();
    }
    catch (err) {
        const errorData = await errorPrompt({
            title: err.title,
            status: err.status,
            body: err.body
        });
        window.location.href = `/error?${errorData.toString()}`;
    }
};
export const openRegisterModal = async (type, modal) => {
    const registerModal = modal.querySelector(`.${type} > .registration`);
    const registerModalPrompts = {
        success: registerModal.querySelector('div[data-type="success"]'),
        error: registerModal.querySelector('div[data-type="error"]')
    };
    const registerModalForm = registerModal.querySelector('.form > form');
    const registerModalBtns = {
        close: registerModal.querySelector('.header > i'),
        reset: registerModalForm.querySelector('.actions > button[type="reset"]'),
        submit: registerModalForm.querySelector('.actions > button[type="submit"]')
    };
    const registerModalInputs = registerModalForm.querySelectorAll('input');
    const resetData = async () => {
        return new Promise(resolve => {
            registerModalInputs.forEach(input => input.value = '');
            checkForms(registerModalForm, false);
            resolve();
        });
    };
    const closeModal = async () => {
        await resetData();
        registerModal.style.display = 'none';
        modal.style.display = 'none';
    };
    try {
        registerModalInputs.forEach(input => {
            input.addEventListener('input', () => checkForms(registerModalForm, false));
            input.value = '';
        });
        registerModalBtns['close'].addEventListener('click', () => closeModal());
        registerModalBtns['reset'].addEventListener('click', () => resetData());
        registerModalBtns['submit'].addEventListener('click', async (event) => {
            let fetchedData = {};
            const button = event.target;
            const formData = new FormData(registerModalForm);
            event.preventDefault();
            for (const [name, value] of formData.entries()) {
                fetchedData[name] = value.toString();
            }
            button.innerHTML =
                `
                <i class="fa-duotone fa-spinner-third fa-spin"></i>
                Registering...
            `;
            await fetch(`/personnel/table/${type}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fetchedData)
            });
            registerModalPrompts['success'].style.display = 'flex';
            setTimeout(async () => {
                await resetData();
                await closeModal();
                button.innerHTML = 'Register';
                registerModalPrompts['success'].style.display = 'none';
            }, 2500);
        });
        modal.style.display = 'grid';
        registerModal.style.display = 'grid';
        checkForms(registerModalForm, false);
    }
    catch (err) {
        registerModalPrompts['error'].style.display = 'flex';
        setTimeout(() => { registerModalPrompts['error'].style.display = 'none'; throw err; }, 2500);
    }
};
export const openEditModal = async (type, modal, entry) => {
    let entryData;
    let modalData;
    const path = '.action > .form > form';
    const editModal = modal.querySelector(`.${type} > .action`);
    const editModalPrompts = {
        success: editModal.querySelector('div[data-type="success"]'),
        error: editModal.querySelector('div[data-type="error"]')
    };
    const editModalForm = editModal.querySelector('.form > form');
    const editModalBtns = {
        close: editModal.querySelector('.header > i'),
        reset: editModalForm.querySelector('.actions > button[type="reset"]'),
        submit: editModalForm.querySelector('.actions > button[type="submit"]')
    };
    const editModalHeading = editModal.querySelector('.header > .heading');
    const editModalInputs = editModalForm.querySelectorAll('input');
    const inventory = async () => {
        entryData = {
            title: entry.querySelector(".title > h2").textContent.trim(),
            author: entry.querySelector(".author > h2").textContent.trim(),
            genre: entry.querySelector(".genre > h2").textContent.trim(),
            date: entry.querySelector(".publicationDate > h2").textContent.trim()
        };
        modalData = {
            title: editModal.querySelector(`${path} > .title > input`),
            author: editModal.querySelector(`${path} > .author > input`),
            genre: editModal.querySelector(`${path} > .genre > input`),
            date: editModal.querySelector(`${path} > .dPublicized > input`)
        };
        editModalHeading.innerHTML =
            `
            <h3>Book Entry Edit Form</h3>
            <h4>
                Currently editing book entry
                <strong>#<span class="entryIdentifier">${entry.getAttribute('data-identifier')}</span></strong>
            </h4>
        `;
    };
    const students = async () => {
        entryData = {
            name: entry.querySelector(".name > h2").textContent.trim(),
            number: entry.querySelector(".studentNumber > h2").textContent.trim(),
            phone: entry.querySelector(".phoneNumber > h2").textContent.trim(),
            email: entry.querySelector(".emailAddress > h2").textContent.trim()
        };
        modalData = {
            name: editModal.querySelector(`${path} > .studentName > input`),
            number: editModal.querySelector(`${path} > .studentNumber > input`),
            phone: editModal.querySelector(`${path} > .phoneNumber > input`),
            email: editModal.querySelector(`${path} > .email > input`)
        };
        editModalHeading.innerHTML =
            `
            <h3>Student Entry Edit Form</h3>
            <h4>
                Currently editing student entry
                <strong>#<span class="entryIdentifier">${entry.getAttribute('data-identifier')}</span></strong>
            </h4>
        `;
    };
    const users = async () => {
        entryData = {
            fullName: entry.querySelector('.fullName > h2').textContent.trim(),
            userName: entry.querySelector('.username > h2').textContent.trim(),
            role: entry.querySelector('.role > h2').textContent.trim()
        };
        modalData = {
            fullName: editModal.querySelector(`${path} > .personnelName > input`),
            userName: editModal.querySelector(`${path} > .username > input`),
            role: editModal.querySelector(`${path} > .role > input`)
        };
        editModalHeading.innerHTML =
            `
            <h3>Personnel Entry Edit Form</h3>
            <h4>
                Currently editing personnel entry
                <strong>#<span class="entryIdentifier">${entry.getAttribute('data-identifier')}</span></strong>
            </h4>
        `;
    };
    const setData = async () => {
        return new Promise(async (resolve) => {
            for (const key in entryData) {
                await delay(250);
                const initialDate = "dd MMMM yyyy";
                const intendedDate = "yyyy-MM-dd";
                modalData[key]["type"] === "text"
                    ? modalData[key].value = entryData[key]
                    : modalData[key].value = DateTime.fromFormat(entryData[key], initialDate).toFormat(intendedDate);
            }
            resolve();
        });
    };
    const resetData = async () => {
        return new Promise(async (resolve) => {
            editModalInputs.forEach((input) => input.value = '');
            checkForms(editModalForm, false);
            await setData();
            checkForms(editModalForm, false);
            resolve();
        });
    };
    const closeModal = async () => {
        editModalInputs.forEach((input) => input.value = '');
        modal.style.display = 'none';
        editModal.style.display = 'none';
    };
    try {
        switch (type) {
            case "inventory":
                await inventory();
                break;
            case "students":
                await students();
                break;
            case "users":
                await users();
                break;
        }
        editModalInputs.forEach(input => {
            input.addEventListener('input', () => checkForms(editModalForm, false));
            input.value = '';
        });
        editModalBtns['close'].addEventListener('click', () => closeModal());
        editModalBtns['reset'].addEventListener('click', () => resetData());
        editModalBtns['submit'].addEventListener('click', async (event) => {
            const button = event.target;
            const formData = new FormData(editModalForm);
            const identifier = editModal.querySelector('.form > .header > .heading > h4 > strong > .entryIdentifier').textContent;
            let fetchedData = {};
            event.preventDefault();
            for (const [name, value] of formData.entries()) {
                fetchedData[name] = value.toString();
            }
            fetchedData['id'] = identifier;
            button.innerHTML =
                `
                <i class="fa-duotone fa-spinner-third fa-spin"></i>
                Updating...
            `;
            await fetch(`/personnel/table/${type}/edit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fetchedData)
            });
            editModalPrompts['success'].style.display = 'flex';
            setTimeout(async () => {
                await resetData();
                await closeModal();
                await setDashboardData('personnel', type);
                button.innerHTML = 'Submit changes';
                editModalPrompts['success'].style.display = 'none';
            }, 2500);
        });
        modal.style.display = "grid";
        editModal.style.display = "grid";
        editModal.setAttribute("data-type", "edit");
        checkForms(editModalForm, false);
        await setData();
        checkForms(editModalForm, false);
    }
    catch (err) {
        editModalPrompts['error'].style.display = 'flex';
        setTimeout(() => { editModalPrompts['error'].style.display = 'none'; throw err; }, 2500);
    }
};
export const openDeleteModal = async (type, modal, entry) => {
    let entryTitle;
    const deleteModal = modal.querySelector(`.${type} > .delete`);
    const deleteModalPrompts = {
        success: deleteModal.querySelector('div[data-type="success"]'),
        error: deleteModal.querySelector('div[data-type="error"]')
    };
    const deleteModalForm = deleteModal.querySelector('.container > form');
    const deleteModalBtns = {
        close: deleteModal.querySelector('.header > i'),
        return: deleteModalForm.querySelector('.actions > button[type="return"]'),
        submit: deleteModalForm.querySelector('.actions > button[type="submit"]')
    };
    const closeModal = async () => {
        modal.style.display = 'none';
        deleteModal.style.display = 'none';
    };
    try {
        switch (type) {
            case 'inventory':
                entryTitle = entry.querySelector('.title > h2').textContent;
                break;
            case 'students':
                entryTitle = `${entry.querySelector('.name > h2').textContent} ${entry.querySelector('.studentNumber > h2').textContent}`;
                break;
            case 'users':
                entryTitle = `${entry.querySelector('.fullName > h2').textContent} (${entry.querySelector('.username > h2').textContent})`;
                break;
        }
        deleteModalBtns['close'].addEventListener('click', () => closeModal());
        deleteModalBtns['return'].addEventListener('click', (event) => {
            event.preventDefault();
            closeModal();
        });
        deleteModalBtns['submit'].addEventListener('click', async (event) => {
            const button = event.target;
            const entryIdentifier = entry.getAttribute('data-identifier');
            event.preventDefault();
            button.innerHTML =
                `
                <i class="fa-duotone fa-spinner-third fa-spin"></i>
                Deleting...
            `;
            await fetch(`/personnel/table/${type}/delete/${entryIdentifier}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            deleteModalPrompts['success'].style.display = 'flex';
            setTimeout(async () => {
                await closeModal();
                await setDashboardData('personnel', type);
                button.innerHTML = "Yes, I'm sure!";
                deleteModalPrompts['success'].style.display = 'none';
            }, 2500);
        });
        modal.style.display = "grid";
        deleteModal.querySelector('.container > form > .info > .entryTitle').textContent = entryTitle;
        deleteModal.style.display = "grid";
    }
    catch (err) {
        deleteModalPrompts['error'].style.display = 'flex';
        setTimeout(() => { deleteModalPrompts['error'].style.display = 'none'; throw err; }, 2500);
    }
};
