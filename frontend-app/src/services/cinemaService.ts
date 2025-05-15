import axios from 'axios';

const API_URL = 'http://localhost:8000'; // URL de l'API Gateway

export interface Cinema {
    id: number;
    nom: string;
    adresse: string;
    ville: string;
}

export interface Movie {
    id: number;
    titre: string;
    synopsis: string;
    duree: number;
    realisateur: string;
    acteurs_principaux: string;
    genres: string;
    langue: string;
    sous_titres: boolean;
    age_minimum: number;
    poster: string;
}

export interface Screening {
    id: number;
    filmid: number;
    date_debut: string;
    date_fin: string;
    jour_1: boolean;
    jour_2: boolean;
    jour_3: boolean;
    heure_debut: string;
    cinema: {
        nom: string;
        adresse: string;
        ville: string;
    };
}

export const cinemaService = {
    getAllCinemas: async (): Promise<Cinema[]> => {
        const response = await axios.get(`${API_URL}/public/films`);
        // Extraire les cinémas uniques des films
        const cinemas = response.data.reduce((acc: Cinema[], film: any) => {
            if (film.cinema_nom && !acc.find(c => c.nom === film.cinema_nom)) {
                acc.push({
                    id: film.cinemaid,
                    nom: film.cinema_nom,
                    adresse: film.adresse,
                    ville: film.ville
                });
            }
            return acc;
        }, []);
        return cinemas;
    },

    getAllMovies: async (): Promise<Movie[]> => {
        const response = await axios.get(`${API_URL}/public/films`);
        return response.data;
    },

    getMoviesByCinema: async (cinemaName: string): Promise<Movie[]> => {
        const response = await axios.get(`${API_URL}/public/films`);
        return response.data.filter((film: any) => film.cinema_nom === cinemaName);
    },

    getScreeningsByMovie: async (movieId: number): Promise<Screening[]> => {
        const response = await axios.get(`${API_URL}/public/films/${movieId}`);
        return response.data.programmations;
    }
};

export default cinemaService; 