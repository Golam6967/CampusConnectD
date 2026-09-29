// Backend origin. Set VITE_API_URL in Vercel (e.g. https://campusconnect-api.onrender.com); no trailing slash.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
