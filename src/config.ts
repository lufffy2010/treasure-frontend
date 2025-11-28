// API URL configuration
// In development, we use the relative path /api which is proxied by Vite to localhost:3001
// In production, we use the full Railway URL

const isDevelopment = import.meta.env.DEV;

export const API_URL = isDevelopment
    ? '' // Empty string means use relative path (proxied)
    : 'https://treasure-backen-production.up.railway.app'; // Full Railway URL for production

export const getApiUrl = (endpoint: string) => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    if (isDevelopment) {
        return `/${cleanEndpoint}`;
    }

    return `${API_URL}/${cleanEndpoint}`;
};
