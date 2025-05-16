import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FilmForm.css';

interface FilmFormData {
    titre: string;
    duree: string;
    langue: string;
    sous_titres: boolean;
    realisateur: string;
    acteurs_principaux: string;
    synopsis: string;
    age_minimum: number;
    genres: string;
    poster: File | null;
}

const FilmForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FilmFormData>({
        titre: '',
        duree: '',
        langue: '',
        sous_titres: false,
        realisateur: '',
        acteurs_principaux: '',
        synopsis: '',
        age_minimum: 0,
        genres: '',
        poster: null
    });

    useEffect(() => {
        if (id) {
            fetchFilm();
        }
    }, [id]);

    const fetchFilm = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8200/films/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du film');
            }

            const film = await response.json();
            setFormData({
                ...film,
                poster: null // On ne récupère pas le fichier, seulement l'URL
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({
                ...prev,
                poster: e.target.files![0]
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();

            // Ajouter tous les champs au FormData
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null) {
                    formDataToSend.append(key, value.toString());
                }
            });

            const url = id ? `http://localhost:8200/films/${id}` : 'http://localhost:8200/films';
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'enregistrement du film');
            }

            navigate('/admin');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="film-form-container">
            <h2>{id ? 'Modifier le film' : 'Ajouter un film'}</h2>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit} className="film-form">
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

                <div className="form-group">
                    <label htmlFor="langue">Langue</label>
                    <input
                        type="text"
                        id="langue"
                        name="langue"
                        value={formData.langue}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group checkbox">
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
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="age_minimum">Âge minimum</label>
                    <input
                        type="number"
                        id="age_minimum"
                        name="age_minimum"
                        value={formData.age_minimum}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="genres">Genres (séparés par des virgules)</label>
                    <input
                        type="text"
                        id="genres"
                        name="genres"
                        value={formData.genres}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="poster">Affiche du film</label>
                    <input
                        type="file"
                        id="poster"
                        name="poster"
                        onChange={handleFileChange}
                        accept="image/*"
                        required={!id}
                    />
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/admin')} className="cancel-button">
                        Annuler
                    </button>
                    <button type="submit" disabled={isLoading} className="submit-button">
                        {isLoading ? 'Enregistrement...' : (id ? 'Modifier' : 'Ajouter')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FilmForm; 