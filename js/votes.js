// Système de votes pour les maillots
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les compteurs de votes (simulés)
    const votes = {
        pois: {
            'Pierre D': 18,
            'Julien M': 12,
            'Guillaume A': 9,
            'Clément E': 7,
            'Autre': 3
        },
        red: {
            'Clément E': 15,
            'Charles T': 13,
            'Aimé E': 10,
            'Mathieu B': 8,
            'Autre': 4
        },
        yellow: {
            'Guillaume M': 21,
            'Yann L': 14,
            'Ludovic G': 11,
            'Thomas R': 9,
            'Autre': 2
        },
        white: {
            'Jean-Claude B': 12,
            'Bernard T': 10,
            'Michel D': 8,
            'Philippe G': 7,
            'Autre': 3
        }
    };

    // Fonction pour afficher les résultats
    function displayResults(type) {
        const resultsContainer = document.querySelector(`#${type}-results .results-container`);
        resultsContainer.innerHTML = '';

        // Calculer le total des votes
        let totalVotes = 0;
        for (const candidate in votes[type]) {
            totalVotes += votes[type][candidate];
        }

        // Afficher les résultats pour chaque candidat
        for (const candidate in votes[type]) {
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
        }

        // Afficher le conteneur de résultats
        document.getElementById(`${type}-results`).style.display = 'block';
    }

    // Gérer les clics sur les boutons de vote
    const voteButtons = document.querySelectorAll('.vote-btn');
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const selectedOption = document.querySelector(`input[name="${type}"]:checked`);

            if (selectedOption) {
                let value = selectedOption.value;

                // Si "Autre" est sélectionné, utiliser la valeur du champ texte
                if (value === 'Autre') {
                    const otherInput = document.getElementById(`${type}-other`);
                    if (otherInput.value.trim() !== '') {
                        value = otherInput.value.trim();

                        // Ajouter le nouveau candidat s'il n'existe pas
                        if (!votes[type][value]) {
                            votes[type][value] = 0;
                        }
                    }
                }

                // Incrémenter le compteur de votes
                votes[type][value]++;

                // Afficher les résultats
                displayResults(type);

                // Désactiver le bouton temporairement
                this.disabled = true;
                this.textContent = 'Voté !';
                setTimeout(() => {
                    this.disabled = false;
                    this.textContent = 'Voter';
                }, 2000);
            } else {
                alert('Veuillez sélectionner une option avant de voter.');
            }
        });
    });

    // Afficher/masquer le champ "Autre"
    const otherRadios = document.querySelectorAll('input[value="Autre"]');
    otherRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const type = this.name;
            const otherInput = document.getElementById(`${type}-other`);

            if (this.checked) {
                otherInput.style.display = 'block';
                otherInput.focus();
            } else {
                otherInput.style.display = 'none';
            }
        });
    });

    // Afficher les résultats initiaux pour chaque type de maillot
    displayResults('pois');
    displayResults('red');
    displayResults('yellow');
    displayResults('white');
});
