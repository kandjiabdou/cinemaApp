import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    showMenu?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, showMenu = true }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');

    if (!token) {
        // Rediriger vers la page de login en sauvegardant la page d'origine
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si l'utilisateur est authentifié mais que showMenu est false, on ne montre que le contenu
    if (!showMenu) {
        return <>{children}</>;
    }

    // Sinon, on montre le contenu normal avec le menu
    return <>{children}</>;
};

export default ProtectedRoute; 