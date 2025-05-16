import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProgrammationForm.css';

interface ProgrammationFormData {
    filmid: number;
    date_debut: string;
    date_fin: string;
    jour_1: boolean;
    jour_2: boolean;
    jour_3: boolean;
    heure_debut: string;
}

interface Film {
    id: number;
    titre: string;
}

const ProgrammationForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [films, setFilms] = useState<Film[]>([]);
    const [formData, setFormData] = useState<ProgrammationFormData>({
        filmid: 0,
        date_debut: '',
        date_fin: '',
        jour_1: false,
        jour_2: false,
        jour_3: false,
        heure_debut: ''
    });

    useEffect(() => {
        fetchFilms();
        if (id) {
            fetchProgrammation();
        }
    }, [id]);

    const fetchFilms = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8200/films', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des films');
            }

            const filmsData = await response.json();
            setFilms(filmsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    };

    const fetchProgrammation = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8200/programmations/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération de la programmation');
            }

            const programmation = await response.json();
            setFormData({
                ...programmation,
                date_debut: new Date(programmation.date_debut).toISOString().split('T')[0],
                date_fin: new Date(programmation.date_fin).toISOString().split('T')[0]
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const url = id ? `http://localhost:8200/programmations/${id}` : 'http://localhost:8200/programmations';
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'enregistrement de la programmation');
            }

            navigate('/admin');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="programmation-form-container">
            <h2>{id ? 'Modifier la programmation' : 'Ajouter une programmation'}</h2>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit} className="programmation-form">
                <div className="form-group">
                    <label htmlFor="filmid">Film</label>
                    <select
                        id="filmid"
                        name="filmid"
                        value={formData.filmid}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Sélectionner un film</option>
                        {films.map(film => (
                            <option key={film.id} value={film.id}>
                                {film.titre}
                            </option>
                        ))}
                    </select>
                </div>

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

                <div className="form-group checkbox-group">
                    <label>Jours de diffusion</label>
                    <div className="checkbox-container">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="jour_1"
                                checked={formData.jour_1}
                                onChange={handleChange}
                            />
                            Lundi
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="jour_2"
                                checked={formData.jour_2}
                                onChange={handleChange}
                            />
                            Mercredi
                        </label>
                        <label className="checkbox-label">
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

export default ProgrammationForm; 