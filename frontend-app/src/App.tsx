import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Film, Building, LogIn, Home } from 'lucide-react';

import CinemasPage from './pages/CinemasPage';
import CinemaMoviesPage from './pages/CinemaMoviesPage';
import CinemaFilmDetailsPage from './pages/CinemaFilmDetailsPage';
import MoviesPage from './pages/MoviesPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import AddMoviePage from './pages/AddMoviePage';
import EditMoviePage from './pages/EditMoviePage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const Navigation: React.FC = () => {
    const location = useLocation();
    
    if (location.pathname === '/login') {
        return null;
    }

    return (
        <nav className="nav-menu">
            <Link to="/" className="nav-logo">
                <Home size={20} style={{ marginRight: '8px' }} />
                Cinéma App
            </Link>
            <div className="nav-links">
                <Link to="/cinemas">
                    <Building size={18} style={{ marginRight: '5px' }} />
                    Cinémas
                </Link>
                <Link to="/films">
                    <Film size={18} style={{ marginRight: '5px' }} />
                    Films
                </Link>
            </div>
        </nav>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
        <div className="app">
            <Navigation />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/films" replace />} />
                <Route path="/cinemas" element={
                    <Layout>
                        <CinemasPage />
                    </Layout>
                } />
                <Route path="/cinemas/:cinemaId/films" element={
                    <Layout>
                        <CinemaMoviesPage />
                    </Layout>
                } />
                <Route path="/cinemas/:cinemaId/films/:filmId" element={
                    <Layout>
                        <CinemaFilmDetailsPage />
                    </Layout>
                } />
                <Route path="/films" element={
                    <Layout>
                        <MoviesPage />
                    </Layout>
                } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin/*" element={
                    <ProtectedRoute showMenu={true}>
                        <Layout>
                            <AdminPage />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/films/new" element={
                    <ProtectedRoute showMenu={true}>
                        <Layout>
                            <AddMoviePage />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/films/:filmId/edit" element={
                    <ProtectedRoute showMenu={true}>
                        <Layout>
                            <EditMoviePage />
                        </Layout>
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
  );
};

export default App;
