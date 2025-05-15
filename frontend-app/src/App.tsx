import React, { useState } from 'react';
import './App.css';
import CinemaList from './components/CinemaList';
import AllMovies from './components/AllMovies';

function App() {
  const [activeTab, setActiveTab] = useState<'cinemas' | 'films'>('cinemas');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cinema App</h1>
        <div className="tabs">
          <button 
            className={activeTab === 'cinemas' ? 'active' : ''} 
            onClick={() => setActiveTab('cinemas')}
          >
            Cinémas et Séances
          </button>
          <button 
            className={activeTab === 'films' ? 'active' : ''} 
            onClick={() => setActiveTab('films')}
          >
            Tous les Films
          </button>
        </div>
      </header>
      <main>
        {activeTab === 'cinemas' ? <CinemaList /> : <AllMovies />}
      </main>
      <footer>
        <p>&copy; 2024 Cinema App - Tous droits réservés</p>
      </footer>
    </div>
  );
}

export default App;