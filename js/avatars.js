document.addEventListener('DOMContentLoaded', function() {
    const avatarsContainer = document.querySelector('#avatars .avatars');
    avatarsContainer.innerHTML = '';

    const participants = [
        { name: "Ludo G", profil: "Baroudeur", punchline: "Son combat contre la gravité est plus épique que Paris-Roubaix sous la flotte." },
        { name: "Clem E", profil: "Baroudeur", punchline: "Un Sanglier qui met le grand plateau même pour aller chercher le pain. En côte." },
        { name: "Aimé E", profil: "Vieux Briscard", punchline: "Connaît tous les raccourcis... surtout ceux qui mènent à la buvette du village." },
        { name: "Guillaume M", profil: "Epicurien", punchline: "Le Ken du Cantal: Blond, yeux bleus, pédale comme s'il était dans une pub pour gel douche." },
        { name: "Alex B", profil: "Sprinter", punchline: "Son meilleur sprint ? Celui pour attraper la dernière crêpe au sarrasin." },
        { name: "Charly T", profil: "Epicurien", punchline: "Roule au chouchen, attaque au caramel au beurre salé. Mollement." },
        { name: "Michel G", profil: "Vieux Briscard", punchline: "La dernière fois qu'il est monté sur un vélo, Festina était encore une équipe sérieuse." },
        { name: "Pierre V", profil: "Vieux Briscard", punchline: "Son KOM le plus impressionnant ? Celui de la falaise du coin, sans vélo." },
        { name: "Younes Y", profil: "Epicurien", punchline: "L'ex-artiste du foot amateur qui dribblait les tacles dans les prés du Cantal." },
        { name: "Romain M", profil: "Epicurien", punchline: "Son point fort en vélo ? La transition rapide pour aller courir (et moins souffrir)." },
        { name: "Morgan P", profil: "Baroudeur", punchline: "Son excuse favorite quand il est dans le dur : 'Désolé, j'ai ma séance de course à pied demain matin'." },
        { name: "Guillaume A", profil: "Grimpeur", punchline: "Passe plus de temps à charger sa montre GPS qu'à rouler." },
        { name: "Patrick L", profil: "Vieux Briscard", punchline: "'C'était mieux avant', surtout quand il est à l'agonie dans la roue d'un jeune." },
        { name: "Olivier G", profil: "Baroudeur", punchline: "Cherche toujours le panneau 'Machu Picchu' au sommet des monts de Lacaune." },
        { name: "Manu", profil: "Baroudeur", punchline: "Son sprint est lancé 'Boudu Con !'" }
    ];

    const profilColors = {
        "Baroudeur": "#009639", // Vert
        "Compagne": "#009639", // Vert
        "Vieux Briscard": "#8a8a8a", // Gris
        "Epicurien": "#FFCE00", // Jaune
        "Sprinter": "#E40521", // Rouge
        "Grimpeur": "#E40521", // Rouge à pois
        "Puncheur": "#0077C8", // Bleu
        "Rouleur": "#009639", // Vert
        "Triathlète": "#0077C8", // Bleu
        "Tri-Polyvalent": "#009639", // Vert
        "G. Martin du Chrono": "#FFCE00" // Jaune
    };

    participants.forEach(participant => {
        const avatarCard = document.createElement('div');
        avatarCard.className = 'avatar-card';
        avatarCard.style.backgroundColor = "#ffffff"; // Set background color to white
        const profileClass = participant.profil.toLowerCase().replace(' ', '-');

        avatarCard.innerHTML = `
            <h3>${participant.name}</h3>
            <p style="color: #333333; font-weight: bold;">${participant.punchline}</p>
            <span class="avatar-type ${profileClass}">${participant.profil}</span>
        `;

        avatarsContainer.appendChild(avatarCard);
    });
});
