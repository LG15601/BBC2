// Animations et fonctionnalités supplémentaires pour le podium
document.addEventListener('DOMContentLoaded', function() {
    // Styles pour les confettis
    const confettiStyle = document.createElement('style');
    confettiStyle.textContent = `
        .confetti-piece {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: #ffd700;
            border-radius: 2px;
            top: 0;
            opacity: 0;
            pointer-events: none;
        }
    `;
    document.head.appendChild(confettiStyle);
    
    // Fonction pour ajouter un effet de maillot flottant au-dessus du podium
    function addFloatingJersey(jerseyType) {
        const podiumContainer = document.querySelector('.podium-container');
        
        // Supprimer les maillots flottants existants
        const existingJerseys = document.querySelectorAll('.floating-jersey');
        existingJerseys.forEach(jersey => jersey.remove());
        
        // Créer un nouveau maillot flottant
        const floatingJersey = document.createElement('div');
        floatingJersey.className = `maillot maillot-${jerseyType} floating-jersey`;
        floatingJersey.style.position = 'absolute';
        floatingJersey.style.top = '-40px';
        floatingJersey.style.left = '50%';
        floatingJersey.style.transform = 'translateX(-50%)';
        floatingJersey.style.width = '50px';
        floatingJersey.style.height = '50px';
        floatingJersey.style.animation = 'float 3s ease-in-out infinite';
        floatingJersey.style.zIndex = '10';
        floatingJersey.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
        
        podiumContainer.appendChild(floatingJersey);
    }
    
    // Fonction pour ajouter un effet de célébration au podium
    function celebratePodium() {
        // Ajouter une classe pour l'animation de célébration
        const podiumStage = document.querySelector('.podium-stage');
        podiumStage.classList.add('celebrating');
        
        // Ajouter un effet de pulsation aux blocs du podium
        const podiumBlocks = document.querySelectorAll('.podium-block');
        podiumBlocks.forEach(block => {
            block.style.animation = 'pulse 2s infinite';
        });
        
        // Ajouter un effet de rotation aux avatars
        const avatars = document.querySelectorAll('.podium-avatar');
        avatars.forEach(avatar => {
            avatar.style.transition = 'transform 0.5s ease';
            avatar.addEventListener('mouseover', function() {
                this.style.transform = 'scale(1.2) rotate(10deg)';
            });
            avatar.addEventListener('mouseout', function() {
                this.style.transform = 'scale(1) rotate(0)';
            });
        });
    }
    
    // Fonction pour ajouter un effet sonore lors de l'affichage du podium
    function playVictorySound() {
        const audio = new Audio('sounds/victory.mp3');
        audio.volume = 0.5;
        
        // Essayer de jouer le son (peut échouer si le navigateur bloque l'autoplay)
        try {
            audio.play().catch(e => console.log('Autoplay prevented:', e));
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    }
    
    // Écouter les événements de clic sur le bouton du podium
    const podiumButton = document.getElementById('show-podium-btn');
    if (podiumButton) {
        podiumButton.addEventListener('click', function() {
            // Ajouter un maillot flottant correspondant au type actif
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                const jerseyType = activeTab.getAttribute('data-jersey');
                addFloatingJersey(jerseyType);
            }
            
            // Ajouter des effets de célébration après un délai
            setTimeout(() => {
                celebratePodium();
                // Essayer de jouer un son de victoire
                playVictorySound();
            }, 1500);
        });
    }
    
    // Ajouter des interactions aux éléments du podium
    document.addEventListener('click', function(e) {
        // Vérifier si on a cliqué sur un avatar du podium
        if (e.target.classList.contains('podium-avatar')) {
            // Ajouter une animation de rotation
            e.target.style.animation = 'jersey-spin 1s ease-in-out';
            
            // Réinitialiser l'animation après qu'elle soit terminée
            setTimeout(() => {
                e.target.style.animation = '';
            }, 1000);
        }
    });
});
