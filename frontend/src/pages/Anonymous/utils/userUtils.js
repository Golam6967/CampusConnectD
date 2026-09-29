// Helper to safely parse JWT token without a library
export const decodeJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

// Get or create a unique user ID
export const getAnonymousUserId = () => {
    // 1. Check if user is logged in via token (highest priority)
    const token = sessionStorage.getItem('authToken');
    if (token) {
        const decoded = decodeJwt(token);
        // The backend JWT uses `user_id` or the user might be in session
        console.log(decoded)
        if (decoded && decoded.user_id) return String(decoded.user_id);
    }

    // 2. Check if user object is in session storage
    try {
        const userStr = sessionStorage.getItem('user');
        console.log(userStr)
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.user_id) return String(user.user_id);
            if (user && user.users_id) return String(user.users_id);
            if (user && user.id) return String(user.id);
        }
    } catch (e) {
        console.error("Failed to parse user from session storage", e);
    }

    // 3. Fallback to generating a local anonymous ID
    const STORAGE_KEY = 'anonymous_user_id';
    let userId = localStorage.getItem(STORAGE_KEY);

    if (!userId) {
        // Generate a unique ID using timestamp and random string
        userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(STORAGE_KEY, userId);
    }

    return userId;
};
