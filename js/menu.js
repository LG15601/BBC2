// Script pour gérer le menu interactif
document.addEventListener('DOMContentLoaded', function() {
    // Sélectionner les éléments du menu
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const menuContainer = document.querySelector('.menu-container');
    const menuItems = document.querySelectorAll('.menu-item a');

    // Fonction pour basculer le menu mobile
    function toggleMobileMenu() {
        mobileMenuToggle.classList.toggle('active');
        menuContainer.classList.toggle('active');

        // Empêcher le défilement du body quand le menu est ouvert
        document.body.classList.toggle('menu-open');
    }

    // Ajouter un écouteur d'événement au bouton hamburger
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Fermer le menu quand on clique sur un lien
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth < 768 && menuContainer.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    // Fonction pour mettre à jour l'élément actif du menu lors du défilement
    function updateActiveMenuItem() {
        // Obtenir la position de défilement actuelle
        const scrollPosition = window.scrollY;

        // Obtenir toutes les sections avec des ID
        const sections = document.querySelectorAll('section[id]');

        // Parcourir les sections pour trouver celle qui est actuellement visible
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; // Ajuster pour la hauteur du menu
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Supprimer la classe active de tous les éléments du menu
                document.querySelectorAll('.menu-item a').forEach(item => {
                    item.classList.remove('active');
                });

                // Ajouter la classe active à l'élément du menu correspondant
                const activeMenuItem = document.querySelector(`.menu-item a[href="#${sectionId}"]`);
                if (activeMenuItem) {
                    activeMenuItem.classList.add('active');

                    // S'assurer que l'élément actif est visible dans le menu déroulant sur desktop
                    if (window.innerWidth >= 768) {
                        const menuContainer = document.querySelector('.menu-container');
                        if (menuContainer) {
                            const menuItemRect = activeMenuItem.getBoundingClientRect();
                            const containerRect = menuContainer.getBoundingClientRect();

                            // Vérifier si l'élément est partiellement hors de la vue
                            if (menuItemRect.left < containerRect.left || menuItemRect.right > containerRect.right) {
                                // Calculer la position de défilement pour centrer l'élément
                                const scrollLeft = menuItemRect.left - containerRect.left -
                                                  (containerRect.width / 2) + (menuItemRect.width / 2);

                                // Faire défiler le conteneur
                                menuContainer.scrollLeft += scrollLeft;
                            }
                        }
                    }
                }
            }
        });
    }

    // Ajouter un écouteur d'événement pour le défilement
    window.addEventListener('scroll', updateActiveMenuItem);

    // Appeler la fonction une fois au chargement de la page
    updateActiveMenuItem();

    // Ajouter un effet de défilement fluide pour les liens du menu
    document.querySelectorAll('.menu-item a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Ne pas appliquer aux liens externes
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70, // Ajuster pour la hauteur du menu
                        behavior: 'smooth'
                    });

                    // Mettre à jour l'URL sans recharger la page
                    history.pushState(null, null, targetId);
                }
            }
        });
    });

    // Gérer le redimensionnement de la fenêtre
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            // Réinitialiser les classes sur desktop
            if (mobileMenuToggle.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                menuContainer.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        }
    });

    // Ajouter une classe au body pour empêcher le défilement quand le menu est ouvert
    const style = document.createElement('style');
    style.textContent = `
        body.menu-open {
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
});
