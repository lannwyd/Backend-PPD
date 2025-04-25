// auth.js - Updated version
const API_BASE = 'http://localhost:5000/auth';

// Store token in cookies
function setAuthToken(token) {
    document.cookie = `jwt=${token}; path=/; max-age=${24 * 60 * 60}; Secure; SameSite=Strict`;
}

async function checkAuth() {
    try {
        const res = await fetch(`${API_BASE}/check-auth`, {
            credentials: 'include'
        });

        if (!res.ok) {
            if (res.status === 401) {
                return null;
            }
            throw new Error('Auth check failed');
        }

        return await res.json();
    } catch (err) {
        console.error('Auth check error:', err);
        return null;
    }
}

// Helper to get cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Logout function
function logout() {
    document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login.html';
}