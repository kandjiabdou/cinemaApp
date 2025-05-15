import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Port de l'API Gateway

// Configuration d'Axios
axios.interceptors.request.use(request => {
  console.log('Requête sortante:', request);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Réponse reçue:', response);
    return response;
  },
  error => {
    console.error('Erreur de requête:', error.response || error);
    return Promise.reject(error);
  }
);

export interface Movie {
  id: number;
  titre: string; // Changé de title à titre selon la doc
  synopsis: string; // Changé de description à synopsis
  duree: number; // Changé de duration à duree
  imageUrl?: string; // Optionnel car non mentionné dans la doc
  date_sortie?: string; // Optionnel car non mentionné dans la doc
  langue: string;
  sous_titres: boolean;
  realisateur: string;
  acteurs_principaux: string;
  age_minimum: string;
  genres: string;
}

export interface Cinema {
  id: number;
  nom: string; // Changé de name à nom
  adresse: string;
  ville: string;
  email: string;
  login: string;
}

export interface Ville {
  id: number;
  nom: string;
}

const api = {
  // Films (via le service public)
  getMovies: async (ville?: string): Promise<Movie[]> => {
    const url = ville 
      ? `${API_BASE_URL}/public/films/ville/${ville}`
      : `${API_BASE_URL}/public/films`;
    const response = await axios.get(url);
    return response.data;
  },

  getMovie: async (id: number): Promise<Movie> => {
    const response = await axios.get(`${API_BASE_URL}/public/films/${id}`);
    return response.data;
  },

  searchMovies: async (query: string): Promise<Movie[]> => {
    const response = await axios.get(`${API_BASE_URL}/public/films/recherche/${query}`);
    return response.data;
  },

  // Villes
  getVilles: async (): Promise<Ville[]> => {
    const response = await axios.get(`${API_BASE_URL}/public/villes`);
    return response.data;
  },

  // Cinémas (via le service d'authentification)
  registerCinema: async (cinemaData: Omit<Cinema, 'id'> & { mot_de_passe: string }): Promise<{ token: string }> => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, cinemaData);
    return response.data;
  },

  loginCinema: async (login: string, mot_de_passe: string): Promise<{ token: string }> => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { login, mot_de_passe });
    return response.data;
  },

  // Gestion des films (via le service cinéma, nécessite un token)
  addMovie: async (movieData: Omit<Movie, 'id'>, token: string): Promise<Movie> => {
    const response = await axios.post(`${API_BASE_URL}/cinema/films`, movieData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateMovie: async (id: number, movieData: Partial<Movie>, token: string): Promise<Movie> => {
    const response = await axios.put(`${API_BASE_URL}/cinema/films/${id}`, movieData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default api; 