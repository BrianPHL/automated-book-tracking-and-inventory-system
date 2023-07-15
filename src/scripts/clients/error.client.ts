import * as utils from "../utils/client.utils.js"

document.addEventListener('DOMContentLoaded', async () => {

    const bodyElement: HTMLBodyElement = document.querySelector('body')
    const modal: HTMLDivElement = bodyElement.querySelector('.modal')
    const modalError: HTMLDivElement = modal.querySelector('.error')
    const modalErrorTitle: HTMLHeadingElement = modalError.querySelector('.title')
    const modalErrorStatus: HTMLHeadingElement = modalError.querySelector('.status')
    const modalErrorBody: HTMLHeadingElement = modalError.querySelector('.body')

    modalErrorTitle.textContent = await utils.getURLData(window.location.search, 'title')
    modalErrorStatus.textContent =`Code: ${await utils.getURLData(window.location.search, 'status')}`
    modalErrorBody.textContent = await utils.getURLData(window.location.search, 'body')

})