// Script pour configurer Supabase pour le projet Gueuleton Express
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const SUPABASE_URL = 'https://jmqvuvsjlisguoyznhxe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcXZ1dnNqbGlzZ3VveXpuaHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMTI0NDUsImV4cCI6MjA1ODg4ODQ0NX0.OcI8XIRrWgi3isajiL1cQRgqaVXf30fFNuIAd9U9CkU';

// Initialiser le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupSupabase() {
  try {
    console.log('Début de la configuration Supabase...');

    // 1. Créer la table locations_cyclistes
    console.log('Création de la table locations_cyclistes...');
    const { error: createTableError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'locations_cyclistes',
      table_definition: `
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        cyclist_id text UNIQUE,
        name text,
        latitude float8,
        longitude float8,
        last_updated timestamp with time zone DEFAULT now()
      `
    });

    if (createTableError) {
      console.error('Erreur lors de la création de la table:', createTableError);
      // Si la fonction RPC n'existe pas, essayons avec une requête SQL directe
      console.log('Tentative avec une requête SQL directe...');
      const { error: sqlError } = await supabase.from('locations_cyclistes').select('count(*)').limit(1);
      
      if (sqlError && sqlError.code === '42P01') { // relation "locations_cyclistes" does not exist
        console.log('La table n\'existe pas, veuillez la créer manuellement via l\'interface Supabase.');
        console.log('Instructions:');
        console.log('1. Allez sur https://app.supabase.com/project/jmqvuvsjlisguoyznhxe/editor');
        console.log('2. Cliquez sur "New Table"');
        console.log('3. Nom de la table: locations_cyclistes');
        console.log('4. Colonnes:');
        console.log('   - id: uuid, Primary Key, Default: gen_random_uuid()');
        console.log('   - cyclist_id: text, Unique');
        console.log('   - name: text');
        console.log('   - latitude: float8');
        console.log('   - longitude: float8');
        console.log('   - last_updated: timestamp with time zone, Default: now()');
        console.log('5. Désactivez Row Level Security (RLS) pour l\'instant');
      } else if (sqlError) {
        console.error('Erreur lors de la vérification de la table:', sqlError);
      } else {
        console.log('La table locations_cyclistes existe déjà.');
      }
    } else {
      console.log('Table locations_cyclistes créée avec succès.');
    }

    // 2. Activer Realtime pour la table
    console.log('Activation de Realtime pour la table locations_cyclistes...');
    console.log('Note: Cette opération doit être effectuée manuellement via l\'interface Supabase:');
    console.log('1. Allez sur https://app.supabase.com/project/jmqvuvsjlisguoyznhxe/database/replication');
    console.log('2. Sous "Source", cliquez sur le texte indiquant "0 tables" à côté de public');
    console.log('3. Cochez la case pour la table locations_cyclistes dans la colonne "All"');
    console.log('4. Cliquez sur "Save"');

    console.log('Configuration Supabase terminée.');
    console.log('Vous pouvez maintenant utiliser tracker.html et map.html pour suivre les cyclistes en temps réel.');

  } catch (error) {
    console.error('Erreur lors de la configuration Supabase:', error);
  }
}

// Exécuter la configuration
setupSupabase();