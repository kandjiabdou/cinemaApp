import React, { useEffect, useState } from 'react';
import { Cinema, Movie, Screening, cinemaService } from '../services/cinemaService';
import './CinemaList.css';

const CinemaList: React.FC = () => {
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [screenings, setScreenings] = useState<{ [movieId: number]: Screening[] }>({});

    useEffect(() => {
        loadCinemas();
    }, []);

    useEffect(() => {
        if (selectedCinema) {
            loadMovies(selectedCinema.nom);
        }
    }, [selectedCinema]);

    const loadCinemas = async () => {
        try {
            const data = await cinemaService.getAllCinemas();
            setCinemas(data);
        } catch (error) {
            console.error('Error loading cinemas:', error);
        }
    };

    const loadMovies = async (cinemaName: string) => {
        try {
            const moviesData = await cinemaService.getMoviesByCinema(cinemaName);
            setMovies(moviesData);
            
            const screeningsData: { [movieId: number]: Screening[] } = {};
            for (const movie of moviesData) {
                const movieScreenings = await cinemaService.getScreeningsByMovie(movie.id);
                screeningsData[movie.id] = movieScreenings;
            }
            setScreenings(screeningsData);
        } catch (error) {
            console.error('Error loading movies and screenings:', error);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    const formatTime = (time: string) => {
        return time.substring(0, 5); // Affiche seulement HH:MM
    };

    return (
        <div className="cinema-container">
            <div className="cinema-list">
                <h2>Choisissez un cinéma :</h2>
                <div className="cinema-buttons">
                    {cinemas.map((cinema) => (
                        <button
                            key={cinema.id}
                            className={selectedCinema?.id === cinema.id ? 'selected' : ''}
                            onClick={() => setSelectedCinema(cinema)}
                        >
                            {cinema.nom}
                        </button>
                    ))}
                </div>
            </div>

            {selectedCinema && (
                <div className="cinema-details">
                    <h3>{selectedCinema.nom}</h3>
                    <p className="cinema-address">{selectedCinema.adresse}, {selectedCinema.ville}</p>
                    
                    <div className="movies-grid">
                        {movies.map((movie) => (
                            <div key={movie.id} className="movie-card">
                                <h4>{movie.titre}</h4>
                                <p className="duration">{movie.duree} minutes</p>
                                <div className="screenings">
                                    <h5>Séances :</h5>
                                    {screenings[movie.id]?.map(screening => (
                                        <div key={screening.id} className="screening">
                                            {formatDate(screening.date_debut)} à {formatTime(screening.heure_debut)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CinemaList; 