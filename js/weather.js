document.addEventListener('DOMContentLoaded', function() {
    const weatherContainer = document.querySelector('.weather-widget-container');
    if (!weatherContainer) return;

    // --- Données Météo Simulées pour le 05/04/2025 (9h-13h) ---
    // À remplacer par un appel API réel
    const weatherData = [
        {
            city: "Castres (Départ)",
            iconClass: "fas fa-cloud-sun cloud-sun", // Icône FontAwesome (nuage-soleil)
            temp: "12°C",
            description: "Partiellement nuageux",
            windSpeed: "15 km/h",
            windDirection: "NO" // Nord-Ouest
        },
        {
            city: "Les Cammazes (Point Chaud)",
            iconClass: "fas fa-cloud cloud", // Icône FontAwesome (nuage)
            temp: "10°C",
            description: "Nuageux",
            windSpeed: "20 km/h",
            windDirection: "O" // Ouest
        },
        {
            city: "Castelnaudary (Arrivée)",
            iconClass: "fas fa-sun sun", // Icône FontAwesome (soleil)
            temp: "14°C",
            description: "Ensoleillé",
            windSpeed: "10 km/h",
            windDirection: "SO" // Sud-Ouest
        }
    ];
    // --- Fin des données simulées ---

    weatherContainer.innerHTML = ''; // Vider le conteneur

    weatherData.forEach(data => {
        const card = document.createElement('div');
        card.className = 'weather-card';

        card.innerHTML = `
            <h3>${data.city}</h3>
            <div class="weather-icon ${data.iconClass.split(' ')[1]}">
                <i class="${data.iconClass}"></i>
            </div>
            <div class="weather-details">
                <p><strong>Temp:</strong> ${data.temp}</p>
                <p><strong>Météo:</strong> ${data.description}</p>
                <p><strong>Vent:</strong> ${data.windSpeed} (${data.windDirection}) <i class="fas fa-wind wind"></i></p>
            </div>
        `;
        weatherContainer.appendChild(card);
    });
});