import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { Cinema } from '../services/api';
import './CinemasPage.css';

const CinemasPage: React.FC = () => {
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCinemas();
    }, []);

    const fetchCinemas = async () => {
        try {
            const data = await api.getCinemas();
            setCinemas(data);
            setError(null);
        } catch (err) {
            console.error('Erreur lors du chargement des cinémas:', err);
            setError('Une erreur est survenue lors du chargement des cinémas');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="cinemas-loading">Chargement des cinémas...</div>;
    }

    if (error) {
        return (
            <div className="cinemas-error">
                <h3>Une erreur est survenue</h3>
                <p>{error}</p>
                <button className="retry-button" onClick={fetchCinemas}>
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="cinemas-container">
            <h2>Nos Cinémas</h2>
            {cinemas.length === 0 ? (
                <div className="no-cinemas-container">
                    <h3>Aucun cinéma disponible</h3>
                    <p>Veuillez réessayer ultérieurement</p>
                </div>
            ) : (
                <div className="cinemas-grid">
                    {cinemas.map(cinema => (
                        <div key={cinema.id} className="cinema-card" onClick={() => navigate(`/cinemas/${cinema.id}/films`)}>
                            <h3>{cinema.nom}</h3>
                            <div className="cinema-info">
                                <p><strong>Adresse :</strong> {cinema.adresse}</p>
                                <p><strong>Ville :</strong> {cinema.ville} {cinema.code_postal}</p>
                                <p><strong>Téléphone :</strong> {cinema.telephone}</p>
                                <p><strong>Email :</strong> {cinema.email}</p>
                            </div>
                            <button className="view-films-button">
                                Voir les films
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CinemasPage; 