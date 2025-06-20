-- La base de données est déjà créée sur Supabase

CREATE TABLE IF NOT EXISTS Cinema (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    ville VARCHAR(255) NOT NULL,
    login VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Film (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    duree INT NOT NULL,
    langue VARCHAR(50) NOT NULL,
    sous_titres BOOLEAN DEFAULT FALSE,
    realisateur VARCHAR(255) NOT NULL,
    acteurs_principaux TEXT NOT NULL,
    synopsis TEXT,
    age_minimum VARCHAR(10) NOT NULL,
    genres VARCHAR(255),
    poster VARCHAR(255) NOT NULL DEFAULT 'https://m.media-amazon.com/images/I/613ypTLZHsL._SY445_.jpg',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Programmation (
    id SERIAL PRIMARY KEY,
    filmid INT NOT NULL,
    cinemaid INT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    jour_1 VARCHAR(20) NOT NULL,
    jour_2 VARCHAR(20) NOT NULL,
    jour_3 VARCHAR(20) NOT NULL,
    heure_debut TIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filmid) REFERENCES Film(id) ON DELETE CASCADE,
    FOREIGN KEY (cinemaid) REFERENCES Cinema(id) ON DELETE CASCADE
);

INSERT INTO Cinema (nom, adresse, ville, login, mot_de_passe, email, created_at) VALUES
('Cinéma Lumière', '10 rue des Lilas', 'Paris', 'lumiere_admin', 'mdp123', 'contact@lumiere.fr', '2025-05-15 14:41:35'),
('Cinéma Étoile', '45 avenue du Soleil', 'Lyon', 'etoile_login', 'etoilepass', 'info@etoile.fr', '2025-05-15 14:41:35');

INSERT INTO Film (titre, duree, langue, sous_titres, realisateur, acteurs_principaux, synopsis, age_minimum, genres, poster, created_at) VALUES
('Inception', 148, 'Anglais', TRUE, 'Christopher Nolan', 'Leonardo DiCaprio, Joseph Gordon-Levitt', 'Un voleur expérimenté en extraction de rêves est engagé pour implanter une idée dans l''esprit d''un PDG.', '12+', 'Science-fiction, Thriller', 'https://m.media-amazon.com/images/I/613ypTLZHsL._SY445_.jpg', '2025-05-15 14:41:35'),
('Le Fabuleux Destin d''Amélie Poulain', 122, 'Français', FALSE, 'Jean-Pierre Jeunet', 'Audrey Tautou, Mathieu Kassovitz', 'Une jeune serveuse décide de changer la vie des gens qui l''entourent tout en luttant contre sa propre solitude.', '0+', 'Comédie romantique', 'https://m.media-amazon.com/images/I/613ypTLZHsL._SY445_.jpg', '2025-05-15 14:41:35');

INSERT INTO Programmation (filmid, cinemaid, date_debut, date_fin, jour_1, jour_2, jour_3, heure_debut, created_at) VALUES
(1, 1, '2025-05-20', '2025-06-10', 'Lundi', 'Mercredi', 'Vendredi', '20:00:00', '2025-05-15 14:41:35'),
(2, 2, '2025-05-22', '2025-06-15', 'Mardi', 'Jeudi', 'Samedi', '18:30:00', '2025-05-15 14:41:35');
