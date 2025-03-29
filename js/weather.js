document.addEventListener('DOMContentLoaded', function() {
    const weatherContainer = document.querySelector('.weather-widget-container');
    if (!weatherContainer) return;

    // --- Données Météo Simulées pour le 05/04/2025 (9h-13h) - Basées sur l'image fournie ---
    // À remplacer par un appel API réel
    const weatherData = [
        {
            city: "Castres (Départ)",
            iconClass: "fas fa-sun sun", // Icône Soleil
            temp: "14°C", // Température estimée pour 9h-13h
            description: "Ensoleillé",
            windSpeed: "16 km/h (raf. 45 km/h)", // Vent moyen corrigé et rafales
            windDirection: "NO" // Nord-Ouest (basé sur flèche image)
        },
        {
            city: "Les Cammazes (Point Chaud)",
            iconClass: "fas fa-sun sun", // Icône Soleil
            temp: "12°C", // Légèrement plus frais en altitude
            description: "Ensoleillé",
            windSpeed: "16 km/h (raf. 45 km/h)", // Vent moyen corrigé et rafales
            windDirection: "NO"
        },
        {
            city: "Castelnaudary (Arrivée)",
            iconClass: "fas fa-sun sun", // Icône Soleil
            temp: "15°C", // Légèrement plus chaud à l'arrivée
            description: "Ensoleillé",
            windSpeed: "16 km/h (raf. 45 km/h)", // Vent moyen corrigé et rafales
            windDirection: "NO"
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