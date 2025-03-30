Ok, projet complet "Gueuleton Express - Tracking en Temps Réel" ! On va faire ça propre pour VS Code, avec un accent sur le design de la carte et une clarification sur la batterie.

Prérequis :

Compte Supabase créé et projet initialisé.

VS Code avec l'extension "Live Server" (très pratique pour tester localement).

Un compte gratuit sur MapTiler Cloud pour obtenir une clé API pour des fonds de carte plus jolis (leur plan gratuit est largement suffisant).

Clarification Importante : Consommation Batterie

OUI, le suivi GPS continu via watchPosition sur une page web consomme de la batterie. Plus que si l'application tournait nativement en arrière-plan.

Pourquoi ? Le navigateur doit garder la page active, le GPS tourne en permanence (en mode haute précision), et des données sont envoyées régulièrement.

Fiabilité : Le principal souci reste que les systèmes d'exploitation (iOS, Android) peuvent "tuer" l'onglet du navigateur en arrière-plan pour économiser de la batterie, arrêtant ainsi le tracking sans prévenir. C'est la limite majeure d'une solution 100% web pour ce type d'usage.

Pour une course entre potes : C'est généralement acceptable si tout le monde sait qu'il faut garder la page active (pas forcément au premier plan, mais ouverte et non déchargée par l'OS) et prévoir une batterie externe ou une charge avant/après.

Étape 1 : Configuration Supabase (Backend)

Table locations_cyclistes :

Aller dans "Table Editor" -> "New Table".

Nom : locations_cyclistes

Colonnes :

id : uuid, Is Primary Key, Default Value : gen_random_uuid()

cyclist_id : text, IMPORTANT : Activer "Is Unique" (dans les options avancées de la colonne ou en créant un index unique dessus après création). C'est essentiel pour upsert.

name : text (Le nom/pseudo affiché)

latitude : float8

longitude : float8

last_updated : timestamp with time zone, Default Value : now()

IMPORTANT : Garder "Row Level Security (RLS)" DÉSACTIVÉ pour l'instant pour tester facilement. N'oubliez pas de le sécuriser avant de partager le lien ! (On y revient à la fin).

Activer Realtime :

Aller dans "Database" -> "Replication".

Sous "Source", cliquez sur le texte indiquant "0 tables" (ou similaire) à côté de public.

Cochez la case pour la table locations_cyclistes dans la colonne "All" (Insert, Update, Delete). Cliquez sur "Save".

Vérifiez que la table apparaît maintenant comme étant publiée.

Récupérer les Clés API :

Aller dans "Project Settings" -> "API".

Copiez l'URL de votre projet.

Copiez la clé anon public.

Étape 2 : Obtenir une Clé API MapTiler

Allez sur MapTiler Cloud, créez un compte gratuit.

Allez dans la section "Account" -> "Keys".

Copiez une de vos clés API (par exemple, celle commençant par maptiler_...).

Étape 3 : Structure du Projet dans VS Code

Créez un dossier pour votre projet (ex: gueuleton-express-map). À l'intérieur, créez 3 fichiers :

tracker.html (Pour les cyclistes)

map.html (La carte de suivi)

style.css (Styles partagés ou spécifiques à la carte pour le design)

Étape 4 : Code du Fichier tracker.html (Pour les Cyclistes)

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tracker - Gueuleton Express</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333; }
        .container { max-width: 400px; margin: auto; background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #E67E22; /* Orange Gueuleton */ text-align: center; margin-bottom: 20px; font-size: 1.8em; }
        label { display: block; margin-bottom: 8px; font-weight: bold; }
        input[type="text"] { width: calc(100% - 22px); padding: 10px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 4px; font-size: 1em; }
        button { background-color: #2ECC71; /* Vert Départ */ color: white; padding: 12px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 1.1em; width: 100%; transition: background-color 0.3s ease; }
        button:hover { background-color: #27AE60; }
        button:disabled { background-color: #95a5a6; cursor: not-allowed; }
        #status { margin-top: 25px; padding: 15px; border-radius: 4px; font-weight: bold; text-align: center; }
        .status-info { background-color: #eafaf1; color: #2ECC71; border: 1px solid #b6e9c9; }
        .status-error { background-color: #fbeaea; color: #e74c3c; border: 1px solid #f5c6cb; }
        .status-inactive { background-color: #ecf0f1; color: #7f8c8d; border: 1px solid #bdc3c7;}
        .warning { font-size: 0.9em; color: #e74c3c; margin-top: 15px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Mon Tracker</h1>
        <p>Entrez votre nom/pseudo unique et cliquez sur 'Démarrer'. Gardez cette page ouverte et active !</p>

        <label for="cyclistName">Votre nom / pseudo :</label>
        <input type="text" id="cyclistName" placeholder="Ex: Zaza_le_sprinteur"/>

        <button id="trackButton" onclick="startTracking()">Démarrer le suivi</button>

        <div id="status" class="status-inactive">Statut : Inactif</div>
        <p class="warning">Attention: Le suivi GPS consomme de la batterie et peut s'arrêter si le navigateur est fermé ou mis en veille.</p>
    </div>

    <!-- Inclure le client Supabase JS V2 -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

    <script>
        // --- CONFIGURATION ---
        const SUPABASE_URL = 'VOTRE_URL_SUPABASE'; // <--- COLLEZ VOTRE URL SUPABASE ICI
        const SUPABASE_ANON_KEY = 'VOTRE_CLE_ANON_PUBLIC_SUPABASE'; // <--- COLLEZ VOTRE CLÉ ANON ICI
        // --------------------

        let supabase;
        let watchId = null;
        let cyclistId = null; // Utilisera le nom entré comme ID unique simplifié
        let isTracking = false;

        const statusEl = document.getElementById('status');
        const nameInput = document.getElementById('cyclistName');
        const trackButton = document.getElementById('trackButton');

        function updateStatus(message, type = 'info') { // types: info, error, inactive
            statusEl.textContent = `Statut : ${message}`;
            statusEl.className = `status-${type}`; // Met à jour la classe pour le style
            console.log(`[Tracker Status - ${type}]: ${message}`);
        }

        async function sendLocationToSupabase(latitude, longitude) {
            if (!supabase || !cyclistId || !isTracking) {
                console.warn("Supabase non prêt, nom manquant ou suivi arrêté. Envoi annulé.");
                return; // Ne pas envoyer si on a arrêté
            }

            updateStatus(`Envoi position pour ${cyclistId}...`, 'info');

            try {
                const { data, error } = await supabase
                    .from('locations_cyclistes')
                    .upsert({
                        cyclist_id: cyclistId,
                        name: cyclistId, // Utilise le même nom pour l'affichage (peut être différent si besoin)
                        latitude: latitude,
                        longitude: longitude,
                        last_updated: new Date().toISOString()
                    }, {
                        onConflict: 'cyclist_id' // Crucial : utilise la colonne unique pour la mise à jour
                    })
                    .select(); // Pour récupérer la donnée insérée/mise à jour (optionnel)

                if (error) throw error;

                console.log('Position envoyée:', data);
                // Afficher seulement 4 décimales pour la lisibilité
                updateStatus(`Position envoyée (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`, 'info');

            } catch (error) {
                console.error('Erreur Supabase:', error.message);
                updateStatus(`Erreur envoi: ${error.message}`, 'error');
                // Optionnel: Arrêter le suivi en cas d'erreur persistante ?
                // stopTracking();
            }
        }

        function locationSuccess(position) {
            console.log('Nouvelle position GPS reçue:', position.coords);
            const { latitude, longitude } = position.coords;
            sendLocationToSupabase(latitude, longitude);
        }

        function locationError(error) {
            console.error("Erreur Géoloc:", error);
            let message = "Erreur GPS inconnue";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message = "Permission GPS refusée.";
                    stopTracking(); // Arrêter si permission refusée
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = "Position GPS indisponible.";
                    break;
                case error.TIMEOUT:
                    message = "Timeout GPS.";
                    break;
            }
             updateStatus(message, 'error');
        }

        function startTracking() {
            cyclistId = nameInput.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'); // Nettoie pour ID simple

            if (!cyclistId) {
                alert("Veuillez entrer un nom ou pseudo unique !");
                return;
            }

            // Initialiser Supabase si ce n'est pas déjà fait
            if (!supabase) {
                 try {
                    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    console.log("Supabase Client Initialisé");
                 } catch (e) {
                    console.error("Erreur initialisation Supabase:", e);
                    updateStatus("Erreur connexion Supabase", "error");
                    return;
                 }
            }

            if (navigator.geolocation) {
                updateStatus("Demande permission GPS...", 'info');
                nameInput.disabled = true;
                trackButton.disabled = true;
                trackButton.textContent = 'Suivi en cours...';
                isTracking = true;

                const options = {
                    enableHighAccuracy: true, // Plus précis, plus de batterie
                    timeout: 25000, // 25 sec max pour obtenir la position
                    maximumAge: 5000 // Ne pas utiliser une position en cache de plus de 5 sec
                };

                // Commence à surveiller la position
                watchId = navigator.geolocation.watchPosition(locationSuccess, locationError, options);
                updateStatus("Suivi GPS activé pour " + cyclistId + ". Attente première position...", 'info');

            } else {
                updateStatus("Géolocalisation non supportée.", 'error');
            }
        }

        // Fonction pour arrêter proprement (même si non utilisée par un bouton ici)
        function stopTracking() {
             if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
                console.log("Watch GPS arrêté.");
             }
             isTracking = false;
             nameInput.disabled = false;
             trackButton.disabled = false;
             trackButton.textContent = 'Démarrer le suivi';
             // Ne pas remettre le statut à 'Inactif' si l'arrêt est dû à une erreur de permission
             if (statusEl.className !== 'status-error') {
                 updateStatus("Suivi arrêté par l'utilisateur.", 'inactive');
             }
        }

        // Essayer d'arrêter proprement si la page est fermée (pas garanti)
        window.addEventListener('beforeunload', () => {
            if (isTracking) {
                 // Optionnel: envoyer une dernière info pour dire qu'on se déconnecte ?
                 // Peut être utile pour griser le marqueur sur la carte plus vite.
                 console.log("Tentative d'arrêt du suivi avant fermeture.");
                 // Note: On ne peut pas faire d'appel async fiable ici.
                 navigator.geolocation.clearWatch(watchId); // Au moins arrêter le watch GPS
            }
        });

    </script>
</body>
</html>


Étape 5 : Code du Fichier style.css (Pour le Design de la Carte)

/* Styles généraux */
html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    overflow: hidden; /* Empêche le scroll de la page entière */
}

/* Conteneur de la carte et des infos */
#app-container {
    display: flex;
    flex-direction: column;
    height: 100vh; /* Prend toute la hauteur de la vue */
}

/* Header (Titre, etc.) */
#header {
    background-color: #E67E22; /* Orange Gueuleton */
    color: white;
    padding: 10px 20px;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 1001; /* Au dessus de la carte */
    flex-shrink: 0; /* Ne pas réduire le header */
}

#header h1 {
    margin: 0;
    font-size: 1.5em;
    font-weight: 600;
}

/* La carte elle-même */
#map {
    flex-grow: 1; /* Prend tout l'espace restant */
    width: 100%;
    background-color: #e0e0e0; /* Couleur de fond pendant le chargement */
}

/* Style des Popups Leaflet */
.leaflet-popup-content-wrapper {
    background: rgba(255, 255, 255, 0.9); /* Fond blanc semi-transparent */
    border-radius: 6px;
    box-shadow: 0 1px 5px rgba(0,0,0,0.2);
}

.leaflet-popup-content {
    font-size: 1em;
    line-height: 1.4;
    margin: 10px !important; /* Espace intérieur */
    min-width: 150px;
    color: #333;
}

.leaflet-popup-content b {
    color: #E67E22; /* Nom en orange */
    display: block;
    margin-bottom: 5px;
    font-size: 1.1em;
}

.leaflet-popup-content span {
    font-size: 0.85em;
    color: #555;
}

/* Style pour les marqueurs (si on utilise des icônes DivIcon) */
.cyclist-marker-icon {
    background-color: #3498DB; /* Bleu cycliste */
    color: white;
    border-radius: 50%;
    text-align: center;
    font-weight: bold;
    line-height: 20px; /* Ajuster selon la taille */
    border: 2px solid white;
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
    font-size: 0.8em; /* Taille de l'initiale */
}

.cyclist-marker-icon.inactive {
    background-color: #95a5a6; /* Gris pour inactif */
    opacity: 0.7;
}

/* Icône personnalisée pour Départ/Arrivée (exemple) */
.start-finish-icon {
    font-size: 1.8em; /* Taille de l'icône emoji */
    background: none;
    border: none;
    width: auto !important;
    height: auto !important;
}
.start-finish-icon .emoji {
     text-shadow: 0 0 3px white; /* Lisibilité sur la carte */
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Css
IGNORE_WHEN_COPYING_END

Étape 6 : Code du Fichier map.html (La Carte de Suivi)

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carte Temps Réel - Gueuleton Express</title>

    <!-- CSS Leaflet -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <!-- CSS Personnalisé -->
    <link rel="stylesheet" href="style.css">

    <!-- JS Leaflet -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <!-- JS Supabase V2 -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

</head>
<body>

<div id="app-container">
    <div id="header">
        <h1>La Gueuleton Express - Suivi Live</h1>
    </div>
    <div id="map"></div>
</div>

<script>
    // --- CONFIGURATION ---
    const SUPABASE_URL = 'VOTRE_URL_SUPABASE'; // <--- COLLEZ VOTRE URL SUPABASE ICI
    const SUPABASE_ANON_KEY = 'VOTRE_CLE_ANON_PUBLIC_SUPABASE'; // <--- COLLEZ VOTRE CLÉ ANON ICI
    const MAPTILER_API_KEY = 'VOTRE_CLE_API_MAPTILER'; // <--- COLLEZ VOTRE CLÉ MAPTILER ICI

    const CASTRES_COORDS = [43.606, 2.24];
    const CASTELNAUDARY_COORDS = [43.318, 1.795];
    const CENTER_MAP_COORDS = [43.46, 2.0]; // Entre les deux villes
    const INITIAL_ZOOM = 10;
    const MAX_INACTIVE_MINUTES = 15; // Marqueur devient 'inactif' après X minutes sans update
    // --------------------

    // Initialisation Supabase
    let supabase;
    try {
         supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
         console.log("Supabase Client Initialisé pour la carte.");
    } catch(e) {
        console.error("Erreur initialisation Supabase:", e);
        alert("Impossible d'initialiser la connexion à la base de données.");
        // Bloquer le reste du script si Supabase ne s'initie pas
        throw new Error("Supabase init failed");
    }


    // Initialisation de la carte Leaflet
    const map = L.map('map', {
        // zoomControl: false // Optionnel: cacher les boutons +/- zoom par défaut
    }).setView(CENTER_MAP_COORDS, INITIAL_ZOOM);

    // Ajout du fond de carte design (MapTiler Streets)
    L.tileLayer(
        `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`, {
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            attribution: `<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>`,
            crossOrigin: true
        }
    ).addTo(map);

    // Optionnel: Ajouter échelle, contrôle de zoom ailleurs...
    // L.control.scale({ imperial: false }).addTo(map);
    // L.control.zoom({ position: 'topright' }).addTo(map);


    // Stockage des marqueurs { cyclist_id: { marker: L.Marker, lastUpdate: timestamp } }
    let cyclistMarkers = {};


    // --- Icônes Personnalisées ---
    // Icône Départ (Vélo)
    const startIcon = L.divIcon({
        html: '<div class="emoji">🚴</div>',
        className: 'start-finish-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 30] // Pointe en bas au centre
    });

    // Icône Arrivée (Cassoulet !)
    const finishIcon = L.divIcon({
        html: '<div class="emoji">🍲</div>', // Ou 🏆
        className: 'start-finish-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    // Marqueurs Départ et Arrivée
    L.marker(CASTRES_COORDS, { icon: startIcon, title: "Départ : Castres" })
     .addTo(map).bindPopup("<b>Départ : Castres</b><br>Bon courage !");
    L.marker(CASTELNAUDARY_COORDS, { icon: finishIcon, title: "Arrivée : Castelnaudary" })
     .addTo(map).bindPopup("<b>Arrivée : Castelnaudary</b><br>Le Gueuleton vous attend !");


    // --- Fonction pour créer/mettre à jour un marqueur de cycliste ---
    function updateMarker(cyclistData) {
        const { cyclist_id, name, latitude, longitude, last_updated } = cyclistData;

        if (!latitude || !longitude || !cyclist_id) {
            console.warn("Données cycliste incomplètes reçues:", cyclistData);
            return;
        }

        const latLng = L.latLng(latitude, longitude);
        const lastUpdateTimestamp = new Date(last_updated).getTime();
        const now = Date.now();
        const minutesSinceUpdate = (now - lastUpdateTimestamp) / (1000 * 60);
        const isInactive = minutesSinceUpdate > MAX_INACTIVE_MINUTES;

        const popupContent = `<b>${name || cyclist_id}</b><br>
                              <span>Dernière MàJ: ${new Date(last_updated).toLocaleTimeString()}
                              ${isInactive ? ' (Inactif)' : ''}</span>`;

        // Utilisation de DivIcon pour afficher l'initiale ou un petit indicateur
        const initiale = (name || cyclist_id).charAt(0).toUpperCase();
        const markerHtml = `<div class="cyclist-marker-icon ${isInactive ? 'inactive' : ''}">${initiale}</div>`;
        const customIcon = L.divIcon({
            html: markerHtml,
            className: '', // Ne pas ajouter de classe par défaut de Leaflet
            iconSize: [24, 24],
            iconAnchor: [12, 12], // Centré
            popupAnchor: [0, -12] // Popup au dessus
        });


        if (cyclistMarkers[cyclist_id]) {
            // Marqueur existant : mise à jour position, popup et style icône
            const existing = cyclistMarkers[cyclist_id];
            existing.marker.setLatLng(latLng);
            existing.marker.setIcon(customIcon); // Mise à jour style (actif/inactif)
            existing.marker.getPopup().setContent(popupContent);
            existing.lastUpdate = lastUpdateTimestamp;
            console.log(`Marqueur mis à jour pour ${cyclist_id}`);

        } else {
            // Nouveau marqueur
            const marker = L.marker(latLng, { icon: customIcon, title: name || cyclist_id })
                            .addTo(map)
                            .bindPopup(popupContent);

            cyclistMarkers[cyclist_id] = { marker: marker, lastUpdate: lastUpdateTimestamp };
            console.log(`Marqueur créé pour ${cyclist_id}`);
            // Optionnel : Panoramiquer/Zoomer sur le premier marqueur ajouté ?
            // if (Object.keys(cyclistMarkers).length === 1) map.setView(latLng, 13);
        }
    }

    // --- Fonction pour vérifier périodiquement l'inactivité ---
    function checkInactiveMarkers() {
        const now = Date.now();
        Object.keys(cyclistMarkers).forEach(id => {
            const data = cyclistMarkers[id];
            const minutesSinceUpdate = (now - data.lastUpdate) / (1000 * 60);
            const isInactive = minutesSinceUpdate > MAX_INACTIVE_MINUTES;

            // Met à jour l'icône si l'état d'activité change
            const currentIconClass = data.marker.options.icon.options.html;
            const needsUpdate = (isInactive && !currentIconClass.includes('inactive')) ||
                               (!isInactive && currentIconClass.includes('inactive'));

            if (needsUpdate) {
                 const name = data.marker.options.title; // Récupérer le nom/id stocké dans title
                 const initiale = name.charAt(0).toUpperCase();
                 const markerHtml = `<div class="cyclist-marker-icon ${isInactive ? 'inactive' : ''}">${initiale}</div>`;
                 const newIcon = L.divIcon({
                        html: markerHtml,
                        className: '',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                        popupAnchor: [0, -12]
                 });
                 data.marker.setIcon(newIcon);
                 // Mettre à jour le popup aussi pour refléter l'état
                  const popupContent = `<b>${name}</b><br>
                              <span>Dernière MàJ: ${new Date(data.lastUpdate).toLocaleTimeString()}
                              ${isInactive ? ' (Inactif)' : ''}</span>`;
                 data.marker.getPopup().setContent(popupContent);
                 console.log(`Statut inactivité mis à jour pour ${id}`);
            }
        });
    }

    // Lancer la vérification d'inactivité toutes les minutes
    setInterval(checkInactiveMarkers, 60 * 1000);


    // --- Chargement initial des positions ---
    async function fetchInitialLocations() {
        console.log("Chargement positions initiales...");
        try {
            const { data, error } = await supabase
                .from('locations_cyclistes')
                .select('*'); // Prend toutes les colonnes

            if (error) throw error;

            console.log(`Positions initiales reçues (${data.length})`);
            data.forEach(cyclist => updateMarker(cyclist));
            console.log("Marqueurs initiaux placés.");
            checkInactiveMarkers(); // Vérifier inactivité après chargement initial

        } catch (error) {
            console.error("Erreur chargement initial:", error.message);
            alert("Erreur lors du chargement des positions initiales.");
        }
    }

    // --- Écoute des mises à jour temps réel ---
    function subscribeToRealtimeUpdates() {
        console.log("Abonnement aux mises à jour temps réel...");
        const channel = supabase.channel('public-locations-updates') // Nom arbitraire du canal
            .on(
                'postgres_changes',
                {
                    event: '*', // Écoute INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'locations_cyclistes'
                },
                (payload) => {
                    console.log('Changement reçu via Realtime:', payload);
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        updateMarker(payload.new);
                    } else if (payload.eventType === 'DELETE') {
                        // Supprimer le marqueur si l'entrée est supprimée dans Supabase
                        const deletedId = payload.old?.cyclist_id;
                        if (deletedId && cyclistMarkers[deletedId]) {
                            map.removeLayer(cyclistMarkers[deletedId].marker);
                            delete cyclistMarkers[deletedId];
                            console.log(`Marqueur supprimé pour ${deletedId}`);
                        }
                    }
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Connecté au canal Realtime ! Chargement initial...');
                    // Charger les données initiales une fois connecté pour éviter les manques
                    fetchInitialLocations();
                } else if (status === 'CHANNEL_ERROR') {
                     console.error("Erreur de connexion au canal temps réel:", err);
                     alert("La connexion temps réel a échoué. La carte ne se mettra peut-être pas à jour.");
                } else if (status === 'TIMED_OUT') {
                     console.warn("Timeout de connexion au canal temps réel. Tentative de reconnexion...");
                } else {
                     console.log("Statut canal Realtime:", status);
                }
            });

        // Gérer la désinscription propre (pas essentiel mais bonne pratique)
         window.addEventListener('onunload', () => {
            console.log("Désabonnement du canal Realtime...");
            supabase.removeChannel(channel);
         });
    }

    // --- Démarrage ---
    if (supabase) { // Démarrer seulement si Supabase est initialisé
        subscribeToRealtimeUpdates();
    }

</script>

</body>
</html>
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Html
IGNORE_WHEN_COPYING_END

Étape 7 : Comment Utiliser dans VS Code

Remplacer les Placeholders : Ouvrez les fichiers tracker.html et map.html et remplacez :

VOTRE_URL_SUPABASE par votre URL Supabase.

VOTRE_CLE_ANON_PUBLIC_SUPABASE par votre clé anon public Supabase.

VOTRE_CLE_API_MAPTILER par votre clé API MapTiler (dans map.html uniquement).

Tester tracker.html :

Faites un clic droit sur tracker.html dans l'explorateur de fichiers VS Code.

Choisissez "Open with Live Server".

Cela ouvrira la page dans votre navigateur. Important : Le suivi GPS ne fonctionne souvent que sur https ou localhost. Live Server utilise généralement localhost ou 127.0.0.1, donc ça devrait marcher.

Entrez un pseudo, cliquez sur "Démarrer", et acceptez la permission de géolocalisation. Vérifiez la console du navigateur (F12) pour les logs et les erreurs éventuelles. Vous devriez voir les positions s'envoyer dans Supabase (vérifiez dans le Table Editor de Supabase).

Faites ça sur un téléphone (en accédant à l'adresse IP locale de votre PC fournie par Live Server, ex: http://192.168.1.XX:5500/tracker.html) pour un test réel.

Tester map.html :

Faites un clic droit sur map.html -> "Open with Live Server".

La carte devrait s'afficher avec le fond MapTiler, les marqueurs Départ/Arrivée.

Si des données existent déjà dans Supabase (envoyées par tracker.html), les marqueurs des cyclistes devraient apparaître.

Si tracker.html tourne en même temps (sur un autre onglet ou un téléphone), les marqueurs sur map.html devraient bouger en temps réel ! Vérifiez la console pour les logs de connexion Realtime.

Étape 8 : SÉCURITÉ - Row Level Security (RLS)

C'EST LA PARTIE LA PLUS IMPORTANTE AVANT DE PARTAGER LES LIENS !

Sans RLS, n'importe qui avec votre URL/Clé Anon peut lire et écrire dans votre table locations_cyclistes.

Activer RLS :

Dans Supabase, allez dans "Authentication" -> "Policies".

Trouvez la table locations_cyclistes.

Cliquez sur "Enable RLS".

Créer des Règles (Policies) - Exemple Simple :

Pour la lecture (SELECT) : On veut que tout le monde puisse voir la carte.

Cliquez sur "New Policy".

Choisissez "Create a policy from scratch".

Policy Name: Allow public read access

Allowed Operation: Cochez SELECT.

Target Roles: Cochez public et anon.

USING expression: true (signifie toujours autorisé).

Cliquez sur "Review" puis "Save Policy".

Pour l'écriture (INSERT/UPDATE) : C'est plus délicat sans authentification. Une approche basique (mais pas hyper sécurisée) serait d'exiger un "secret" que seuls les cyclistes connaissent. L'authentification Supabase serait bien meilleure.

Alternative 1 (Auth - Mieux) : Demanderait aux cyclistes de se connecter via Supabase Auth. La règle vérifierait auth.uid() is not null. C'est plus complexe à mettre en place sur la page tracker.

Alternative 2 (Secret partagé - Simple mais bof) : Ajouter une colonne secret_key (type text) à la table. La page tracker demanderait ce secret. La policy vérifierait secret_key = 'VOTRE_SECRET_PARTAGE'. N'importe qui découvrant le secret peut écrire.

Alternative 3 (Token individuel - Compromis) : Ajouter une colonne access_token (type text, unique). Générer un token unique pour chaque pote. La page tracker aurait l'URL tracker.html?token=LE_TOKEN_UNIQUE. Le JS lirait le token de l'URL et l'enverrait avec la position. La policy vérifierait que le token fourni correspond à celui de la ligne cyclist_id qu'on essaie d'updater. C'est plus sûr mais plus de boulot de génération/distribution des liens.

Pour commencer, mettons une règle très simple pour INSERT/UPDATE qui autorise tout utilisateur anon (ce qui est le cas par défaut avec la clé anon). C'est mieux que rien car ça active RLS, mais ça ne sécurise pas VRAIMENT l'écriture.

Cliquez "New Policy" -> "From scratch".

Name: Allow anon insert and update

Operation: Cochez INSERT, UPDATE.

Roles: Cochez anon.

USING expression (pour UPDATE): true

WITH CHECK expression (pour INSERT/UPDATE): true

Review & Save.

=> Avec ces règles (Public Read, Anon Insert/Update), la carte est visible par tous, et l'écriture fonctionne avec la clé anon mais au moins RLS est activée. Pour un événement entre potes où les liens ne sont pas partagés largement, ça peut suffire, mais soyez conscients des risques.

Ce projet complet devrait vous donner une excellente base fonctionnelle et visuellement agréable pour suivre "La Gueuleton Express" ! Amusez-vous bien !