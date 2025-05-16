import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

interface Film {
    id: number;
    titre: string;
    duree: string;
    langue: string;
    sous_titres: boolean;
    realisateur: string;
    acteurs_principaux: string;
    synopsis: string;
    age_minimum: number;
    genres: string;
    poster: string;
}

interface Programmation {
    id: number;
    filmid: number;
    date_debut: string;
    date_fin: string;
    jour_1: boolean;
    jour_2: boolean;
    jour_3: boolean;
    heure_debut: string;
    film_titre: string;
}

const AdminPage: React.FC = () => {
    const [films, setFilms] = useState<Film[]>([]);
    const [programmations, setProgrammations] = useState<Programmation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Récupérer l'utilisateur depuis le token
                const userResponse = await fetch('http://localhost:8000/auth/verify', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!userResponse.ok) {
                    throw new Error('Erreur lors de la vérification du token');
                }

                const userData = await userResponse.json();
                const cinemaId = userData.user.id;

                const [filmsRes] = await Promise.all([
                    fetch(`http://localhost:8000/public/cinemas/${cinemaId}/films`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }),
                ]);

                if (!filmsRes.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }

                const filmsData = await filmsRes.json();

                setFilms(filmsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleDeleteProgrammation = async (id: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette programmation ?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8200/programmations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de la programmation');
            }

            // Mettre à jour la liste des programmations
            setProgrammations(prev => prev.filter(prog => prog.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression');
        }
    };

    if (isLoading) {
        return <div className="admin-loading">Chargement...</div>;
    }

    if (error) {
        return <div className="admin-error">{error}</div>;
    }

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Administration Cinéma</h1>
                <button onClick={handleLogout} className="logout-button">
                    Déconnexion
                </button>
            </header>

            <div className="admin-content">
                <section className="films-section">
                    <div className="section-header">
                        <h2>Films</h2>
                        <button className="add-button" onClick={() => navigate('/admin/films/new')}>
                            Ajouter un film
                        </button>
                    </div>
                    <div className="films-grid">
                        {films.map(film => (
                            <div key={film.id} className="film-card">
                                <img src={film.poster} alt={film.titre} className="film-poster" />
                                <div className="film-info">
                                    <h3>{film.titre}</h3>
                                    <p>Durée: {film.duree}</p>
                                    <p>Réalisateur: {film.realisateur}</p>
                                    <div className="film-actions">
                                        <button onClick={() => navigate(`/admin/films/${film.id}/edit`)}>
                                            Modifier
                                        </button>
                                        <button onClick={() => navigate(`/admin/films/${film.id}/programmation`)}>
                                            Programmer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="programmations-section">
                    <h2>Programmations</h2>
                    <div className="programmations-list">
                        {programmations.map(prog => (
                            <div key={prog.id} className="programmation-card">
                                <h3>{prog.film_titre}</h3>
                                <p>Du {new Date(prog.date_debut).toLocaleDateString()} au {new Date(prog.date_fin).toLocaleDateString()}</p>
                                <p>Horaires: {prog.heure_debut}</p>
                                <p>Jours: {[
                                    prog.jour_1 ? 'Lundi' : null,
                                    prog.jour_2 ? 'Mercredi' : null,
                                    prog.jour_3 ? 'Vendredi' : null
                                ].filter(Boolean).join(', ')}</p>
                                <div className="programmation-actions">
                                    <button onClick={() => navigate(`/admin/programmations/${prog.id}/edit`)}>
                                        Modifier
                                    </button>
                                    <button className="delete-button" onClick={() => handleDeleteProgrammation(prog.id)}>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminPage; 