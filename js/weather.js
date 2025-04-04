document.addEventListener('DOMContentLoaded', function() {
    const weatherContainer = document.querySelector('.weather-widget-container');
    if (!weatherContainer) return;

    const eventDate = "2025-04-05"; // Date de l'événement

    const locations = [
        { name: "Castres (Départ)", lat: 43.60, lon: 2.24 },
        { name: "Les Cammazes (Point Chaud)", lat: 43.42, lon: 2.04 },
        { name: "Castelnaudary (Arrivée)", lat: 43.32, lon: 1.95 }
    ];

    // --- Fonctions Utilitaires ---

    // Traduction WMO Code -> Emoji, Description et Classe CSS
    function getWeatherInfo(wmoCode) {
        const info = {
            emoji: "❓", // Emoji par défaut
            cssClass: "question", // Classe CSS pour le style
            description: "Inconnu",
            cardClass: "" // Classe pour la carte entière
        };
        if (wmoCode === 0) {
            info.emoji = "☀️";
            info.cssClass = "sun";
            info.description = "Ensoleillé";
            info.cardClass = "sunny";
        }
        else if (wmoCode >= 1 && wmoCode <= 3) {
            info.emoji = "🌤️";
            info.cssClass = "cloud-sun";
            info.description = "Partiellement nuageux";
            info.cardClass = "cloudy";
        }
        else if (wmoCode === 45 || wmoCode === 48) {
            info.emoji = "🌫️";
            info.cssClass = "smog";
            info.description = "Brouillard";
            info.cardClass = "foggy";
        }
        else if ((wmoCode >= 51 && wmoCode <= 57) || (wmoCode >= 61 && wmoCode <= 67) || (wmoCode >= 80 && wmoCode <= 82)) {
            info.emoji = "🌧️";
            info.cssClass = "cloud-showers-heavy";
            info.description = "Pluie/Averses";
            info.cardClass = "rainy";
        }
        else if (wmoCode >= 71 && wmoCode <= 77) {
            info.emoji = "❄️";
            info.cssClass = "snowflake";
            info.description = "Neige";
            info.cardClass = "snowy";
        }
        else if (wmoCode >= 95 && wmoCode <= 99) {
            info.emoji = "⚡";
            info.cssClass = "bolt";
            info.description = "Orage";
            info.cardClass = "stormy";
        }
        else if (wmoCode >= 58 && wmoCode <= 60) {
            info.emoji = "🌦️";
            info.cssClass = "cloud-rain";
            info.description = "Bruine";
            info.cardClass = "rainy";
        }
        // Ajouter d'autres codes si nécessaire
        return info;
    }

    // Traduction Direction Vent (degrés -> cardinal)
    function getWindDirection(degrees) {
        const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    }

    // --- Fonction pour récupérer et afficher la météo ---

    async function fetchAndDisplayWeather(location) {
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=temperature_2m,weathercode,windspeed_10m,winddirection_10m,windgusts_10m&start_date=${eventDate}&end_date=${eventDate}&timezone=Europe/Paris`;

        const card = document.createElement('div');
        card.className = 'weather-card loading'; // Ajout classe loading
        weatherContainer.appendChild(card);

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Erreur API: ${response.statusText}`);
            }
            const data = await response.json();

            // Trouver les index pour 9h à 13h
            const startIndex = data.hourly.time.findIndex(t => t.endsWith("T09:00"));
            const endIndex = data.hourly.time.findIndex(t => t.endsWith("T13:00"));

            if (startIndex === -1 || endIndex === -1) {
                throw new Error("Données horaires non trouvées pour la plage 9h-13h.");
            }

            // Calculer les moyennes/max pour la période 9h-13h
            const relevantHours = endIndex - startIndex + 1;
            let avgTemp = 0;
            let avgWindSpeed = 0;
            let maxGust = 0;
            let windDirections = [];
            let weatherCodes = {}; // Pour trouver le code météo le plus fréquent

            for (let i = startIndex; i <= endIndex; i++) {
                avgTemp += data.hourly.temperature_2m[i];
                avgWindSpeed += data.hourly.windspeed_10m[i];
                maxGust = Math.max(maxGust, data.hourly.windgusts_10m[i]);
                windDirections.push(data.hourly.winddirection_10m[i]);

                const code = data.hourly.weathercode[i];
                weatherCodes[code] = (weatherCodes[code] || 0) + 1;
            }

            avgTemp /= relevantHours;
            avgWindSpeed /= relevantHours;

            // Trouver le code météo dominant
            const dominantCode = Object.keys(weatherCodes).reduce((a, b) => weatherCodes[a] > weatherCodes[b] ? a : b);
            const weatherInfo = getWeatherInfo(parseInt(dominantCode));

            // Calculer la direction moyenne du vent (plus complexe, on prend juste celle de midi pour simplifier)
            const midIndex = startIndex + Math.floor(relevantHours / 2);
            const avgWindDirectionDegrees = data.hourly.winddirection_10m[midIndex];
            const avgWindDirectionCardinal = getWindDirection(avgWindDirectionDegrees);

            // Mettre à jour la carte avec le nouveau design
            card.classList.remove('loading');
            if (weatherInfo.cardClass) {
                card.classList.add(weatherInfo.cardClass);
            }

            card.innerHTML = `
                <div class="weather-card-header">
                    <h3>${location.name}</h3>
                </div>
                <div class="weather-card-body">
                    <div class="weather-icon ${weatherInfo.cssClass}">
                        <span class="weather-emoji">${weatherInfo.emoji}</span>
                    </div>
                    <div class="weather-info">
                        <p class="weather-temp">${avgTemp.toFixed(1)}°C</p>
                        <p class="weather-description">${weatherInfo.description}</p>
                    </div>
                    <div class="weather-details">
                        <div class="weather-detail-item">
                            <div class="weather-detail-icon">
                                <i class="fas fa-wind"></i>
                            </div>
                            <div class="weather-detail-text">
                                Vent: ${avgWindSpeed.toFixed(0)} km/h (${avgWindDirectionCardinal})
                            </div>
                        </div>
                        <div class="weather-detail-item">
                            <div class="weather-detail-icon">
                                <i class="fas fa-tachometer-alt"></i>
                            </div>
                            <div class="weather-detail-text">
                                Rafales: ${maxGust.toFixed(0)} km/h
                            </div>
                        </div>
                        <div class="weather-detail-item">
                            <div class="weather-detail-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="weather-detail-text">
                                Prévision: 9h-13h
                            </div>
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error(`Erreur météo pour ${location.name}:`, error);
            card.classList.remove('loading');
            card.classList.add('error'); // Ajout classe error
            card.innerHTML = `<div class="weather-card-header"><h3>${location.name}</h3></div><div class="weather-card-body"><p>Erreur de chargement des données.</p></div>`;
        }
    }

    // --- Initialisation ---
    weatherContainer.innerHTML = ''; // Vider le conteneur initial
    locations.forEach(location => {
        fetchAndDisplayWeather(location);
    });

});