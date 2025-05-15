import React, { useEffect, useState } from 'react';
import { Movie, cinemaService } from '../services/cinemaService';
import './AllMovies.css';

const AllMovies: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);

    useEffect(() => {
        loadMovies();
    }, []);

    const loadMovies = async () => {
        try {
            const response = await cinemaService.getAllMovies();
            setMovies(response);
        } catch (error) {
            console.error('Error loading movies:', error);
        }
    };

    return (
        <div className="all-movies">
            <h2>Tous les Films</h2>
            <div className="movies-grid">
                {movies.map((movie) => (
                    <div key={movie.id} className="movie-card">
                        <h3>{movie.titre}</h3>
                        <p className="duration">{movie.duree} minutes</p>
                        <p className="synopsis">{movie.synopsis}</p>
                        <div className="movie-details">
                            <p>Réalisateur: {movie.realisateur}</p>
                            <p>Genre: {movie.genres}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllMovies; 