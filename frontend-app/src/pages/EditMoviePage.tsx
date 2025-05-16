import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './AddMoviePage.css'; // Réutilisation des styles

const EditMoviePage: React.FC = () => {
    const navigate = useNavigate();
    const { filmId } = useParams<{ filmId: string }>();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        titre: '',
        synopsis: '',
        duree: '',
        langue: '',
        sous_titres: false,
        realisateur: '',
        acteurs_principaux: '',
        age_minimum: '',
        genres: '',
        poster: ''
    });

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Non authentifié');
                }

                const movieId = parseInt(filmId || '0', 10);
                if (isNaN(movieId)) {
                    throw new Error('ID de film invalide');
                }

                const movie = await api.getMovie(movieId, token);
                
                // Conversion des données du film pour le formulaire
                setFormData({
                    titre: movie.titre || '',
                    synopsis: movie.synopsis || '',
                    duree: movie.duree?.toString() || '',
                    langue: movie.langue || '',
                    sous_titres: movie.sous_titres || false,
                    realisateur: movie.realisateur || '',
                    acteurs_principaux: typeof movie.acteurs_principaux === 'string' 
                        ? movie.acteurs_principaux 
                        : Array.isArray(movie.acteurs_principaux) 
                            ? movie.acteurs_principaux.join(', ') 
                            : '',
                    age_minimum: movie.age_minimum || '',
                    genres: typeof movie.genres === 'string'
                        ? movie.genres
                        : Array.isArray(movie.genres)
                            ? movie.genres.join(', ')
                            : '',
                    poster: movie.poster || ''
                });
            } catch (err: any) {
                console.error('Erreur:', err);
                setError(err.response?.data?.message || 'Erreur lors du chargement du film');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchMovie();
    }, [filmId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Non authentifié');
            }

            const movieId = parseInt(filmId || '0', 10);
            if (isNaN(movieId)) {
                throw new Error('ID de film invalide');
            }

            // Conversion des types et des données
            const movieData = {
                ...formData,
                duree: parseInt(formData.duree, 10),
                acteurs_principaux: formData.acteurs_principaux.includes(',') 
                    ? formData.acteurs_principaux.split(',').map(actor => actor.trim())
                    : formData.acteurs_principaux,
                genres: formData.genres.includes(',')
                    ? formData.genres.split(',').map(genre => genre.trim())
                    : formData.genres
            };

            await api.updateMovie(movieId, movieData, token);
            setSuccess('Film mis à jour avec succès !');
            setTimeout(() => navigate('/admin/films'), 1500);
        } catch (err: any) {
            console.error('Erreur:', err);
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour du film');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="add-movie-page">
                <div className="add-movie-container">
                    <div className="loading-message">Chargement du film...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="add-movie-page">
            <div className="add-movie-container">
                <h1>Modifier le film</h1>

                {error && (
                    <div className="add-movie-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="add-movie-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="add-movie-form">
                    <div className="form-group">
                        <label htmlFor="titre">Titre</label>
                        <input
                            type="text"
                            id="titre"
                            name="titre"
                            value={formData.titre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="synopsis">Synopsis</label>
                        <textarea
                            id="synopsis"
                            name="synopsis"
                            value={formData.synopsis}
                            onChange={handleChange}
                            required
                            rows={4}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="duree">Durée (minutes)</label>
                            <input
                                type="number"
                                id="duree"
                                name="duree"
                                value={formData.duree}
                                onChange={handleChange}
                                required
                                min="1"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="langue">Langue</label>
                            <select
                                id="langue"
                                name="langue"
                                value={formData.langue}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Sélectionner une langue</option>
                                <option value="FR">Français</option>
                                <option value="VO">Version Originale</option>
                                <option value="VOST">Version Originale Sous-titrée</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="sous_titres"
                                checked={formData.sous_titres}
                                onChange={handleChange}
                            />
                            Sous-titres disponibles
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="realisateur">Réalisateur</label>
                        <input
                            type="text"
                            id="realisateur"
                            name="realisateur"
                            value={formData.realisateur}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="acteurs_principaux">Acteurs principaux</label>
                        <input
                            type="text"
                            id="acteurs_principaux"
                            name="acteurs_principaux"
                            value={formData.acteurs_principaux}
                            onChange={handleChange}
                            required
                            placeholder="Séparés par des virgules"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="age_minimum">Âge minimum</label>
                            <select
                                id="age_minimum"
                                name="age_minimum"
                                value={formData.age_minimum}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Sélectionner</option>
                                <option value="Tout public">Tout public</option>
                                <option value="-10">-10 ans</option>
                                <option value="-12">-12 ans</option>
                                <option value="-16">-16 ans</option>
                                <option value="-18">-18 ans</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="genres">Genres</label>
                            <input
                                type="text"
                                id="genres"
                                name="genres"
                                value={formData.genres}
                                onChange={handleChange}
                                required
                                placeholder="Séparés par des virgules"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="poster">URL de l'affiche</label>
                        <input
                            type="url"
                            id="poster"
                            name="poster"
                            value={formData.poster}
                            onChange={handleChange}
                            required
                            placeholder="https://exemple.com/image.jpg"
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate('/admin/films')}
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? 'Mise à jour en cours...' : 'Mettre à jour le film'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMoviePage; 