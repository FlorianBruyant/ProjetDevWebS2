// Si on est sur Vercel, il prend la variable d'env.
// Sinon (en local), il prend localhost.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default API_BASE_URL;
