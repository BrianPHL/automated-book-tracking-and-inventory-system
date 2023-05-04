document.addEventListener('DOMContentLoaded', () => {

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
    
})