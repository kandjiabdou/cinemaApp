import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AddMoviePage.css';

interface MovieFormData {
    titre: string;
    duree: string;
    langue: string;
    sous_titres: boolean;
    realisateur: string;
    acteurs_principaux: string;
    synopsis: string;
    age_minimum: string;
    genres: string;
    poster: string;
    date_debut: string;
    date_fin: string;
    jour_1: boolean;
    jour_2: boolean;
    jour_3: boolean;
    heure_debut: string;
}

const AddMoviePage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState<MovieFormData>({
        titre: '',
        duree: '',
        langue: '',
        sous_titres: false,
        realisateur: '',
        acteurs_principaux: '',
        synopsis: '',
        age_minimum: '',
        genres: '',
        poster: '',
        date_debut: new Date().toISOString().split('T')[0],
        date_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        jour_1: true,
        jour_2: true,
        jour_3: true,
        heure_debut: '20:00'
    });

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

            // Conversion des types
            const movieData = {
                ...formData,
                duree: parseInt(formData.duree, 10),
                age_minimum: formData.age_minimum
            };

            await api.addMovie(movieData, token);
            setSuccess('Film ajouté avec succès !');
            setTimeout(() => navigate('/admin/films'), 1500);
        } catch (err: any) {
            console.error('Erreur:', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'ajout du film');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-movie-page">
            <div className="add-movie-container">
                <h1>Ajouter un nouveau film</h1>

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
                    <div className="form-section">
                        <h3>Informations du film</h3>
                        <div className="form-row">
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
                                <label htmlFor="duree">Durée (format: 2h30)</label>
                                <input
                                    type="text"
                                    id="duree"
                                    name="duree"
                                    value={formData.duree}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
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
                                <label htmlFor="langue">Langue</label>
                                <select
                                    id="langue"
                                    name="langue"
                                    value={formData.langue}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Sélectionner une langue</option>
                                    <option value="Français">Français</option>
                                    <option value="VO">Version Originale</option>
                                    <option value="VOST">Version Originale Sous-titrée</option>
                                </select>
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
                        </div>

                        <div className="form-row">
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
                    </div>

                    <div className="form-section">
                        <h3>Programmation</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="date_debut">Date de début</label>
                                <input
                                    type="date"
                                    id="date_debut"
                                    name="date_debut"
                                    value={formData.date_debut}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="date_fin">Date de fin</label>
                                <input
                                    type="date"
                                    id="date_fin"
                                    name="date_fin"
                                    value={formData.date_fin}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Jours de diffusion</label>
                            <div className="checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="jour_1"
                                        checked={formData.jour_1}
                                        onChange={handleChange}
                                    />
                                    Lundi
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="jour_2"
                                        checked={formData.jour_2}
                                        onChange={handleChange}
                                    />
                                    Mercredi
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="jour_3"
                                        checked={formData.jour_3}
                                        onChange={handleChange}
                                    />
                                    Vendredi
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="heure_debut">Heure de début</label>
                            <input
                                type="time"
                                id="heure_debut"
                                name="heure_debut"
                                value={formData.heure_debut}
                                onChange={handleChange}
                                required
                            />
                        </div>
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
                            {loading ? 'Ajout en cours...' : 'Ajouter le film'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMoviePage; 