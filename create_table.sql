-- Création de la table locations_cyclistes
CREATE TABLE public.locations_cyclistes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cyclist_id text UNIQUE,
    name text,
    latitude float8,
    longitude float8,
    last_updated timestamp with time zone DEFAULT now()
);

-- Désactiver RLS (Row Level Security)
ALTER TABLE public.locations_cyclistes DISABLE ROW LEVEL SECURITY;

-- Commentaire pour expliquer l'utilisation de la table
COMMENT ON TABLE public.locations_cyclistes IS 'Table pour stocker les positions GPS des cyclistes en temps réel';