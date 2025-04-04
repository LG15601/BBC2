// Système de votes interactif pour les maillots - style Tour de France
document.addEventListener('DOMContentLoaded', function() {
    // Gérer l'ouverture/fermeture du système de vote
    const voteToggleBtn = document.getElementById('vote-toggle-btn');
    const votingAppContainer = document.getElementById('voting-app-container');

    if (voteToggleBtn && votingAppContainer) {
        voteToggleBtn.addEventListener('click', function() {
            // Basculer l'affichage du conteneur de vote
            const isVisible = votingAppContainer.classList.contains('show');

            if (isVisible) {
                votingAppContainer.classList.remove('show');
                // Changer le texte du bouton
                this.innerHTML = '<i class="fas fa-vote-yea"></i> Ouvrir le système de vote';

                // Faire défiler jusqu'au bouton
                this.scrollIntoView({ behavior: 'smooth' });
            } else {
                votingAppContainer.classList.add('show');
                // Changer le texte du bouton
                this.innerHTML = '<i class="fas fa-times-circle"></i> Fermer le système de vote';

                // Faire défiler jusqu'au début du conteneur
                votingAppContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    // Initialiser les compteurs de votes (tous à 0)
    const votes = {
        pois: {
            'Ludo G': 0,
            'Clem E': 0,
            'Guillaume M': 0,
            'Alex B': 0,
            'Charly T': 0,
            'Pierre V': 0,
            'Romain M': 0,
            'Morgan P': 0,
            'Guillaume A': 0,
            'Olivier G': 0,
            'Manu': 0,
            'Aimé E': 0,
            'Michel G': 0,
            'Patrick L': 0,
            'Autre': 0
        },
        red: {
            'Ludo G': 0,
            'Clem E': 0,
            'Guillaume M': 0,
            'Alex B': 0,
            'Charly T': 0,
            'Pierre V': 0,
            'Romain M': 0,
            'Morgan P': 0,
            'Guillaume A': 0,
            'Olivier G': 0,
            'Manu': 0,
            'Aimé E': 0,
            'Michel G': 0,
            'Patrick L': 0,
            'Autre': 0
        },
        yellow: {
            'Ludo G': 0,
            'Clem E': 0,
            'Guillaume M': 0,
            'Alex B': 0,
            'Charly T': 0,
            'Pierre V': 0,
            'Romain M': 0,
            'Morgan P': 0,
            'Guillaume A': 0,
            'Olivier G': 0,
            'Manu': 0,
            'Aimé E': 0,
            'Michel G': 0,
            'Patrick L': 0,
            'Autre': 0
        },
        white: {
            'Aimé E': 0,
            'Michel G': 0,
            'Patrick L': 0,
            'Autre': 0
        }
    };

    // Stocker les votes dans le localStorage pour les conserver
    // Vérifier si des votes existent déjà dans le localStorage
    const savedVotes = localStorage.getItem('gueuleton_votes');
    if (savedVotes) {
        try {
            const parsedVotes = JSON.parse(savedVotes);
            // Fusionner les votes sauvegardés avec la structure initiale
            for (const jerseyType in votes) {
                if (parsedVotes[jerseyType]) {
                    for (const candidate in votes[jerseyType]) {
                        if (parsedVotes[jerseyType][candidate] !== undefined) {
                            votes[jerseyType][candidate] = parsedVotes[jerseyType][candidate];
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Erreur lors de la récupération des votes:', e);
        }
    }

    // Informations sur les candidats (pour le podium)
    const candidateInfo = {
        'Ludo G': { nickname: 'Le Gourmet', avatar: 'images/avatars/avatar1.jpg' },
        'Clem E': { nickname: 'Le Sanglier', avatar: 'images/avatars/avatar2.jpg' },
        'Guillaume M': { nickname: "L'Épicurien", avatar: 'images/avatars/avatar3.jpg' },
        'Alex B': { nickname: 'Le Baroudeur', avatar: 'images/avatars/avatar4.jpg' },
        'Charly T': { nickname: 'Le Panache', avatar: 'images/avatars/avatar5.jpg' },
        'Pierre V': { nickname: 'La Chèvre', avatar: 'images/avatars/avatar6.jpg' },
        'Romain M': { nickname: 'Le Sprinter', avatar: 'images/avatars/avatar7.jpg' },
        'Morgan P': { nickname: 'Le Grimpeur', avatar: 'images/avatars/avatar8.jpg' },
        'Guillaume A': { nickname: "L'Aigle", avatar: 'images/avatars/avatar9.jpg' },
        'Olivier G': { nickname: 'Le Rouleur', avatar: 'images/avatars/avatar10.jpg' },
        'Manu': { nickname: 'Le Tacticien', avatar: 'images/avatars/avatar11.jpg' },
        'Aimé E': { nickname: 'Le Vieux Briscard', avatar: 'images/avatars/avatar12.jpg' },
        'Michel G': { nickname: 'Le Doyen', avatar: 'images/avatars/avatar13.jpg' },
        'Patrick L': { nickname: 'Le Vétéran', avatar: 'images/avatars/avatar14.jpg' }
    };

    // Maillot actif par défaut
    let activeJersey = 'pois';

    // Gérer les onglets de maillots
    const tabButtons = document.querySelectorAll('.tab-btn');
    const votingCards = document.querySelectorAll('.voting-card');

    tabButtons.forEach(tab => {
        tab.addEventListener('click', function() {
            const jersey = this.getAttribute('data-jersey');

            // Mettre à jour l'onglet actif
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Afficher la carte de vote correspondante
            votingCards.forEach(card => {
                if (card.classList.contains(`${jersey}-card`)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });

            // Mettre à jour le maillot actif
            activeJersey = jersey;
        });
    });

    // Initialiser l'affichage (montrer seulement la première carte)
    votingCards.forEach(card => {
        if (!card.classList.contains('pois-card')) {
            card.style.display = 'none';
        }
    });

    // Fonction pour afficher les résultats
    function displayResults(type) {
        const resultsContainer = document.querySelector(`#${type}-results .results-container`);
        resultsContainer.innerHTML = '';

        // Calculer le total des votes
        let totalVotes = 0;
        for (const candidate in votes[type]) {
            totalVotes += votes[type][candidate];
        }

        // Trier les candidats par nombre de votes (du plus au moins)
        const sortedCandidates = Object.keys(votes[type]).sort((a, b) => votes[type][b] - votes[type][a]);

        // Afficher les résultats pour chaque candidat
        sortedCandidates.forEach(candidate => {
            const percentage = Math.round((votes[type][candidate] / totalVotes) * 100);

            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <div class="result-label">
                    <span class="result-name">${candidate}</span>
                    <span class="result-percentage">${percentage}%</span>
                </div>
                <div class="result-bar-container">
                    <div class="result-bar ${type}" style="width: ${percentage}%"></div>
                </div>
                <div class="result-count">${votes[type][candidate]} votes</div>
            `;

            resultsContainer.appendChild(resultItem);
        });

        // Afficher le conteneur de résultats
        document.getElementById(`${type}-results`).style.display = 'block';
    }

    // Gérer les clics sur les boutons de vote
    const voteButtons = document.querySelectorAll('.vote-btn');
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const selectElement = document.getElementById(`${type}-select`);

            if (selectElement && selectElement.value) {
                let value = selectElement.value;

                // Si "Autre" est sélectionné, utiliser la valeur du champ texte
                if (value === 'Autre') {
                    const otherInput = document.getElementById(`${type}-other`);
                    if (otherInput.value.trim() !== '') {
                        value = otherInput.value.trim();

                        // Ajouter le nouveau candidat s'il n'existe pas
                        if (!votes[type][value]) {
                            votes[type][value] = 0;
                        }
                    } else {
                        alert('Veuillez préciser votre candidat.');
                        return;
                    }
                }

                // Incrémenter le compteur de votes
                votes[type][value]++;

                // Sauvegarder les votes dans le localStorage
                saveVotes();

                // Afficher les résultats
                displayResults(type);

                // Ajouter une classe pour l'animation
                this.classList.add('voted');

                // Désactiver le bouton temporairement
                this.disabled = true;
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check-circle"></i> Voté !';

                // Réinitialiser le formulaire
                selectElement.selectedIndex = 0;
                document.getElementById(`${type}-other`).style.display = 'none';
                document.getElementById(`${type}-other`).value = '';

                setTimeout(() => {
                    this.disabled = false;
                    this.innerHTML = originalText;
                    this.classList.remove('voted');
                }, 2000);
            } else {
                alert('Veuillez sélectionner un candidat avant de voter.');
            }
        });
    });

    // Gérer les listes déroulantes et le champ "Autre"
    const jerseySelects = document.querySelectorAll('.candidate-select');
    jerseySelects.forEach(select => {
        select.addEventListener('change', function() {
            const type = this.name;
            const otherInput = document.getElementById(`${type}-other`);

            if (this.value === 'Autre') {
                otherInput.style.display = 'block';
                otherInput.focus();
            } else {
                otherInput.style.display = 'none';
            }
        });
    });

    // Fonction pour sauvegarder les votes dans le localStorage
    function saveVotes() {
        try {
            localStorage.setItem('gueuleton_votes', JSON.stringify(votes));
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des votes:', e);
        }
    }

    // Fonction pour réinitialiser tous les votes
    function resetVotes() {
        // Réinitialiser tous les compteurs à 0
        for (const jerseyType in votes) {
            for (const candidate in votes[jerseyType]) {
                votes[jerseyType][candidate] = 0;
            }
        }

        // Sauvegarder les votes réinitialisés
        saveVotes();

        // Mettre à jour l'affichage
        displayResults('pois');
        displayResults('red');
        displayResults('yellow');
        displayResults('white');

        // Masquer le podium s'il est affiché
        document.querySelector('.podium-container').style.display = 'none';

        // Afficher un message de confirmation
        alert('Tous les votes ont été réinitialisés avec succès.');
    }

    // Afficher les résultats initiaux pour chaque type de maillot
    displayResults('pois');
    displayResults('red');
    displayResults('yellow');
    displayResults('white');

    // Gérer le bouton de réinitialisation des votes
    const resetVotesBtn = document.getElementById('reset-votes-btn');
    if (resetVotesBtn) {
        resetVotesBtn.addEventListener('click', function() {
            // Demander confirmation avant de réinitialiser
            if (confirm('Attention ! Vous êtes sur le point de réinitialiser tous les votes. Cette action est irréversible. Voulez-vous continuer ?')) {
                resetVotes();
            }
        });
    }

    // Fonction pour obtenir les 3 premiers candidats pour un maillot donné
    function getTopThree(jerseyType) {
        // Trier les candidats par nombre de votes (du plus au moins)
        const sortedCandidates = Object.keys(votes[jerseyType])
            .filter(candidate => candidate !== 'Autre') // Exclure "Autre"
            .sort((a, b) => votes[jerseyType][b] - votes[jerseyType][a]);

        // Retourner les 3 premiers
        return sortedCandidates.slice(0, 3);
    }

    // Fonction pour afficher le podium
    function displayPodium(jerseyType) {
        const podiumContainer = document.querySelector('.podium-container');
        const topThree = getTopThree(jerseyType);

        // Définir les hauteurs des blocs du podium
        document.documentElement.style.setProperty('--podium-height', '120px');

        // Mettre à jour les avatars et noms
        if (topThree.length >= 1) {
            const firstPlace = document.getElementById('first-avatar');
            const firstName = document.getElementById('first-name');
            firstPlace.style.backgroundImage = `url('${candidateInfo[topThree[0]]?.avatar || 'images/avatars/default.jpg'}')`;
            firstName.textContent = `${topThree[0]} "${candidateInfo[topThree[0]]?.nickname || ''}"`;
        }

        if (topThree.length >= 2) {
            const secondPlace = document.getElementById('second-avatar');
            const secondName = document.getElementById('second-name');
            secondPlace.style.backgroundImage = `url('${candidateInfo[topThree[1]]?.avatar || 'images/avatars/default.jpg'}')`;
            secondName.textContent = `${topThree[1]} "${candidateInfo[topThree[1]]?.nickname || ''}"`;
        }

        if (topThree.length >= 3) {
            const thirdPlace = document.getElementById('third-avatar');
            const thirdName = document.getElementById('third-name');
            thirdPlace.style.backgroundImage = `url('${candidateInfo[topThree[2]]?.avatar || 'images/avatars/default.jpg'}')`;
            thirdName.textContent = `${topThree[2]} "${candidateInfo[topThree[2]]?.nickname || ''}"`;
        }

        // Afficher le podium avec animation
        podiumContainer.classList.add('show');
        podiumContainer.style.display = 'block';

        // Animer les blocs du podium après un court délai
        setTimeout(() => {
            document.getElementById('podium-first').querySelector('.podium-block').style.height = '120px';
            document.getElementById('podium-second').querySelector('.podium-block').style.height = '80px';
            document.getElementById('podium-third').querySelector('.podium-block').style.height = '50px';

            // Ajouter l'animation de rebond au gagnant
            document.getElementById('first-avatar').style.animation = 'winner-bounce 1s ease 1s';

            // Créer des confettis
            createConfetti();
        }, 500);
    }

    // Fonction pour créer des confettis
    function createConfetti() {
        const confettiContainer = document.getElementById('podium-confetti');
        confettiContainer.innerHTML = '';

        const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.opacity = Math.random() + 0.5;
            confetti.style.animation = `confetti-drop ${Math.random() * 3 + 2}s linear forwards`;
            confetti.style.animationDelay = Math.random() * 2 + 's';

            confettiContainer.appendChild(confetti);
        }
    }

    // Gérer le bouton pour afficher les résultats
    const showResultsBtn = document.getElementById('show-results-btn');
    if (showResultsBtn) {
        showResultsBtn.addEventListener('click', function() {
            // Afficher les résultats du maillot actif
            const resultsElement = document.getElementById(`${activeJersey}-results`);
            if (resultsElement) {
                resultsElement.style.display = resultsElement.style.display === 'block' ? 'none' : 'block';

                // Changer le texte du bouton
                this.innerHTML = resultsElement.style.display === 'block'
                    ? '<i class="fas fa-eye-slash"></i> Masquer les résultats'
                    : '<i class="fas fa-chart-bar"></i> Voir les résultats';
            }
        });
    }

    // Gérer le bouton pour afficher le podium
    const showPodiumBtn = document.getElementById('show-podium-btn');
    if (showPodiumBtn) {
        showPodiumBtn.addEventListener('click', function() {
            // Réinitialiser le podium
            const podiumBlocks = document.querySelectorAll('.podium-block');
            podiumBlocks.forEach(block => block.style.height = '0');

            // Afficher le podium pour le maillot actif
            displayPodium(activeJersey);

            // Changer le texte du bouton
            this.innerHTML = '<i class="fas fa-sync-alt"></i> Actualiser le podium';
        });
    }
});
