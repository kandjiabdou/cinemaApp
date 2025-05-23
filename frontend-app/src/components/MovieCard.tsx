import React from 'react';

interface MovieCardProps {
  id: number;
  titre: string;
  synopsis: string;
  duree: number;
  poster?: string;
  date_sortie?: string;
  langue: string;
  sous_titres: boolean;
  realisateur: string;
  acteurs_principaux: string;
  age_minimum: string;
  genres: string;
  onClick?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({
  titre,
  synopsis,
  duree,
  poster,
  date_sortie,
  langue,
  sous_titres,
  realisateur,
  acteurs_principaux,
  age_minimum,
  genres,
  onClick
}) => {
  return (
    <div className="movie-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="movie-image">
        <img src={poster || '/default-movie.jpg'} alt={titre} />
      </div>
      <div className="movie-info">
        <h3>{titre}</h3>
        <p className="movie-description">{synopsis}</p>
        <div className="movie-details">
          <div className="movie-meta">
            <span>Durée: {duree} min</span>
            {date_sortie && (
              <span>Sortie: {new Date(date_sortie).toLocaleDateString('fr-FR')}</span>
            )}
          </div>
          <div className="movie-meta">
            <span>Langue: {langue}</span>
            {sous_titres && <span>Sous-titré</span>}
          </div>
          <div className="movie-meta">
            <span>Réalisateur: {realisateur}</span>
            <span>Acteurs: {acteurs_principaux}</span>
          </div>
          <div className="movie-meta">
            <span>Âge minimum: {age_minimum} ans</span>
            <span>Genres: {genres}</span>
          </div>
        </div>
        {!onClick && <button className="reserve-button">Réserver</button>}
      </div>
    </div>
  );
};

export default MovieCard; 