const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export const API_URL = `http://${host}:8080`;
