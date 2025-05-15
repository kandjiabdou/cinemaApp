import React, { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import api, { Movie, Ville } from '../services/api';

const MoviesPage: React.FC = () => {
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
        
        if (searchQuery) {
          data = await api.searchMovies(searchQuery);
        } else {
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
  }, [selectedVille, searchQuery]);

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
          <select value={selectedVille} onChange={handleVilleChange}>
            {villes.map(ville => (
              <option key={ville.id} value={ville.nom}>
                {ville.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h2>Films à l'affiche {selectedVille && `à ${selectedVille}`}</h2>
      
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