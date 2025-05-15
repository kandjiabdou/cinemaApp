import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import MoviesPage from './pages/MoviesPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Cinema App</h1>
          <nav>
            <ul>
              <li><Link to="/films">Films</Link></li>
              <li><Link to="/seances">Séances</Link></li>
              <li><Link to="/reservations">Réservations</Link></li>
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/films" replace />} />
            <Route path="/films" element={<MoviesPage />} />
            <Route path="/seances" element={
              <div className="page-container">
                <h2>Séances</h2>
                <p>Page en construction...</p>
              </div>
            } />
            <Route path="/reservations" element={
              <div className="page-container">
                <h2>Réservations</h2>
                <p>Page en construction...</p>
              </div>
            } />
          </Routes>
        </main>
        <footer>
          <p>&copy; 2024 Cinema App - Tous droits réservés</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;