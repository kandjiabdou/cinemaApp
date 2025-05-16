import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        login: '',
        mot_de_passe: '',
        nom: '',
        adresse: '',
        ville: '',
        email: '',
        code_postal: '',
        telephone: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || '/admin';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { token } = await api.loginCinema(formData.login, formData.mot_de_passe);
                localStorage.setItem('token', token);
                setSuccess('Connexion réussie !');
                setTimeout(() => navigate(from, { replace: true }), 1500);
            } else {
                const { token } = await api.registerCinema(formData);
                localStorage.setItem('token', token);
                setSuccess('Inscription réussie ! Vous êtes maintenant connecté.');
                setTimeout(() => navigate(from, { replace: true }), 1500);
            }
        } catch (err: any) {
            console.error('Erreur:', err);
            const errorMessage = err.response?.data?.message || 
                (isLogin ? 'Erreur lors de la connexion' : 'Erreur lors de l\'inscription');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setSuccess(null);
        setFormData({
            login: '',
            mot_de_passe: '',
            nom: '',
            adresse: '',
            ville: '',
            email: '',
            code_postal: '',
            telephone: ''
        });
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1>{isLogin ? 'Connexion' : 'Inscription'}</h1>
                
                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="auth-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="login">Identifiant</label>
                        <input
                            type="text"
                            id="login"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="mot_de_passe">Mot de passe</label>
                        <input
                            type="password"
                            id="mot_de_passe"
                            name="mot_de_passe"
                            value={formData.mot_de_passe}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label htmlFor="nom">Nom du cinéma</label>
                                <input
                                    type="text"
                                    id="nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="adresse">Adresse</label>
                                <input
                                    type="text"
                                    id="adresse"
                                    name="adresse"
                                    value={formData.adresse}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="ville">Ville</label>
                                <input
                                    type="text"
                                    id="ville"
                                    name="ville"
                                    value={formData.ville}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="code_postal">Code postal</label>
                                <input
                                    type="text"
                                    id="code_postal"
                                    name="code_postal"
                                    value={formData.code_postal}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="telephone">Téléphone</label>
                                <input
                                    type="tel"
                                    id="telephone"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
                    </button>
                </form>

                <div className="auth-switch">
                    <p>
                        {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
                        <button 
                            type="button" 
                            onClick={toggleMode}
                            className="switch-button"
                        >
                            {isLogin ? 'S\'inscrire' : 'Se connecter'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 