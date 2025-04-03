# Gueuleton Express 2025 - Système de Suivi GPS en Temps Réel

Site déployé sur GitHub Pages : [https://lg15601.github.io/BBC2/](https://lg15601.github.io/BBC2/)

Ce projet permet de suivre en temps réel les cyclistes participant à l'événement "La Gueuleton Express" entre Castres et Castelnaudary. Il utilise Supabase comme backend pour stocker les positions GPS et une interface web pour afficher les positions sur une carte.

## Fonctionnalités

- **Tracker GPS** : Page web pour les cyclistes qui envoie leur position GPS en temps réel
- **Carte de suivi** : Affichage des positions des cyclistes sur une carte en temps réel
- **Parcours complet** : Visualisation du parcours GPX avec profil d'élévation
- **Interface responsive** : Fonctionne sur mobile et desktop

## Prérequis

- Un compte Supabase (gratuit) avec un projet configuré
- Un compte MapTiler (gratuit) pour les fonds de carte
- Un serveur web pour héberger les fichiers HTML/CSS/JS

## Structure du Projet

- `tracker.html` : Page pour les cyclistes qui envoie leur position GPS
- `map.html` : Page simple pour afficher la carte avec les positions des cyclistes
- `geo.html` : Page complète avec parcours GPX et profil d'élévation
- `style.css` : Styles pour les pages web
- `js/GPX/` : Fichiers GPX du parcours
- `elevation_profile.png` : Image du profil d'élévation

## Configuration

### 1. Configuration Supabase

1. Créer un compte sur [Supabase](https://supabase.com/) et un nouveau projet
2. Créer une table `locations_cyclistes` avec les colonnes suivantes :
   - `id` : uuid, Primary Key, Default: gen_random_uuid()
   - `cyclist_id` : text, Unique
   - `name` : text
   - `latitude` : float8
   - `longitude` : float8
   - `last_updated` : timestamp with time zone, Default: now()
3. Activer Realtime pour cette table :
   - Aller dans "Database" -> "Replication"
   - Sous "Source", cliquer sur le texte à côté de "public"
   - Cocher la case pour la table `locations_cyclistes` dans la colonne "All"
   - Cliquer sur "Save"

### 2. Sécurité (Row Level Security)

Pour sécuriser l'accès aux données, activer Row Level Security (RLS) :

1. Aller dans "Authentication" -> "Policies"
2. Trouver la table `locations_cyclistes`
3. Cliquer sur "Enable RLS"
4. Créer une politique pour la lecture (SELECT) :
   - Policy Name: Allow public read access
   - Allowed Operation: SELECT
   - Target Roles: public, anon
   - USING expression: true
5. Créer une politique pour l'écriture (INSERT/UPDATE) :
   - Policy Name: Allow anon insert and update
   - Operation: INSERT, UPDATE
   - Roles: anon
   - USING expression: true
   - WITH CHECK expression: true

## Utilisation

### Pour les Organisateurs

1. Héberger les fichiers sur un serveur web
2. Partager le lien vers `tracker.html` avec les cyclistes
3. Utiliser `geo.html` pour suivre les cyclistes en temps réel et voir le parcours complet

### Pour les Cyclistes

1. Ouvrir `tracker.html` sur leur smartphone
2. Entrer un nom/pseudo unique
3. Cliquer sur "Démarrer le suivi"
4. Garder la page ouverte et active pendant la course
5. S'assurer que le GPS du téléphone est activé

### Pour les Spectateurs

1. Ouvrir `map.html` pour voir uniquement les positions des cyclistes
2. Ouvrir `geo.html` pour voir les positions des cyclistes et le parcours complet

## Remarques Importantes

- **Consommation de batterie** : Le suivi GPS continu via une page web consomme beaucoup de batterie. Les cyclistes devraient prévoir une batterie externe.
- **Fiabilité** : Les systèmes d'exploitation mobiles peuvent "tuer" l'onglet du navigateur en arrière-plan pour économiser de la batterie, arrêtant ainsi le tracking. Il est important de garder la page active.
- **Connexion Internet** : Une connexion Internet est nécessaire pour envoyer et recevoir les positions GPS.

## Personnalisation

- Modifier les coordonnées de départ et d'arrivée dans les fichiers HTML
- Changer les couleurs et styles dans `style.css`
- Remplacer le fichier GPX par le parcours officiel
- Mettre à jour l'image du profil d'élévation

## Crédits

- [Leaflet](https://leafletjs.com/) pour la cartographie
- [Supabase](https://supabase.com/) pour le backend en temps réel
- [MapTiler](https://www.maptiler.com/) pour les fonds de carte