document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([43.596, 2.297], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&amp;copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var gpx = 'course.gpx'; // URL to your GPX file
    new L.GPX(gpx, {
        async: true,
        polyline_options: {
            color: '#0077C8',
            weight: 5,
            opacity: 0.8
        },
        marker_options: {
            startIconUrl: null,
            endIconUrl: null,
            shadowUrl: null,
            wptIconUrls: null
        }
    }).on('loaded', function(e) {
        map.fitBounds(e.target.getBounds());
        
        // Ajouter des marqueurs pour le départ et l'arrivée
        var startPoint = e.target.get_start_point();
        var endPoint = e.target.get_end_point();
        
        if (startPoint) {
            L.marker(startPoint, {
                icon: L.divIcon({
                    className: 'start-marker',
                    html: '<div style="background-color: green; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            }).addTo(map).bindPopup('Départ');
        }
        
        if (endPoint) {
            L.marker(endPoint, {
                icon: L.divIcon({
                    className: 'end-marker',
                    html: '<div style="background-color: red; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            }).addTo(map).bindPopup('Arrivée');
        }
    }).addTo(map);
});
