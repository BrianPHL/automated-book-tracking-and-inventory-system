import * as utils from "../../utils/client.utils.js"

document.addEventListener('DOMContentLoaded', () => {

    const bodyElement: HTMLBodyElement = document.querySelector('body')

    utils.setPreferredTheme((cbData) => {

        !cbData.savedTheme
        ? (

            !cbData.preferredTheme
            ? utils.setLightTheme()
            : utils.setDarkTheme()

        )
        : (

            cbData.savedTheme === 'light'
            ? utils.setLightTheme()
            : utils.setDarkTheme()

        )
        
    })

    const navTabs = () => {

        const nav: HTMLElement = bodyElement.querySelector('header > nav')
        const navTabs: NodeListOf<HTMLDivElement> = nav.querySelectorAll('.tabs > div')
        const mainTabs: NodeListOf<HTMLElement> = bodyElement.querySelectorAll('main')

        navTabs.forEach(tab => {

            tab.addEventListener('click', (event: MouseEvent) => {
                
                const navTab = event.target as HTMLElement
                const activeTab: HTMLDivElement = bodyElement.querySelector(`main[data-tab="${ navTab.classList[0] }"]`)
                
                navTabs.forEach(tab => { tab.classList.remove('active') })
                mainTabs.forEach(tab => { 
                
                    tab.setAttribute('data-active', 'false')
                    tab.style.display = 'none' 
                
                })
                
                navTab.classList.add('active')
                activeTab.style.display = 'grid'
                activeTab.setAttribute('data-active', 'true')
    
                utils.setDashboardData('personnel', navTab.classList[0])
    
            })
    
        })

    }
    navTabs()

    const navActions = () => {

        const nav: HTMLElement = bodyElement.querySelector('header > nav')
        const navActions: HTMLDivElement = nav.querySelector('.actions')
        const navRefresh: HTMLButtonElement = navActions.querySelector('.refresh')
        const navthemeSwitch: HTMLButtonElement = navActions.querySelector('.themeSwitch')
        const navLogout: HTMLButtonElement = navActions.querySelector('.logout')

        navRefresh.addEventListener('click', (event) => {

            const activeTab = bodyElement.querySelector('main[data-active="true"]')

            event.preventDefault()

            navRefresh.innerHTML =
            `
                <i class="fa-regular fa-redo fa-spin-pulse"></i>
                <h2>Refreshing...</h2>
            `

            setTimeout(async () => {

                navRefresh.innerHTML =
                `
                    <i class="fa-regular fa-redo"></i>
                    <h2>Refresh</h2>
                `

                utils.setDashboardData('personnel', activeTab.getAttribute('data-tab'))
                
            }, 2500)

        })

        navthemeSwitch.addEventListener('click', (event) => {

            event.preventDefault()
    
            const currentTheme = localStorage.getItem('theme')
    
            currentTheme === 'light'
            ? utils.setDarkTheme()
            : utils.setLightTheme()
    
        })
        
        navLogout.addEventListener('click', (event) => {
    
            event.preventDefault()
    
            navLogout.innerHTML =
            `
                <i class="fa-duotone fa-loader fa-spin-pulse"></i>
                <h2>Logging out...</h2>
            `
    
            setTimeout(async () => {
    
                try {
    
                    const response: Response = await fetch('/personnel/logout', {
            
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    
                    })

                    navLogout.innerHTML =
                    `
                        <i class="fa-regular fa-right-from-bracket"></i>
                        <h2>Logout</h2>
                    `
    
                    !response.ok
                    ? window.location.href = `/error?${ await response.text() }`
                    : window.location.href = '/'
    
                } catch(err) {
                
                    const { name, message } = err
    
                    window.location.href = `/error?${ (await utils.errorPrompt({title: name, body: message})).toString() }`
    
                }
    
            }, 2500)
    
        })

    }
    navActions()

    utils.setDashboardData('personnel')

})