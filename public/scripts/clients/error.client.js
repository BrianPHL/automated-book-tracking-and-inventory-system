import { getURLData } from "../utils/client.utils.js";
document.addEventListener('DOMContentLoaded', async () => {
    const bodyElement = document.querySelector('body');
    const modal = bodyElement.querySelector('.modal');
    const modalError = modal.querySelector('.error');
    const modalErrorTitle = modalError.querySelector('.title');
    const modalErrorStatus = modalError.querySelector('.status');
    const modalErrorBody = modalError.querySelector('.body');
    modalErrorTitle.textContent = await getURLData(window.location.search, 'title');
    modalErrorStatus.textContent = `Code: ${await getURLData(window.location.search, 'status')}`;
    modalErrorBody.textContent = await getURLData(window.location.search, 'body');
});
