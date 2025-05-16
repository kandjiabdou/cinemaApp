import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { Movie, Cinema } from '../services/api';
import MovieCard from '../components/MovieCard';
import './CinemaMoviesPage.css';

const CinemaMoviesPage: React.FC = () => {
    const { cinemaId } = useParams<{ cinemaId: string }>();
    const navigate = useNavigate();
    const [cinema, setCinema] = useState<Cinema | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCinemaAndMovies = async () => {
            if (!cinemaId) return;

            try {
                setLoading(true);
                // Récupérer les informations du cinéma
                const cinemas = await api.getCinemas();
                const cinemaData = cinemas.find(c => c.id === parseInt(cinemaId));
                
                if (!cinemaData) {
                    throw new Error('Cinéma non trouvé');
                }
                
                setCinema(cinemaData);

                // Récupérer les films du cinéma
                const moviesData = await api.getCinemaMovies(parseInt(cinemaId));
                setMovies(moviesData);
                setError(null);
            } catch (err: any) {
                console.error('Erreur détaillée:', err);
                const errorMessage = err.response 
                    ? `Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur serveur'}`
                    : 'Erreur de connexion au serveur';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchCinemaAndMovies();
    }, [cinemaId]);

    if (loading) {
        return (
            <div className="cinema-movies-loading">
                <p>Chargement des films en cours...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cinema-movies-error">
                <h3>Une erreur est survenue</h3>
                <p>{error}</p>
                <button 
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (!cinema) {
        return (
            <div className="cinema-movies-error">
                <h3>Cinéma non trouvé</h3>
                <p>Le cinéma que vous recherchez n'existe pas.</p>
                <button 
                    className="retry-button"
                    onClick={() => navigate('/cinemas')}
                >
                    Retour aux cinémas
                </button>
            </div>
        );
    }

    return (
        <div className="cinema-movies-page">
            <div className="cinema-header">
                <h2>{cinema.nom}</h2>
                <div className="cinema-details">
                    <p><strong>Adresse :</strong> {cinema.adresse}</p>
                    <p><strong>Ville :</strong> {cinema.ville}</p>
                </div>
            </div>

            <h3>Films à l'affiche</h3>
            
            {movies.length === 0 ? (
                <div className="no-movies-container">
                    <h3>Aucun film disponible</h3>
                    <p>Ce cinéma n'a pas de films programmés pour le moment.</p>
                </div>
            ) : (
                <div className="movies-grid">
                    {movies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            {...movie}
                            onClick={() => navigate(`/cinemas/${cinemaId}/films/${movie.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CinemaMoviesPage; 