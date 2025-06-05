import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import api, { Movie, Ville } from '../services/api';
import './MoviesPage.css';

const MoviesPage: React.FC = () => {
    const { cinemaId } = useParams<{ cinemaId: string }>();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [villes, setVilles] = useState<Ville[]>([]);
    const [selectedVille, setSelectedVille] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger la liste des villes
    useEffect(() => {
        const fetchVilles = async () => {
            try {
                const data = await api.getVilles();
                setVilles(data);
                if (data.length > 0) {
                    setSelectedVille(data[0].nom);
                }
            } catch (err) {
                console.error('Erreur lors du chargement des villes:', err);
            }
        };

        fetchVilles();
    }, []);

    // Charger les films
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                let data: Movie[];
                
                if (cinemaId) {
                    // Si on est sur la page d'un cinéma spécifique
                    data = await api.getCinemaMovies(parseInt(cinemaId));
                } else if (searchQuery) {
                    // Si on fait une recherche
                    data = await api.searchMovies(searchQuery);
                } else {
                    // Sinon, on affiche les films de la ville sélectionnée
                    data = await api.getMovies(selectedVille);
                }
                
                setMovies(data);
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

        fetchMovies();
    }, [cinemaId, selectedVille, searchQuery]);

    const handleVilleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVille(event.target.value);
        setSearchQuery(''); // Réinitialiser la recherche lors du changement de ville
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    if (loading && !movies.length) {
        return (
            <div className="loading-container">
                <p>Chargement des films en cours...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
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

    return (
        <div className="movies-page">
            {!cinemaId && (
                <div className="movies-controls">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Rechercher un film..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="ville-selector">
                        <div className="custom-select">
                            <select value={selectedVille} onChange={handleVilleChange} className="select-input">
                                {villes.map(ville => (
                                    <option key={ville.id} value={ville.nom}>
                                        {ville.nom}
                                    </option>
                                ))}
                            </select>
                            <div className="select-arrow">
                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h2>
                {cinemaId 
                    ? 'Films à l\'affiche dans ce cinéma'
                    : `Films à l'affiche ${selectedVille && `à ${selectedVille}`}`
                }
            </h2>
            
            {movies.length === 0 ? (
                <div className="no-movies-container">
                    <h3>Aucun film disponible</h3>
                    <p>Veuillez réessayer avec une autre ville ou une autre recherche</p>
                </div>
            ) : (
                <div className="movies-grid">
                    {movies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            {...movie}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MoviesPage; 