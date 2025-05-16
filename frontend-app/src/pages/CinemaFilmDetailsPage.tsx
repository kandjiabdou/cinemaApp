import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { Movie } from '../services/api';
import './CinemaFilmDetailsPage.css';

interface FilmDetails extends Movie {
    programmation: {
        date_debut: string;
        date_fin: string;
        jour_1: boolean;
        jour_2: boolean;
        jour_3: boolean;
        heure_debut: string;
    };
}

const CinemaFilmDetailsPage: React.FC = () => {
    const { cinemaId, filmId } = useParams<{ cinemaId: string; filmId: string }>();
    const navigate = useNavigate();
    const [film, setFilm] = useState<FilmDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFilmDetails = async () => {
            if (!cinemaId || !filmId) return;

            try {
                setLoading(true);
                const filmData = await api.getCinemaFilmDetails(parseInt(cinemaId), parseInt(filmId));
                setFilm(filmData);
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

        fetchFilmDetails();
    }, [cinemaId, filmId]);

    if (loading) {
        return (
            <div className="film-details-loading">
                <p>Chargement des détails du film...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="film-details-error">
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

    if (!film) {
        return (
            <div className="film-details-error">
                <h3>Film non trouvé</h3>
                <p>Le film que vous recherchez n'existe pas dans ce cinéma.</p>
                <button 
                    className="retry-button"
                    onClick={() => navigate(`/cinemas/${cinemaId}/films`)}
                >
                    Retour aux films
                </button>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
    };

    const getDays = () => {
        const days = [];
        if (film.programmation.jour_1) days.push('Lundi');
        if (film.programmation.jour_2) days.push('Mercredi');
        if (film.programmation.jour_3) days.push('Vendredi');
        return days.join(', ');
    };

    return (
        <div className="film-details-page">
            <div className="film-header">
                <div className="film-poster">
                    <img src={film.poster || '/default-movie.jpg'} alt={film.titre} />
                </div>
                <div className="film-info">
                    <h1>{film.titre}</h1>
                    <div className="film-meta">
                        <span className="film-duration">{film.duree} min</span>
                        <span className="film-language">{film.langue}</span>
                        {film.sous_titres && <span className="film-subtitles">Sous-titré</span>}
                        <span className="film-age">{film.age_minimum} ans</span>
                    </div>
                    <div className="film-details">
                        <p><strong>Réalisateur :</strong> {film.realisateur}</p>
                        <p><strong>Acteurs :</strong> {film.acteurs_principaux}</p>
                        <p><strong>Genres :</strong> {film.genres}</p>
                        {film.date_sortie && (
                            <p><strong>Date de sortie :</strong> {formatDate(film.date_sortie)}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="film-content">
                <div className="film-synopsis">
                    <h2>Synopsis</h2>
                    <p>{film.synopsis}</p>
                </div>

                <div className="film-schedule">
                    <h2>Horaires de diffusion</h2>
                    <div className="schedule-info">
                        <p><strong>Période :</strong> Du {formatDate(film.programmation.date_debut)} au {formatDate(film.programmation.date_fin)}</p>
                        <p><strong>Jours de diffusion :</strong> {getDays()}</p>
                        <p><strong>Heure de début :</strong> {formatTime(film.programmation.heure_debut)}</p>
                    </div>
                    <button className="reserve-button">
                        Réserver mes places
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CinemaFilmDetailsPage; 